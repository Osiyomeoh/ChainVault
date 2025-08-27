import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";

const CONTRACT_NAME = "chainvault-core";
const SBTC_CONTRACT = "ST1PQHQKV0RJX86F46JZX85EV9S8GKRGPA1DTGJEM.sbtc-alpha";

Clarinet.test({
  name: "sBTC Inheritance: Complete inheritance flow with sBTC transfers",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const vaultOwner = accounts.get("wallet_1")!;
    const beneficiary1 = accounts.get("wallet_2")!;
    const beneficiary2 = accounts.get("wallet_3")!;
    const advisor = accounts.get("wallet_4")!;

    // Create vault
    const vaultId = "vault-123456789012345678901234567890123456";
    const vaultName = "My Inheritance Vault";
    const inheritanceDelay = 100; // 100 blocks
    const privacyLevel = 2;
    const bitcoinAddressesHash = "0x1234567890123456789012345678901234567890123456789012345678901234";
    const beneficiariesHash = "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
    const gracePeriod = 50;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "create-vault", [
        types.utf8(vaultId),
        types.utf8(vaultName),
        types.uint(inheritanceDelay),
        types.uint(privacyLevel),
        types.buff(bitcoinAddressesHash),
        types.buff(beneficiariesHash),
        types.uint(gracePeriod)
      ], vaultOwner.address)
    ]);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);

    // Add beneficiaries
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "add-beneficiary", [
        types.utf8(vaultId),
        types.uint(0),
        types.principal(beneficiary1.address),
        types.uint(6000), // 60%
        types.utf8("Primary beneficiary"),
        types.buff("0x0000000000000000000000000000000000000000000000000000000000000000")
      ], vaultOwner.address),
      Tx.contractCall(CONTRACT_NAME, "add-beneficiary", [
        types.utf8(vaultId),
        types.uint(1),
        types.principal(beneficiary2.address),
        types.uint(4000), // 40%
        types.utf8("Secondary beneficiary"),
        types.buff("0x0000000000000000000000000000000000000000000000000000000000000000")
      ], vaultOwner.address)
    ]);

    assertEquals(block.receipts.length, 2);

    // Deposit sBTC to vault
    const depositAmount = 1000000; // 1 sBTC (assuming 8 decimals)
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "deposit-sbtc-to-vault", [
        types.utf8(vaultId),
        types.uint(depositAmount)
      ], vaultOwner.address)
    ]);

    assertEquals(block.receipts.length, 1);

    // Verify sBTC balance
    const balanceResult = chain.callReadOnlyFn(CONTRACT_NAME, "get-vault-sbtc-balance", [
      types.utf8(vaultId)
    ], vaultOwner.address);

    assertEquals(balanceResult.result, `(some { sbtc-amount: u${depositAmount}, last-updated: u${block.height} })`);

    // Fast forward time to trigger inheritance
    chain.mineEmptyBlock(inheritanceDelay + gracePeriod + 10);

    // Trigger inheritance
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "trigger-inheritance", [
        types.utf8(vaultId)
      ], advisor.address)
    ]);

    assertEquals(block.receipts.length, 1);

    // Execute sBTC inheritance payout for beneficiary 1
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "execute-sbtc-inheritance-payout", [
        types.utf8(vaultId),
        types.uint(0)
      ], beneficiary1.address)
    ]);

    assertEquals(block.receipts.length, 1);

    // Verify payout was recorded
    const payoutResult = chain.callReadOnlyFn(CONTRACT_NAME, "get-sbtc-payout-status", [
      types.utf8(vaultId),
      types.uint(0)
    ], beneficiary1.address);

    assertEquals(payoutResult.result.includes("completed"), true);

    // Execute sBTC inheritance payout for beneficiary 2
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "execute-sbtc-inheritance-payout", [
        types.utf8(vaultId),
        types.uint(1)
      ], beneficiary2.address)
    ]);

    assertEquals(block.receipts.length, 1);

    // Check final vault status
    const vaultResult = chain.callReadOnlyFn(CONTRACT_NAME, "get-vault", [
      types.utf8(vaultId)
    ], vaultOwner.address);

    assertStringIncludes(vaultResult.result, "payout-completed");
  }
});

Clarinet.test({
  name: "sBTC Inheritance: Withdrawal and deposit functionality",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const vaultOwner = accounts.get("wallet_1")!;

    // Create vault
    const vaultId = "vault-withdraw-test-123456789012345678901234";
    const vaultName = "Withdrawal Test Vault";
    const inheritanceDelay = 100;
    const privacyLevel = 1;
    const bitcoinAddressesHash = "0x1234567890123456789012345678901234567890123456789012345678901234";
    const beneficiariesHash = "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
    const gracePeriod = 50;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "create-vault", [
        types.utf8(vaultId),
        types.utf8(vaultName),
        types.uint(inheritanceDelay),
        types.uint(privacyLevel),
        types.buff(bitcoinAddressesHash),
        types.buff(beneficiariesHash),
        types.uint(gracePeriod)
      ], vaultOwner.address)
    ]);

    // Deposit sBTC
    const depositAmount = 500000; // 0.5 sBTC
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "deposit-sbtc-to-vault", [
        types.utf8(vaultId),
        types.uint(depositAmount)
      ], vaultOwner.address)
    ]);

    // Verify balance
    let balanceResult = chain.callReadOnlyFn(CONTRACT_NAME, "get-vault-sbtc-balance", [
      types.utf8(vaultId)
    ], vaultOwner.address);

    assertEquals(balanceResult.result.includes(`u${depositAmount}`), true);

    // Withdraw partial amount
    const withdrawAmount = 200000; // 0.2 sBTC
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "withdraw-sbtc-from-vault", [
        types.utf8(vaultId),
        types.uint(withdrawAmount)
      ], vaultOwner.address)
    ]);

    // Verify updated balance
    balanceResult = chain.callReadOnlyFn(CONTRACT_NAME, "get-vault-sbtc-balance", [
      types.utf8(vaultId)
    ], vaultOwner.address);

    const expectedBalance = depositAmount - withdrawAmount;
    assertEquals(balanceResult.result.includes(`u${expectedBalance}`), true);
  }
});

Clarinet.test({
  name: "sBTC Inheritance: Inheritance readiness check",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const vaultOwner = accounts.get("wallet_1")!;

    // Create vault
    const vaultId = "vault-readiness-test-123456789012345678901234";
    const vaultName = "Readiness Test Vault";
    const inheritanceDelay = 10; // Short delay for testing
    const privacyLevel = 1;
    const bitcoinAddressesHash = "0x1234567890123456789012345678901234567890123456789012345678901234";
    const beneficiariesHash = "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
    const gracePeriod = 5;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "create-vault", [
        types.utf8(vaultId),
        types.utf8(vaultName),
        types.uint(inheritanceDelay),
        types.uint(privacyLevel),
        types.buff(bitcoinAddressesHash),
        types.buff(beneficiariesHash),
        types.uint(gracePeriod)
      ], vaultOwner.address)
    ]);

    // Check readiness before inheritance is due
    let readinessResult = chain.callReadOnlyFn(CONTRACT_NAME, "get-vault-inheritance-readiness", [
      types.utf8(vaultId)
    ], vaultOwner.address);

    assertEquals(readinessResult.result.includes("false"), true); // inheritance-due should be false

    // Fast forward to trigger inheritance
    chain.mineEmptyBlock(inheritanceDelay + gracePeriod + 5);

    // Check readiness after inheritance is due
    readinessResult = chain.callReadOnlyFn(CONTRACT_NAME, "get-vault-inheritance-readiness", [
      types.utf8(vaultId)
    ], vaultOwner.address);

    assertEquals(readinessResult.result.includes("true"), true); // inheritance-due should be true
  }
});

Clarinet.test({
  name: "sBTC Inheritance: Error handling and edge cases",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const vaultOwner = accounts.get("wallet_1")!;
    const unauthorized = accounts.get("wallet_2")!;

    // Create vault
    const vaultId = "vault-error-test-123456789012345678901234";
    const vaultName = "Error Test Vault";
    const inheritanceDelay = 100;
    const privacyLevel = 1;
    const bitcoinAddressesHash = "0x1234567890123456789012345678901234567890123456789012345678901234";
    const beneficiariesHash = "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
    const gracePeriod = 50;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "create-vault", [
        types.utf8(vaultId),
        types.utf8(vaultName),
        types.uint(inheritanceDelay),
        types.uint(privacyLevel),
        types.buff(bitcoinAddressesHash),
        types.buff(beneficiariesHash),
        types.uint(gracePeriod)
      ], vaultOwner.address)
    ]);

    // Try to deposit with invalid amount
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "deposit-sbtc-to-vault", [
        types.utf8(vaultId),
        types.uint(0)
      ], vaultOwner.address)
    ]);

    assertEquals(block.receipts[0].result, "(err u115)"); // ERR_INVALID_AMOUNT

    // Try to withdraw without funds
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "withdraw-sbtc-from-vault", [
        types.utf8(vaultId),
        types.uint(100000)
      ], vaultOwner.address)
    ]);

    assertEquals(block.receipts[0].result, "(err u113)"); // ERR_INSUFFICIENT_FUNDS

    // Try to execute payout before inheritance is triggered
    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, "execute-sbtc-inheritance-payout", [
        types.utf8(vaultId),
        types.uint(0)
      ], unauthorized.address)
    ]);

    assertEquals(block.receipts[0].result, "(err u110)"); // Inheritance not triggered error
  }
});
