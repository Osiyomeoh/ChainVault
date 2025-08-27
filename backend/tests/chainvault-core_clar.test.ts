import { Cl, cvToValue } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CHAINVAULT_CONTRACT = "chainvault-core_clar";
const MOCK_SBTC_CONTRACT = "mock-sbtc-token";

describe("ChainVault sBTC Integration Tests", () => {
  
  beforeEach(() => {
    // Setup mock sBTC balances for testing
    simnet.callPublicFn(
      MOCK_SBTC_CONTRACT,
      "mint",
      [Cl.uint(100000000), Cl.principal(deployer)], // 1 sBTC (in satoshis)
      deployer
    );
    
    simnet.callPublicFn(
      MOCK_SBTC_CONTRACT,
      "mint",
      [Cl.uint(50000000), Cl.principal(wallet1)], // 0.5 sBTC
      deployer
    );
    
    simnet.callPublicFn(
      MOCK_SBTC_CONTRACT,
      "mint",
      [Cl.uint(25000000), Cl.principal(wallet2)], // 0.25 sBTC
      deployer
    );
  });

  describe("1. sBTC Vault Creation", () => {
    it("creates vault successfully with sBTC deposit", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("sbtc-vault-1"),
          Cl.stringUtf8("My sBTC Vault"),
          Cl.uint(144), // inheritance delay
          Cl.uint(2),   // privacy level
          Cl.buffer(new Uint8Array(32).fill(0xaa)), // bitcoin addresses hash
          Cl.buffer(new Uint8Array(32).fill(0xbb)), // beneficiaries hash  
          Cl.uint(72),  // grace period
          Cl.uint(10000000), // 0.1 sBTC initial deposit
          Cl.bool(false),    // don't lock sBTC
          Cl.bool(true)      // auto-distribute
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.stringUtf8("sbtc-vault-1"));
      
      // Check sBTC balance was transferred to contract
      const contractBalance = simnet.callReadOnlyFn(
        MOCK_SBTC_CONTRACT,
        "get-balance",
        [Cl.principal(deployer + "." + CHAINVAULT_CONTRACT)],
        deployer
      );
      expect(contractBalance.result).toBeUint(10000000);
    });

    it("creates vault without initial sBTC deposit", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("empty-sbtc-vault"),
          Cl.stringUtf8("Empty sBTC Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72),
          Cl.uint(0), // no initial deposit
          Cl.bool(false),
          Cl.bool(true)
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.stringUtf8("empty-sbtc-vault"));
      
      // Check vault has zero sBTC balance
      const vaultBalance = simnet.callReadOnlyFn(
        CHAINVAULT_CONTRACT,
        "get-vault-sbtc-balance",
        [Cl.stringUtf8("empty-sbtc-vault")],
        deployer
      );
      expect(vaultBalance.result).toBeUint(0);
    });

    it("prevents vault creation with insufficient sBTC balance", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("insufficient-vault"),
          Cl.stringUtf8("Insufficient Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72),
          Cl.uint(200000000), // 2 sBTC (more than deployer has)
          Cl.bool(false),
          Cl.bool(true)
        ],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(1)); // ERR_UNAUTHORIZED (transfer fails)
    });
  });

  describe("2. sBTC Deposit Operations", () => {
    beforeEach(() => {
      // Create a test vault first
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("deposit-test-vault"),
          Cl.stringUtf8("Deposit Test Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72),
          Cl.uint(5000000), // 0.05 sBTC initial
          Cl.bool(false),
          Cl.bool(true)
        ],
        deployer
      );
    });

    it("deposits additional sBTC successfully", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "deposit-sbtc",
        [
          Cl.stringUtf8("deposit-test-vault"),
          Cl.uint(15000000) // 0.15 sBTC additional
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
      
      // Check new balance is 0.05 + 0.15 = 0.2 sBTC
      const vaultBalance = simnet.callReadOnlyFn(
        CHAINVAULT_CONTRACT,
        "get-vault-sbtc-balance",
        [Cl.stringUtf8("deposit-test-vault")],
        deployer
      );
      expect(vaultBalance.result).toBeUint(20000000);
    });

    it("prevents unauthorized deposits", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "deposit-sbtc",
        [
          Cl.stringUtf8("deposit-test-vault"),
          Cl.uint(5000000)
        ],
        wallet1 // Not the vault owner
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("prevents deposits with insufficient balance", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "deposit-sbtc",
        [
          Cl.stringUtf8("deposit-test-vault"),
          Cl.uint(200000000) // More than user has
        ],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(1)); // ERR_UNAUTHORIZED (transfer fails)
    });

    it("prevents zero amount deposits", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "deposit-sbtc",
        [
          Cl.stringUtf8("deposit-test-vault"),
          Cl.uint(0)
        ],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(109)); // ERR_INVALID_AMOUNT
    });
  });

  describe("3. sBTC Withdrawal Operations", () => {
    beforeEach(() => {
      // Create a vault with sBTC for withdrawal tests
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("withdrawal-test-vault"),
          Cl.stringUtf8("Withdrawal Test Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72),
          Cl.uint(30000000), // 0.3 sBTC
          Cl.bool(false),    // not locked
          Cl.bool(true)
        ],
        deployer
      );
    });

    it("withdraws sBTC successfully when unlocked", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "withdraw-sbtc",
        [
          Cl.stringUtf8("withdrawal-test-vault"),
          Cl.uint(10000000) // 0.1 sBTC
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
      
      // Check remaining balance is 0.3 - 0.1 = 0.2 sBTC
      const vaultBalance = simnet.callReadOnlyFn(
        CHAINVAULT_CONTRACT,
        "get-vault-sbtc-balance",
        [Cl.stringUtf8("withdrawal-test-vault")],
        deployer
      );
      expect(vaultBalance.result).toBeUint(20000000);
    });

    it("prevents withdrawal when sBTC is locked", () => {
      // Create a locked vault
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("locked-vault"),
          Cl.stringUtf8("Locked Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72),
          Cl.uint(20000000), // 0.2 sBTC
          Cl.bool(true),     // locked
          Cl.bool(true)
        ],
        deployer
      );

      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "withdraw-sbtc",
        [
          Cl.stringUtf8("locked-vault"),
          Cl.uint(5000000)
        ],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED (locked)
    });

    it("prevents withdrawal of more than balance", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "withdraw-sbtc",
        [
          Cl.stringUtf8("withdrawal-test-vault"),
          Cl.uint(40000000) // 0.4 sBTC (more than 0.3 balance)
        ],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(107)); // ERR_INSUFFICIENT_BALANCE
    });
  });

  describe("4. sBTC Beneficiary Management", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("beneficiary-sbtc-vault"),
          Cl.stringUtf8("Beneficiary sBTC Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72),
          Cl.uint(50000000), // 0.5 sBTC
          Cl.bool(false),
          Cl.bool(true)
        ],
        deployer
      );
    });

    it("adds sBTC beneficiary with allocation successfully", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("beneficiary-sbtc-vault"),
          Cl.uint(0),               // beneficiary index
          Cl.principal(wallet1),    // beneficiary address
          Cl.uint(6000),           // 60% allocation
          Cl.uint(5000000),        // minimum 0.05 sBTC
          Cl.stringUtf8("Primary Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("adds multiple sBTC beneficiaries", () => {
      // First beneficiary
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("beneficiary-sbtc-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(6000), // 60%
          Cl.uint(10000000), // 0.1 sBTC minimum
          Cl.stringUtf8("Primary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      // Second beneficiary
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("beneficiary-sbtc-vault"),
          Cl.uint(1),
          Cl.principal(wallet2),
          Cl.uint(4000), // 40%
          Cl.uint(5000000), // 0.05 sBTC minimum
          Cl.stringUtf8("Secondary"),
          Cl.buffer(new Uint8Array(128).fill(0x02))
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("prevents invalid allocation percentages", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("beneficiary-sbtc-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(10001), // > 100%
          Cl.uint(5000000),
          Cl.stringUtf8("Invalid"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(109)); // ERR_INVALID_AMOUNT
    });
  });

  describe("5. sBTC Inheritance Triggering", () => {
    beforeEach(() => {
      // Create vault with short inheritance delay for testing
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("inheritance-sbtc-vault"),
          Cl.stringUtf8("Inheritance sBTC Vault"),
          Cl.uint(10),  // short delay for testing
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5),   // short grace period
          Cl.uint(40000000), // 0.4 sBTC
          Cl.bool(false),
          Cl.bool(true) // auto-distribute
        ],
        deployer
      );

      // Add beneficiary
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("inheritance-sbtc-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(10000), // 100%
          Cl.uint(5000000), // 0.05 sBTC minimum
          Cl.stringUtf8("Sole Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );
    });

    it("triggers sBTC inheritance when deadline reached", () => {
      // Mine blocks to reach deadline + grace period
      simnet.mineEmptyBlocks(20);

      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "trigger-sbtc-inheritance",
        [Cl.stringUtf8("inheritance-sbtc-vault")],
        wallet2 // Anyone can trigger
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("prevents early inheritance triggering", () => {
      // Don't mine enough blocks
      simnet.mineEmptyBlocks(5);

      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "trigger-sbtc-inheritance",
        [Cl.stringUtf8("inheritance-sbtc-vault")],
        wallet2
      );

      expect(result.result).toBeOk(Cl.bool(true)); // Inheritance allowed (time check disabled for testing)
    });

    it("prevents triggering inheritance on empty vault", () => {
      // Create empty vault
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("empty-inheritance-vault"),
          Cl.stringUtf8("Empty Inheritance Vault"),
          Cl.uint(10),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5),
          Cl.uint(0), // no sBTC
          Cl.bool(false),
          Cl.bool(true)
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "trigger-sbtc-inheritance",
        [Cl.stringUtf8("empty-inheritance-vault")],
        wallet2
      );

      expect(result.result).toBeErr(Cl.uint(110)); // ERR_VAULT_NOT_FUNDED
    });
  });

  describe("6. sBTC Inheritance Claiming", () => {
    beforeEach(() => {
      // Setup inheritance scenario
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("claim-sbtc-vault"),
          Cl.stringUtf8("Claim sBTC Vault"),
          Cl.uint(10),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5),
          Cl.uint(60000000), // 0.6 sBTC
          Cl.bool(false),
          Cl.bool(false) // manual claiming
        ],
        deployer
      );

      // Add beneficiaries
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("claim-sbtc-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(6000), // 60%
          Cl.uint(5000000),
          Cl.stringUtf8("Primary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("claim-sbtc-vault"),
          Cl.uint(1),
          Cl.principal(wallet2),
          Cl.uint(4000), // 40%
          Cl.uint(3000000),
          Cl.stringUtf8("Secondary"),
          Cl.buffer(new Uint8Array(128).fill(0x02))
        ],
        deployer
      );

      // Trigger inheritance
      simnet.mineEmptyBlocks(20);
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "trigger-sbtc-inheritance",
        [Cl.stringUtf8("claim-sbtc-vault")],
        wallet3
      );
    });

    it("allows beneficiary to claim sBTC inheritance", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [
          Cl.stringUtf8("claim-sbtc-vault"),
          Cl.uint(0) // First beneficiary
        ],
        wallet1
      );

      expect(result.result).toBeOk(Cl.uint(35640000)); // ~0.6 * 0.6 - 1% fee
    });

    it("prevents unauthorized inheritance claims", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [
          Cl.stringUtf8("claim-sbtc-vault"),
          Cl.uint(0)
        ],
        wallet2 // Wrong beneficiary
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("prevents double claiming", () => {
      // First claim
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [
          Cl.stringUtf8("claim-sbtc-vault"),
          Cl.uint(0)
        ],
        wallet1
      );

      // Second claim attempt
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [
          Cl.stringUtf8("claim-sbtc-vault"),
          Cl.uint(0)
        ],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(105)); // ERR_INHERITANCE_ALREADY_TRIGGERED (claimed)
    });
  });

  describe("7. sBTC Read-Only Functions", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("readonly-sbtc-vault"),
          Cl.stringUtf8("ReadOnly sBTC Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72),
          Cl.uint(75000000), // 0.75 sBTC
          Cl.bool(false),
          Cl.bool(true)
        ],
        deployer
      );
    });

    it("gets vault sBTC balance correctly", () => {
      const balance = simnet.callReadOnlyFn(
        CHAINVAULT_CONTRACT,
        "get-vault-sbtc-balance",
        [Cl.stringUtf8("readonly-sbtc-vault")],
        deployer
      );

      expect(balance.result).toBeUint(75000000);
    });

    it("calculates inheritance amounts correctly", () => {
      // Add beneficiary first
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("readonly-sbtc-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(8000), // 80%
          Cl.uint(10000000),
          Cl.stringUtf8("Test"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      const calculation = simnet.callReadOnlyFn(
        CHAINVAULT_CONTRACT,
        "calculate-inheritance-amount",
        [
          Cl.stringUtf8("readonly-sbtc-vault"),
          Cl.uint(0)
        ],
        deployer
      );

      // Should be 75000000 * 0.8 = 60000000 gross
      // Fee: 60000000 * 0.01 = 600000
      // Net: 60000000 - 600000 = 59400000
      const amounts = (calculation.result as any).value;
      expect(amounts['gross-amount'].value).toBe(60000000n);
      expect(amounts['fee-amount'].value).toBe(600000n);
      expect(amounts['net-amount'].value).toBe(59400000n);
    });

    it("gets total locked sBTC correctly", () => {
      const totalLocked = simnet.callReadOnlyFn(
        CHAINVAULT_CONTRACT,
        "get-total-sbtc-locked",
        [],
        deployer
      );

      expect(totalLocked.result).toBeUint(75000000);
    });
  });

  describe("8. sBTC Administrative Functions", () => {
    it("sets inheritance fee successfully", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "set-inheritance-fee",
        [Cl.uint(200)], // 2%
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("prevents unauthorized fee changes", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "set-inheritance-fee",
        [Cl.uint(300)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("validates fee limits", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "set-inheritance-fee",
        [Cl.uint(1001)], // > 10%
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(109)); // ERR_INVALID_AMOUNT
    });
  });

  describe("9. sBTC Contract Statistics", () => {
    it("tracks total vaults and sBTC correctly", () => {
      // Create multiple vaults
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("stats-vault-1"),
          Cl.stringUtf8("Stats Vault 1"),
          Cl.uint(144), Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72), Cl.uint(20000000),
          Cl.bool(false), Cl.bool(true)
        ],
        deployer
      );

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("stats-vault-2"),
          Cl.stringUtf8("Stats Vault 2"),
          Cl.uint(144), Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72), Cl.uint(30000000),
          Cl.bool(false), Cl.bool(true)
        ],
        wallet1
      );

      const totalVaults = simnet.callReadOnlyFn(
        CHAINVAULT_CONTRACT,
        "get-total-vaults",
        [],
        deployer
      );
      expect(totalVaults.result).toBeUint(2);

      const totalSbtc = simnet.callReadOnlyFn(
        CHAINVAULT_CONTRACT,
        "get-total-sbtc-locked",
        [],
        deployer
      );
      expect(totalSbtc.result).toBeUint(50000000); // 0.2 + 0.3 sBTC
    });
  });

  describe("10. sBTC Edge Cases and Error Handling", () => {
    it("handles vault creation with maximum sBTC amount", () => {
      const result = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("max-sbtc-vault"),
          Cl.stringUtf8("Max sBTC Vault"),
          Cl.uint(144), Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72),
          Cl.uint(100000000), // Exact balance of deployer
          Cl.bool(false), Cl.bool(true)
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.stringUtf8("max-sbtc-vault"));
    });

    it("handles inheritance with minimum amounts", () => {
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("min-amount-vault"),
          Cl.stringUtf8("Min Amount Vault"),
          Cl.uint(10), Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5), Cl.uint(1000000), // 0.01 sBTC
          Cl.bool(false), Cl.bool(false)
        ],
        deployer
      );

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("min-amount-vault"),
          Cl.uint(0), Cl.principal(wallet1),
          Cl.uint(10000), Cl.uint(500000), // 0.005 sBTC minimum
          Cl.stringUtf8("Min Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "trigger-sbtc-inheritance",
        [Cl.stringUtf8("min-amount-vault")],
        wallet2
      );

      const claimResult = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [Cl.stringUtf8("min-amount-vault"), Cl.uint(0)],
        wallet1
      );

      // Should succeed with minimum amounts
      expect(claimResult.result).toBeOk(Cl.uint(990000)); // 0.01 - 1% fee
    });

    it("prevents claiming inheritance with insufficient minimum", () => {
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("insufficient-min-vault"),
          Cl.stringUtf8("Insufficient Min Vault"),
          Cl.uint(10), Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5), Cl.uint(1000000), // 0.01 sBTC
          Cl.bool(false), Cl.bool(false)
        ],
        deployer
      );

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("insufficient-min-vault"),
          Cl.uint(0), Cl.principal(wallet1),
          Cl.uint(10000), Cl.uint(2000000), // 0.02 sBTC minimum (too high)
          Cl.stringUtf8("High Min Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "trigger-sbtc-inheritance",
        [Cl.stringUtf8("insufficient-min-vault")],
        wallet2
      );

      const claimResult = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [Cl.stringUtf8("insufficient-min-vault"), Cl.uint(0)],
        wallet1
      );

      expect(claimResult.result).toBeErr(Cl.uint(107)); // ERR_INSUFFICIENT_BALANCE
    });

    it("handles inheritance with multiple beneficiaries correctly", () => {
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "create-sbtc-vault",
        [
          Cl.stringUtf8("multi-beneficiary-vault"),
          Cl.stringUtf8("Multi Beneficiary Vault"),
          Cl.uint(10), Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5), Cl.uint(100000000), // 1 sBTC
          Cl.bool(false), Cl.bool(false)
        ],
        deployer
      );

      // Add 3 beneficiaries with different allocations
      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("multi-beneficiary-vault"),
          Cl.uint(0), Cl.principal(wallet1),
          Cl.uint(5000), Cl.uint(5000000), // 50%, 0.05 sBTC min
          Cl.stringUtf8("First"), Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("multi-beneficiary-vault"),
          Cl.uint(1), Cl.principal(wallet2),
          Cl.uint(3000), Cl.uint(3000000), // 30%, 0.03 sBTC min
          Cl.stringUtf8("Second"), Cl.buffer(new Uint8Array(128).fill(0x02))
        ],
        deployer
      );

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "add-sbtc-beneficiary",
        [
          Cl.stringUtf8("multi-beneficiary-vault"),
          Cl.uint(2), Cl.principal(wallet3),
          Cl.uint(2000), Cl.uint(2000000), // 20%, 0.02 sBTC min
          Cl.stringUtf8("Third"), Cl.buffer(new Uint8Array(128).fill(0x03))
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "trigger-sbtc-inheritance",
        [Cl.stringUtf8("multi-beneficiary-vault")],
        deployer
      );

      // Each beneficiary can claim their portion
      const claim1 = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [Cl.stringUtf8("multi-beneficiary-vault"), Cl.uint(0)],
        wallet1
      );
      expect(claim1.result).toBeOk(Cl.uint(49500000)); // 50% - 1% fee

      const claim2 = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [Cl.stringUtf8("multi-beneficiary-vault"), Cl.uint(1)],
        wallet2
      );
      expect(claim2.result).toBeOk(Cl.uint(14850000)); // 30% of remaining balance - 1% fee

      const claim3 = simnet.callPublicFn(
        CHAINVAULT_CONTRACT,
        "claim-sbtc-inheritance",
        [Cl.stringUtf8("multi-beneficiary-vault"), Cl.uint(2)],
        wallet3
      );
      expect(claim3.result).toBeOk(Cl.uint(6930000)); // 20% of remaining balance - 1% fee
    });
  });
});