import { Cl, cvToValue } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "chainvault-core_clar";

describe("ChainVault Complete Test Suite", () => {

  describe("1. Contract Initialization", () => {
    it("ensures contract is properly initialized", () => {
      const totalVaults = simnet.getDataVar(CONTRACT_NAME, "total-vaults");
      expect(totalVaults).toBeUint(0);

      const contractVersion = simnet.getDataVar(CONTRACT_NAME, "contract-version");
      expect(contractVersion).toBeUint(1);

      const inheritanceFee = simnet.getDataVar(CONTRACT_NAME, "inheritance-fee");
      expect(inheritanceFee).toBeUint(100);
    });
  });

  describe("2. Vault Creation Tests", () => {
    it("creates vault successfully with valid parameters", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("test-vault-1"),
          Cl.stringUtf8("My Test Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72)
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.stringUtf8("test-vault-1"));
      
      const totalVaults = simnet.getDataVar(CONTRACT_NAME, "total-vaults");
      expect(totalVaults).toBeUint(1);
    });

    it("prevents duplicate vault creation", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("duplicate-vault"),
          Cl.stringUtf8("First Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const duplicateResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("duplicate-vault"),
          Cl.stringUtf8("Second Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      expect(duplicateResult.result).toBeErr(Cl.uint(102));
    });

    it("validates privacy levels", () => {
      const lowPrivacyResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("low-privacy"),
          Cl.stringUtf8("Low Privacy Vault"),
          Cl.uint(100),
          Cl.uint(0),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      expect(lowPrivacyResult.result).toBeErr(Cl.uint(103));

      const highPrivacyResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("high-privacy"),
          Cl.stringUtf8("High Privacy Vault"),
          Cl.uint(100),
          Cl.uint(5),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      expect(highPrivacyResult.result).toBeErr(Cl.uint(103));
    });

    it("validates inheritance delay and grace period", () => {
      const zeroDelayResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("zero-delay"),
          Cl.stringUtf8("Zero Delay Vault"),
          Cl.uint(0),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      expect(zeroDelayResult.result).toBeErr(Cl.uint(107));

      const zeroGraceResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("zero-grace"),
          Cl.stringUtf8("Zero Grace Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(0)
        ],
        deployer
      );

      expect(zeroGraceResult.result).toBeErr(Cl.uint(108));
    });
  });

  describe("3. Beneficiary Management Tests", () => {
    it("adds beneficiaries successfully", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("beneficiary-vault"),
          Cl.stringUtf8("Beneficiary Test Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const addBeneficiaryResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("beneficiary-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(5000),
          Cl.stringUtf8("Primary Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      expect(addBeneficiaryResult.result).toBeOk(Cl.bool(true));

      const secondBeneficiaryResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("beneficiary-vault"),
          Cl.uint(1),
          Cl.principal(wallet2),
          Cl.uint(3000),
          Cl.stringUtf8("Secondary Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x02))
        ],
        deployer
      );

      expect(secondBeneficiaryResult.result).toBeOk(Cl.bool(true));
    });

    it("prevents unauthorized beneficiary addition", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("unauthorized-test"),
          Cl.stringUtf8("Unauthorized Test Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const unauthorizedResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("unauthorized-test"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(5000),
          Cl.stringUtf8("Unauthorized Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        wallet1
      );

      expect(unauthorizedResult.result).toBeErr(Cl.uint(100));
    });

    it("prevents adding beneficiaries to non-existent vault", () => {
      const nonExistentResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("non-existent-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(5000),
          Cl.stringUtf8("Test Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      expect(nonExistentResult.result).toBeErr(Cl.uint(101));
    });

    it("validates allocation percentage", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("allocation-test"),
          Cl.stringUtf8("Allocation Test Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const invalidAllocationResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("allocation-test"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(10001),
          Cl.stringUtf8("Invalid Allocation"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      expect(invalidAllocationResult.result).toBeErr(Cl.uint(109));
    });
  });

  describe("4. Proof of Life Tests", () => {
    it("updates proof of life successfully", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("proof-vault"),
          Cl.stringUtf8("Proof of Life Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      simnet.mineEmptyBlocks(10);

      const updateResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "update-proof-of-life",
        [Cl.stringUtf8("proof-vault")],
        deployer
      );

      expect(updateResult.result).toBeOk(Cl.bool(true));
    });

    it("prevents unauthorized proof of life updates", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("auth-test-vault"),
          Cl.stringUtf8("Auth Test Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const unauthorizedUpdateResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "update-proof-of-life",
        [Cl.stringUtf8("auth-test-vault")],
        wallet1
      );

      expect(unauthorizedUpdateResult.result).toBeErr(Cl.uint(100));
    });

    it("fails to update proof of life for non-existent vault", () => {
      const nonExistentUpdateResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "update-proof-of-life",
        [Cl.stringUtf8("non-existent-vault")],
        deployer
      );

      expect(nonExistentUpdateResult.result).toBeErr(Cl.uint(101));
    });
  });

  describe("5. Inheritance Triggering Tests", () => {
    it("triggers inheritance when deadline is reached", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("inheritance-vault"),
          Cl.stringUtf8("Inheritance Test Vault"),
          Cl.uint(10),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5)
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      const triggerResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("inheritance-vault")],
        wallet1
      );

      expect(triggerResult.result).toBeOk(Cl.bool(true));
    });

    it("prevents early inheritance triggering", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("early-trigger-vault"),
          Cl.stringUtf8("Early Trigger Test Vault"),
          Cl.uint(1000),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(500)
        ],
        deployer
      );

      const earlyTriggerResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("early-trigger-vault")],
        wallet1
      );

      expect(earlyTriggerResult.result).toBeErr(Cl.uint(104));
    });

    it("fails to trigger inheritance for non-existent vault", () => {
      const nonExistentTriggerResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("non-existent-vault")],
        wallet1
      );

      expect(nonExistentTriggerResult.result).toBeErr(Cl.uint(101));
    });

    it("prevents triggering already triggered inheritance", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("double-trigger-vault"),
          Cl.stringUtf8("Double Trigger Test Vault"),
          Cl.uint(10),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5)
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("double-trigger-vault")],
        wallet1
      );

      const secondTriggerResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("double-trigger-vault")],
        wallet2
      );

      expect(secondTriggerResult.result).toBeErr(Cl.uint(105));
    });
  });

  describe("6. Inheritance Claiming Tests", () => {
    it("allows beneficiaries to claim inheritance", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("claim-vault"),
          Cl.stringUtf8("Claim Test Vault"),
          Cl.uint(10),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5)
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("claim-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(5000),
          Cl.stringUtf8("Test Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("claim-vault")],
        wallet2
      );

      const claimResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "claim-inheritance",
        [
          Cl.stringUtf8("claim-vault"),
          Cl.uint(0)
        ],
        wallet1
      );

      expect(claimResult.result).toBeOk(Cl.uint(0));
    });

    it("prevents unauthorized inheritance claims", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("unauthorized-claim-vault"),
          Cl.stringUtf8("Unauthorized Claim Test Vault"),
          Cl.uint(10),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5)
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("unauthorized-claim-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(5000),
          Cl.stringUtf8("Test Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("unauthorized-claim-vault")],
        wallet2
      );

      const unauthorizedClaimResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "claim-inheritance",
        [
          Cl.stringUtf8("unauthorized-claim-vault"),
          Cl.uint(0)
        ],
        wallet2
      );

      expect(unauthorizedClaimResult.result).toBeErr(Cl.uint(100));
    });

    it("prevents claiming from non-triggered inheritance", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("non-triggered-claim"),
          Cl.stringUtf8("Non-Triggered Claim Vault"),
          Cl.uint(1000),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(500)
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("non-triggered-claim"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(5000),
          Cl.stringUtf8("Test Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      const prematureClaimResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "claim-inheritance",
        [
          Cl.stringUtf8("non-triggered-claim"),
          Cl.uint(0)
        ],
        wallet1
      );

      
      expect(prematureClaimResult.result).toBeErr(Cl.uint(101));
    });
  });

  describe("7. Professional Access Tests", () => {
    it("grants professional access successfully", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("professional-vault"),
          Cl.stringUtf8("Professional Access Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const grantAccessResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "grant-professional-access",
        [
          Cl.stringUtf8("professional-vault"),
          Cl.principal(wallet1),
          Cl.uint(2)
        ],
        deployer
      );

      expect(grantAccessResult.result).toBeOk(Cl.bool(true));
    });

    it("prevents unauthorized professional access management", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("unauthorized-professional-vault"),
          Cl.stringUtf8("Unauthorized Professional Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const unauthorizedGrantResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "grant-professional-access",
        [
          Cl.stringUtf8("unauthorized-professional-vault"),
          Cl.principal(wallet2),
          Cl.uint(2)
        ],
        wallet1
      );

      expect(unauthorizedGrantResult.result).toBeErr(Cl.uint(100));
    });

    it("validates access level ranges", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("access-level-test"),
          Cl.stringUtf8("Access Level Test Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const invalidAccessLevelResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "grant-professional-access",
        [
          Cl.stringUtf8("access-level-test"),
          Cl.principal(wallet1),
          Cl.uint(4)
        ],
        deployer
      );

      expect(invalidAccessLevelResult.result).toBeErr(Cl.uint(111));
    });
  });

  describe("8. Emergency Controls Tests", () => {
    it("pauses vault in emergency", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("emergency-vault"),
          Cl.stringUtf8("Emergency Test Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const pauseResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "emergency-pause-vault",
        [Cl.stringUtf8("emergency-vault")],
        deployer
      );

      expect(pauseResult.result).toBeOk(Cl.bool(true));
    });

    it("prevents unauthorized emergency pause", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("unauthorized-emergency-vault"),
          Cl.stringUtf8("Unauthorized Emergency Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const unauthorizedPauseResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "emergency-pause-vault",
        [Cl.stringUtf8("unauthorized-emergency-vault")],
        wallet1
      );

      expect(unauthorizedPauseResult.result).toBeErr(Cl.uint(100));
    });
  });

  describe("9. Administrative Functions Tests", () => {
    it("sets inheritance fee successfully", () => {
      const setFeeResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-inheritance-fee",
        [Cl.uint(200)],
        deployer
      );

      expect(setFeeResult.result).toBeOk(Cl.bool(true));

      const newFee = simnet.getDataVar(CONTRACT_NAME, "inheritance-fee");
      expect(newFee).toBeUint(200);
    });

    it("prevents unauthorized fee changes", () => {
      const unauthorizedFeeResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-inheritance-fee",
        [Cl.uint(300)],
        wallet1
      );

      expect(unauthorizedFeeResult.result).toBeErr(Cl.uint(100));
    });

    it("validates fee limits", () => {
      const invalidFeeResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-inheritance-fee",
        [Cl.uint(1001)],
        deployer
      );

      expect(invalidFeeResult.result).toBeErr(Cl.uint(112));
    });
  });

  describe("10. Read-Only Function Tests", () => {
    it("retrieves vault information correctly", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("readonly-vault"),
          Cl.stringUtf8("Read Only Test Vault"),
          Cl.uint(144),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(72)
        ],
        deployer
      );

      const vaultInfo = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-vault",
        [Cl.stringUtf8("readonly-vault")],
        deployer
      );

      
      expect(vaultInfo.result).toBeDefined();
      expect(vaultInfo.result).not.toBeNone();
      
      
      if (vaultInfo.result.type === 'some') {
        const vaultData = vaultInfo.result.value;
        console.log("Vault data structure:", cvToValue(vaultData));
        
        
        const vaultJs = cvToValue(vaultData);
        console.log("Vault JS object:", Object.keys(vaultJs));
        
       
        expect(vaultJs).toHaveProperty('owner');
        expect(vaultJs).toHaveProperty('vault-name');
        expect(vaultJs).toHaveProperty('privacy-level');
      }
    });

    it("retrieves beneficiary information correctly", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("beneficiary-readonly-vault"),
          Cl.stringUtf8("Beneficiary Read Only Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("beneficiary-readonly-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(5000),
          Cl.stringUtf8("Test Beneficiary"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      const beneficiaryInfo = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-beneficiary",
        [
          Cl.stringUtf8("beneficiary-readonly-vault"),
          Cl.uint(0)
        ],
        deployer
      );

      
      expect(beneficiaryInfo.result).toBeDefined();
      expect(beneficiaryInfo.result).not.toBeNone();
      
      
      if (beneficiaryInfo.result.type === 'some') {
        const beneficiaryData = beneficiaryInfo.result.value;
        console.log("Beneficiary data structure:", cvToValue(beneficiaryData));
        
        
        const beneficiaryJs = cvToValue(beneficiaryData);
        console.log("Beneficiary JS object:", Object.keys(beneficiaryJs));
        
        
        expect(beneficiaryJs).toHaveProperty('beneficiary-address');
        expect(beneficiaryJs).toHaveProperty('allocation-percentage');
      }
    });

    it("checks inheritance status correctly", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("inheritance-status-vault"),
          Cl.stringUtf8("Inheritance Status Vault"),
          Cl.uint(10),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5)
        ],
        deployer
      );

      const initialStatus = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-inheritance-due",
        [Cl.stringUtf8("inheritance-status-vault")],
        deployer
      );

      expect(initialStatus.result).toBeBool(false);

      simnet.mineEmptyBlocks(20);

      const laterStatus = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-inheritance-due",
        [Cl.stringUtf8("inheritance-status-vault")],
        deployer
      );

      expect(laterStatus.result).toBeBool(true);
    });

    it("retrieves proof of life status correctly", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("proof-readonly-vault"),
          Cl.stringUtf8("Proof Read Only Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const proofOfLife = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-proof-of-life",
        [Cl.stringUtf8("proof-readonly-vault")],
        deployer
      );

      
      expect(proofOfLife.result).toBeDefined();
      expect(proofOfLife.result).not.toBeNone();
      
      
      if (proofOfLife.result.type === 'some') {
        const proofData = proofOfLife.result.value;
        console.log("Proof data structure:", cvToValue(proofData));
        
        
        const proofJs = cvToValue(proofData);
        console.log("Proof JS object:", Object.keys(proofJs));
        
        
        expect(proofJs).toHaveProperty('status');
        expect(proofJs).toHaveProperty('last-checkin');
      }
    });

    it("retrieves professional access correctly", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("professional-readonly-vault"),
          Cl.stringUtf8("Professional Read Only Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "grant-professional-access",
        [
          Cl.stringUtf8("professional-readonly-vault"),
          Cl.principal(wallet1),
          Cl.uint(2)
        ],
        deployer
      );

      const professionalAccess = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-professional-access",
        [
          Cl.stringUtf8("professional-readonly-vault"),
          Cl.principal(wallet1)
        ],
        deployer
      );

      
      expect(professionalAccess.result).toBeDefined();
      expect(professionalAccess.result).not.toBeNone();
      
      
      if (professionalAccess.result.type === 'some') {
        const accessData = professionalAccess.result.value;
        console.log("Professional access data structure:", cvToValue(accessData));
        
        
        const accessJs = cvToValue(accessData);
        console.log("Access JS object:", Object.keys(accessJs));
        
       
        expect(accessJs).toHaveProperty('access-level');
        expect(accessJs).toHaveProperty('active');
      }
    });

    it("retrieves inheritance execution status correctly", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("execution-readonly-vault"),
          Cl.stringUtf8("Execution Read Only Vault"),
          Cl.uint(10),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(5)
        ],
        deployer
      );

      simnet.mineEmptyBlocks(20);

      simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("execution-readonly-vault")],
        wallet1
      );

      const executionStatus = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-inheritance-execution",
        [Cl.stringUtf8("execution-readonly-vault")],
        deployer
      );

      
      expect(executionStatus.result).toBeDefined();
      expect(executionStatus.result).not.toBeNone();
      
     
      if (executionStatus.result.type === 'some') {
        const executionData = executionStatus.result.value;
        console.log("Execution data structure:", cvToValue(executionData));
        
        
        const executionJs = cvToValue(executionData);
        console.log("Execution JS object:", Object.keys(executionJs));
        
        
        expect(executionJs).toHaveProperty('execution-status');
        expect(executionJs).toHaveProperty('triggered-by');
      }
    });

    it("retrieves contract statistics correctly", () => {
      const totalVaults = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-vaults",
        [],
        deployer
      );

      expect(totalVaults.result).toBeUint(0);

      const contractVersion = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-contract-version",
        [],
        deployer
      );

      expect(contractVersion.result).toBeUint(1);
    });
  });

  describe("11. Edge Cases and Error Handling", () => {
    it("handles all error codes correctly", () => {
      const unauthorizedError = simnet.callPublicFn(
        CONTRACT_NAME,
        "update-proof-of-life",
        [Cl.stringUtf8("non-existent-for-auth-test")],
        wallet1
      );
      expect(unauthorizedError.result).toBeErr(Cl.uint(101));

      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("existing-vault"),
          Cl.stringUtf8("Existing Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const vaultExistsError = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("existing-vault"),
          Cl.stringUtf8("Duplicate Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );
      expect(vaultExistsError.result).toBeErr(Cl.uint(102));

      const invalidPrivacyError = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("invalid-privacy-vault"),
          Cl.stringUtf8("Invalid Privacy Vault"),
          Cl.uint(100),
          Cl.uint(5),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );
      expect(invalidPrivacyError.result).toBeErr(Cl.uint(103));

      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("early-inheritance-vault"),
          Cl.stringUtf8("Early Inheritance Vault"),
          Cl.uint(1000),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(500)
        ],
        deployer
      );

      const inheritanceNotDueError = simnet.callPublicFn(
        CONTRACT_NAME,
        "trigger-inheritance",
        [Cl.stringUtf8("early-inheritance-vault")],
        wallet1
      );
      expect(inheritanceNotDueError.result).toBeErr(Cl.uint(104));
    });

    it("validates privacy level boundaries", () => {
      const validPrivacyLevel1 = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("privacy-level-1"),
          Cl.stringUtf8("Privacy Level 1 Vault"),
          Cl.uint(100),
          Cl.uint(1),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );
      expect(validPrivacyLevel1.result).toBeOk(Cl.stringUtf8("privacy-level-1"));

      const validPrivacyLevel4 = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("privacy-level-4"),
          Cl.stringUtf8("Privacy Level 4 Vault"),
          Cl.uint(100),
          Cl.uint(4),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );
      expect(validPrivacyLevel4.result).toBeOk(Cl.stringUtf8("privacy-level-4"));
    });

    it("handles vault creation with minimum valid parameters", () => {
      const minParamVault = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("min-param-vault"),
          Cl.stringUtf8("Minimum Parameter Vault"),
          Cl.uint(1),
          Cl.uint(1),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(1)
        ],
        deployer
      );

      expect(minParamVault.result).toBeOk(Cl.stringUtf8("min-param-vault"));
    });

    it("handles maximum allocation percentage correctly", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [
          Cl.stringUtf8("max-allocation-vault"),
          Cl.stringUtf8("Max Allocation Vault"),
          Cl.uint(100),
          Cl.uint(2),
          Cl.buffer(new Uint8Array(32).fill(0xaa)),
          Cl.buffer(new Uint8Array(32).fill(0xbb)),
          Cl.uint(50)
        ],
        deployer
      );

      const maxAllocationResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-beneficiary",
        [
          Cl.stringUtf8("max-allocation-vault"),
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.uint(10000),
          Cl.stringUtf8("Max Allocation"),
          Cl.buffer(new Uint8Array(128).fill(0x01))
        ],
        deployer
      );

      expect(maxAllocationResult.result).toBeOk(Cl.bool(true));
    });

    it("handles non-existent vault queries gracefully", () => {
      const nonExistentVault = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-vault",
        [Cl.stringUtf8("non-existent-vault")],
        deployer
      );

      expect(nonExistentVault.result).toBeNone();

      const nonExistentProof = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-proof-of-life",
        [Cl.stringUtf8("non-existent-vault")],
        deployer
      );

      expect(nonExistentProof.result).toBeNone();

      const nonExistentBeneficiary = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-beneficiary",
        [Cl.stringUtf8("non-existent-vault"), Cl.uint(0)],
        deployer
      );

      expect(nonExistentBeneficiary.result).toBeNone();
    });
  });
});