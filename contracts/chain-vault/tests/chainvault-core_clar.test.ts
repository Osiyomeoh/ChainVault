import { Cl, cvToValue } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

// Use the correct contract name that we discovered
const CONTRACT_NAME = "chainvault-core_clar";

describe("ChainVault Contract Tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("tests the create-vault function", () => {
    // First, let's check the initial state
    const initialTotalVaults = simnet.getDataVar(CONTRACT_NAME, "total-vaults");
    expect(initialTotalVaults).toBeUint(0);

    const initialContractVersion = simnet.getDataVar(CONTRACT_NAME, "contract-version");
    expect(initialContractVersion).toBeUint(1);

    // Test creating a vault
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("my-first-vault"),           // vault-id
        Cl.stringUtf8("My First Vault"),          // vault-name
        Cl.uint(144),                             // inheritance-delay (144 blocks)
        Cl.uint(2),                               // privacy-level (1-4)
        Cl.buffer(new Uint8Array(32).fill(0xaa)), // bitcoin-addresses-hash
        Cl.buffer(new Uint8Array(32).fill(0xbb)), // beneficiaries-hash
        Cl.uint(72)                               // grace-period
      ],
      deployer
    );

    // The function should return the vault-id on success
    expect(result).toBeOk(Cl.stringUtf8("my-first-vault"));

    // Check that total vaults increased
    const updatedTotalVaults = simnet.getDataVar(CONTRACT_NAME, "total-vaults");
    expect(updatedTotalVaults).toBeUint(1);

    // Verify the vault was actually created by checking the vault data
    const vault = simnet.getMapEntry(
      CONTRACT_NAME,
      "inheritance-vaults",
      Cl.tuple({ "vault-id": Cl.stringUtf8("my-first-vault") })
    );

    expect(vault).toBeSome(
      Cl.tuple({
        owner: Cl.principal(deployer),
        "created-at": Cl.uint(simnet.blockHeight),
        "last-activity": Cl.uint(simnet.blockHeight),
        "inheritance-delay": Cl.uint(144),
        status: Cl.stringUtf8("active"),
        "privacy-level": Cl.uint(2),
        "bitcoin-addresses-hash": Cl.buffer(new Uint8Array(32).fill(0xaa)),
        "beneficiaries-hash": Cl.buffer(new Uint8Array(32).fill(0xbb)),
        "legal-document-hash": Cl.buffer(new Uint8Array(32).fill(0x00)),
        "grace-period": Cl.uint(72),
        "emergency-contacts": Cl.list([]),
        "vault-name": Cl.stringUtf8("My First Vault"),
        "total-btc-value": Cl.uint(0)
      })
    );

    // Also check that proof-of-life was created
    const proofOfLife = simnet.getMapEntry(
      CONTRACT_NAME,
      "proof-of-life",
      Cl.tuple({ "vault-id": Cl.stringUtf8("my-first-vault") })
    );

    const currentBlock = simnet.blockHeight;
    expect(proofOfLife).toBeSome(
      Cl.tuple({
        "last-checkin": Cl.uint(currentBlock),
        "next-deadline": Cl.uint(currentBlock + 144),
        "reminder-count": Cl.uint(0),
        "grace-period-end": Cl.uint(currentBlock + 144 + 72),
        status: Cl.stringUtf8("active")
      })
    );
  });

  it("tests create-vault validation errors", () => {
    // Test duplicate vault creation
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

    // Try to create the same vault again - should fail
    const { result: duplicateResult } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("duplicate-vault"), // Same vault ID
        Cl.stringUtf8("Duplicate Vault"),
        Cl.uint(200),
        Cl.uint(3),
        Cl.buffer(new Uint8Array(32).fill(0xcc)),
        Cl.buffer(new Uint8Array(32).fill(0xdd)),
        Cl.uint(75)
      ],
      deployer
    );

    expect(duplicateResult).toBeErr(Cl.uint(102)); // ERR_VAULT_ALREADY_EXISTS

    // Test invalid privacy level (too low)
    const { result: lowPrivacyResult } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("invalid-privacy-low"),
        Cl.stringUtf8("Invalid Privacy"),
        Cl.uint(100),
        Cl.uint(0), // Invalid: below minimum
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(50)
      ],
      deployer
    );

    expect(lowPrivacyResult).toBeErr(Cl.uint(103)); // ERR_INVALID_PRIVACY_LEVEL

    // Test invalid privacy level (too high)
    const { result: highPrivacyResult } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("invalid-privacy-high"),
        Cl.stringUtf8("Invalid Privacy"),
        Cl.uint(100),
        Cl.uint(5), // Invalid: above maximum
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(50)
      ],
      deployer
    );

    expect(highPrivacyResult).toBeErr(Cl.uint(103)); // ERR_INVALID_PRIVACY_LEVEL
  });

  it("tests add-beneficiary function", () => {
    // First create a vault
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("beneficiary-test"),
        Cl.stringUtf8("Beneficiary Test Vault"),
        Cl.uint(100),
        Cl.uint(2),
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(50)
      ],
      deployer
    );

    // Add a beneficiary
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "add-beneficiary",
      [
        Cl.stringUtf8("beneficiary-test"),        // vault-id
        Cl.uint(0),                               // beneficiary-index
        Cl.principal(wallet1),                    // beneficiary-address
        Cl.uint(5000),                           // allocation-percentage (50%)
        Cl.stringUtf8("Primary beneficiary"),    // conditions
        Cl.buffer(new Uint8Array(128).fill(0x12)) // encrypted-metadata
      ],
      deployer
    );

    expect(result).toBeOk(Cl.bool(true));

    // Check beneficiary was stored
    const beneficiary = simnet.getMapEntry(
      CONTRACT_NAME,
      "vault-beneficiaries",
      Cl.tuple({
        "vault-id": Cl.stringUtf8("beneficiary-test"),
        "beneficiary-index": Cl.uint(0)
      })
    );

    expect(beneficiary).toBeSome(
      Cl.tuple({
        "beneficiary-address": Cl.principal(wallet1),
        "allocation-percentage": Cl.uint(5000),
        "allocation-conditions": Cl.stringUtf8("Primary beneficiary"),
        "notification-preference": Cl.uint(2), // matches vault privacy level
        "encrypted-metadata": Cl.buffer(new Uint8Array(128).fill(0x12))
      })
    );
  });

  it("tests read-only functions", () => {
    // Test get-total-vaults
    const totalVaults = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-total-vaults",
      [],
      deployer
    );
    expect(cvToValue(totalVaults.result)).toBeGreaterThanOrEqual(0);

    // Test get-contract-version
    const version = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-contract-version",
      [],
      deployer
    );
    expect(version.result).toBeUint(1);
  });
});