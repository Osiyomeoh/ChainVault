import { Cl, cvToValue } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "chainvault-core_clar";

describe("ChainVault Contract Tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("tests the create-vault function", () => {
    const initialTotalVaults = simnet.getDataVar(CONTRACT_NAME, "total-vaults");
    expect(initialTotalVaults).toBeUint(0);

    const initialContractVersion = simnet.getDataVar(CONTRACT_NAME, "contract-version");
    expect(initialContractVersion).toBeUint(1);

    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("my-first-vault"),
        Cl.stringUtf8("My First Vault"),
        Cl.uint(144),
        Cl.uint(2),
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(72)
      ],
      deployer
    );

    expect(result).toBeOk(Cl.stringUtf8("my-first-vault"));

    const updatedTotalVaults = simnet.getDataVar(CONTRACT_NAME, "total-vaults");
    expect(updatedTotalVaults).toBeUint(1);

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

    const { result: duplicateResult } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("duplicate-vault"),
        Cl.stringUtf8("Duplicate Vault"),
        Cl.uint(200),
        Cl.uint(3),
        Cl.buffer(new Uint8Array(32).fill(0xcc)),
        Cl.buffer(new Uint8Array(32).fill(0xdd)),
        Cl.uint(75)
      ],
      deployer
    );

    expect(duplicateResult).toBeErr(Cl.uint(102));

    const { result: lowPrivacyResult } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("invalid-privacy-low"),
        Cl.stringUtf8("Invalid Privacy"),
        Cl.uint(100),
        Cl.uint(0),
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(50)
      ],
      deployer
    );

    expect(lowPrivacyResult).toBeErr(Cl.uint(103));

    const { result: highPrivacyResult } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("invalid-privacy-high"),
        Cl.stringUtf8("Invalid Privacy"),
        Cl.uint(100),
        Cl.uint(5),
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(50)
      ],
      deployer
    );

    expect(highPrivacyResult).toBeErr(Cl.uint(103));
  });

  it("tests add-beneficiary function", () => {
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

    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "add-beneficiary",
      [
        Cl.stringUtf8("beneficiary-test"),
        Cl.uint(0),
        Cl.principal(wallet1),
        Cl.uint(5000),
        Cl.stringUtf8("Primary beneficiary"),
        Cl.buffer(new Uint8Array(128).fill(0x12))
      ],
      deployer
    );

    expect(result).toBeOk(Cl.bool(true));

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
        "notification-preference": Cl.uint(2),
        "encrypted-metadata": Cl.buffer(new Uint8Array(128).fill(0x12))
      })
    );
  });

  it("tests update-proof-of-life function", () => {
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [
        Cl.stringUtf8("proof-of-life-test"),
        Cl.stringUtf8("Proof of Life Test Vault"),
        Cl.uint(100),
        Cl.uint(2),
        Cl.buffer(new Uint8Array(32).fill(0xaa)),
        Cl.buffer(new Uint8Array(32).fill(0xbb)),
        Cl.uint(50)
      ],
      deployer
    );

    simnet.mineEmptyBlocks(10);

    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "update-proof-of-life",
      [Cl.stringUtf8("proof-of-life-test")],
      deployer
    );

    expect(result).toBeOk(Cl.bool(true));

    const updatedProof = simnet.getMapEntry(
      CONTRACT_NAME,
      "proof-of-life",
      Cl.tuple({ "vault-id": Cl.stringUtf8("proof-of-life-test") })
    );

    const currentBlock = simnet.blockHeight;
    expect(updatedProof).toBeSome(
      Cl.tuple({
        "last-checkin": Cl.uint(currentBlock),
        "next-deadline": Cl.uint(currentBlock + 100),
        "reminder-count": Cl.uint(0),
        "grace-period-end": Cl.uint(currentBlock + 100 + 50),
        status: Cl.stringUtf8("active")
      })
    );

    const updatedVault = simnet.getMapEntry(
      CONTRACT_NAME,
      "inheritance-vaults",
      Cl.tuple({ "vault-id": Cl.stringUtf8("proof-of-life-test") })
    );

    expect(updatedVault).toBeSome(
      Cl.tuple({
        owner: Cl.principal(deployer),
        "created-at": Cl.uint(3),
        "last-activity": Cl.uint(currentBlock),
        "inheritance-delay": Cl.uint(100),
        status: Cl.stringUtf8("active"),
        "privacy-level": Cl.uint(2),
        "bitcoin-addresses-hash": Cl.buffer(new Uint8Array(32).fill(0xaa)),
        "beneficiaries-hash": Cl.buffer(new Uint8Array(32).fill(0xbb)),
        "legal-document-hash": Cl.buffer(new Uint8Array(32).fill(0x00)),
        "grace-period": Cl.uint(50),
        "emergency-contacts": Cl.list([]),
        "vault-name": Cl.stringUtf8("Proof of Life Test Vault"),
        "total-btc-value": Cl.uint(0)
      })
    );

    const { result: unauthorizedResult } = simnet.callPublicFn(
      CONTRACT_NAME,
      "update-proof-of-life",
      [Cl.stringUtf8("proof-of-life-test")],
      wallet1
    );

    expect(unauthorizedResult).toBeErr(Cl.uint(100));
  });

  it("tests read-only functions", () => {
    const totalVaults = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-total-vaults",
      [],
      deployer
    );
    expect(cvToValue(totalVaults.result)).toBeGreaterThanOrEqual(0);

    const version = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-contract-version",
      [],
      deployer
    );
    expect(version.result).toBeUint(1);
  });
});