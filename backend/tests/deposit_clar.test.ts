import { Cl, cvToValue } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const CHAINVAULT_V7_CONTRACT = "chainvault-core-v7";
const MOCK_SBTC_CONTRACT = "mock-sbtc-token-v2";

describe("Focused v7 Debugging", () => {
  
  beforeEach(() => {
    // Setup mock sBTC balances
    simnet.callPublicFn(
      MOCK_SBTC_CONTRACT,
      "mint",
      [Cl.uint(100000000), Cl.principal(deployer)], // 1 sBTC
      deployer
    );
  });

  it("isolates the exact line where deposit-sbtc fails", () => {
    console.log("=== ISOLATING THE EXACT FAILURE POINT ===");
    
    // Step 1: Create vault (this should work)
    console.log("1. Creating vault...");
    const vaultResult = simnet.callPublicFn(
      CHAINVAULT_V7_CONTRACT,
      "create-sbtc-vault",
      [
        Cl.stringUtf8("debug-vault"),
        Cl.stringUtf8("Debug Vault"),
        Cl.uint(144), Cl.uint(2),
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(72), Cl.uint(0), // No initial deposit
        Cl.bool(false), Cl.bool(true)
      ],
      deployer
    );
    console.log("Vault creation result:", vaultResult.result);
    
    if (!vaultResult.result || (vaultResult.result as any).type === 'error') {
      console.log("VAULT CREATION FAILED - This is unexpected!");
      return;
    }
    
    // Step 2: Check user balance (this should work)
    console.log("\n2. Checking user balance...");
    const userBalance = simnet.callReadOnlyFn(
      MOCK_SBTC_CONTRACT,
      "get-balance",
      [Cl.principal(deployer)],
      deployer
    );
    console.log("User balance:", userBalance.result);
    
    // Step 3: Test the exact transfer call that deposit-sbtc makes
    console.log("\n3. Testing the exact transfer call...");
    const contractPrincipal = deployer + "." + CHAINVAULT_V7_CONTRACT;
    console.log("Contract principal:", contractPrincipal);
    
    // This is the exact call made in deposit-sbtc
    const transferResult = simnet.callPublicFn(
      MOCK_SBTC_CONTRACT,
      "transfer",
      [
        Cl.uint(5000000), // amount
        Cl.principal(deployer), // tx-sender (sender param)
        Cl.principal(contractPrincipal), // (as-contract tx-sender) (recipient)
        Cl.none() // memo
      ],
      deployer // actual tx-sender
    );
    console.log("Direct transfer result:", transferResult.result);
    
    if ((transferResult.result as any).type === 'error') {
      console.log("DIRECT TRANSFER FAILED!");
      console.log("Error:", transferResult.result);
      console.log("This confirms the mock token authorization issue");
    } else {
      console.log("Direct transfer works - issue is in deposit-sbtc logic");
    }
    
    // Step 4: Now test deposit-sbtc
    console.log("\n4. Testing deposit-sbtc function...");
    const depositResult = simnet.callPublicFn(
      CHAINVAULT_V7_CONTRACT,
      "deposit-sbtc",
      [Cl.stringUtf8("debug-vault"), Cl.uint(5000000)],
      deployer
    );
    console.log("Deposit result:", depositResult.result);
    
    if ((depositResult.result as any).type === 'error') {
      console.log("DEPOSIT FAILED!");
      console.log("Error code:", (depositResult.result as any).value);
      
      // Decode the error
      const errorValue = (depositResult.result as any).value;
      if (errorValue === 100n) console.log("ERR_UNAUTHORIZED");
      if (errorValue === 107n) console.log("ERR_INSUFFICIENT_BALANCE");
      if (errorValue === 108n) console.log("ERR_TRANSFER_FAILED");
      if (errorValue === 109n) console.log("ERR_INVALID_AMOUNT");
    }
  });

  it("tests the specific problem in v7 deposit function", () => {
    console.log("\n=== ANALYZING V7 DEPOSIT FUNCTION ===");
    
    // Looking at the v7 code, I see a potential issue:
    // The balance check line does NOT use unwrap!, but the transfer does
    
    console.log("IDENTIFIED ISSUE IN V7 CODE:");
    console.log("Line: (let ((user-balance (contract-call? .mock-sbtc-token-v2 get-balance tx-sender)))");
    console.log("Problem: This returns a Response, not a uint!");
    console.log("Then: (asserts! (>= user-balance amount) ERR_INSUFFICIENT_BALANCE))");
    console.log("This compares Response >= uint, which fails!");
    
    // Create vault for testing
    simnet.callPublicFn(
      CHAINVAULT_V7_CONTRACT,
      "create-sbtc-vault",
      [
        Cl.stringUtf8("analysis-vault"),
        Cl.stringUtf8("Analysis Vault"),
        Cl.uint(144), Cl.uint(2),
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(72), Cl.uint(0),
        Cl.bool(false), Cl.bool(true)
      ],
      deployer
    );
    
    console.log("\nTesting with amount larger than balance to see specific error...");
    const largeAmountTest = simnet.callPublicFn(
      CHAINVAULT_V7_CONTRACT,
      "deposit-sbtc",
      [Cl.stringUtf8("analysis-vault"), Cl.uint(200000000)], // 2 sBTC (more than 1 sBTC balance)
      deployer
    );
    console.log("Large amount test result:", largeAmountTest.result);
    
    console.log("\nTesting with small amount...");
    const smallAmountTest = simnet.callPublicFn(
      CHAINVAULT_V7_CONTRACT,
      "deposit-sbtc",
      [Cl.stringUtf8("analysis-vault"), Cl.uint(5000000)], // 0.05 sBTC
      deployer
    );
    console.log("Small amount test result:", smallAmountTest.result);
  });

  it("confirms the exact fix needed", () => {
    console.log("\n=== CONFIRMING THE FIX ===");
    
    console.log("THE PROBLEM IS IN THIS LINE:");
    console.log("(let ((user-balance (contract-call? .mock-sbtc-token-v2 get-balance tx-sender)))");
    console.log("  (asserts! (>= user-balance amount) ERR_INSUFFICIENT_BALANCE))");
    console.log("");
    console.log("SHOULD BE:");
    console.log("(let ((user-balance (unwrap! (contract-call? .mock-sbtc-token-v2 get-balance tx-sender) ERR_TRANSFER_FAILED)))");
    console.log("  (asserts! (>= user-balance amount) ERR_INSUFFICIENT_BALANCE))");
    console.log("");
    console.log("The get-balance call returns (response uint uint), not uint directly!");
    
    // Test what get-balance actually returns
    const balanceCheck = simnet.callReadOnlyFn(
      MOCK_SBTC_CONTRACT,
      "get-balance",
      [Cl.principal(deployer)],
      deployer
    );
    console.log("get-balance returns:", balanceCheck.result);
    console.log("get-balance type:", typeof balanceCheck.result);
  });
});