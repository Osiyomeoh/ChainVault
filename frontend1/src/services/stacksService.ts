import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    stringUtf8CV,
    uintCV,
    bufferCV,
    contractPrincipalCV,
    standardPrincipalCV,
    tupleCV,
    listCV,
    callReadOnlyFunction,
    cvToJSON,
  } from '@stacks/transactions';
  import { StacksNetwork } from '@stacks/network';
  import { networkConfig, getStacksNetwork, CONTRACT_FUNCTIONS } from '@/config';
  import { UserSession } from '@stacks/connect';
  
  class StacksService {
    private network: StacksNetwork;
    
    constructor() {
      this.network = getStacksNetwork();
    }
  
    async createVault(
      userSession: UserSession,
      vaultId: string,
      vaultName: string,
      inheritanceDelay: number,
      privacyLevel: number,
      bitcoinAddressesHash: Uint8Array,
      beneficiariesHash: Uint8Array,
      gracePeriod: number
    ): Promise<string> {
      const txOptions = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: CONTRACT_FUNCTIONS.CREATE_VAULT,
        functionArgs: [
          stringUtf8CV(vaultId),
          stringUtf8CV(vaultName),
          uintCV(inheritanceDelay),
          uintCV(privacyLevel),
          bufferCV(bitcoinAddressesHash),
          bufferCV(beneficiariesHash),
          uintCV(gracePeriod),
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };
  
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      if (broadcastResponse.error) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }
  
      return broadcastResponse.txid;
    }
  
    async updateProofOfLife(
      userSession: UserSession,
      vaultId: string
    ): Promise<string> {
      const txOptions = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: CONTRACT_FUNCTIONS.UPDATE_PROOF_OF_LIFE,
        functionArgs: [stringUtf8CV(vaultId)],
        senderKey: userSession.loadUserData().appPrivateKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };
  
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      if (broadcastResponse.error) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }
  
      return broadcastResponse.txid;
    }
  
    async addBeneficiary(
      userSession: UserSession,
      vaultId: string,
      beneficiaryIndex: number,
      beneficiaryAddress: string,
      allocationPercentage: number,
      conditions: string,
      encryptedMetadata: Uint8Array
    ): Promise<string> {
      const txOptions = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: CONTRACT_FUNCTIONS.ADD_BENEFICIARY,
        functionArgs: [
          stringUtf8CV(vaultId),
          uintCV(beneficiaryIndex),
          standardPrincipalCV(beneficiaryAddress),
          uintCV(allocationPercentage),
          stringUtf8CV(conditions),
          bufferCV(encryptedMetadata),
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };
  
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      if (broadcastResponse.error) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }
  
      return broadcastResponse.txid;
    }
  
    async triggerInheritance(
      userSession: UserSession,
      vaultId: string
    ): Promise<string> {
      const txOptions = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: CONTRACT_FUNCTIONS.TRIGGER_INHERITANCE,
        functionArgs: [stringUtf8CV(vaultId)],
        senderKey: userSession.loadUserData().appPrivateKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };
  
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      if (broadcastResponse.error) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }
  
      return broadcastResponse.txid;
    }
  
    async getVault(vaultId: string): Promise<any> {
      const options = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: 'get-vault',
        functionArgs: [stringUtf8CV(vaultId)],
        network: this.network,
        senderAddress: networkConfig.contractAddress,
      };
  
      const result = await callReadOnlyFunction(options);
      return cvToJSON(result);
    }
  
    async getProofOfLife(vaultId: string): Promise<any> {
      const options = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: 'get-proof-of-life',
        functionArgs: [stringUtf8CV(vaultId)],
        network: this.network,
        senderAddress: networkConfig.contractAddress,
      };
  
      const result = await callReadOnlyFunction(options);
      return cvToJSON(result);
    }
  
    async getBeneficiary(vaultId: string, beneficiaryIndex: number): Promise<any> {
      const options = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: 'get-beneficiary',
        functionArgs: [stringUtf8CV(vaultId), uintCV(beneficiaryIndex)],
        network: this.network,
        senderAddress: networkConfig.contractAddress,
      };
  
      const result = await callReadOnlyFunction(options);
      return cvToJSON(result);
    }
  
    async isInheritanceDue(vaultId: string): Promise<boolean> {
      const options = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: 'is-inheritance-due',
        functionArgs: [stringUtf8CV(vaultId)],
        network: this.network,
        senderAddress: networkConfig.contractAddress,
      };
  
      const result = await callReadOnlyFunction(options);
      const jsonResult = cvToJSON(result);
      return jsonResult.value === true;
    }
  
    async getTotalVaults(): Promise<number> {
      const options = {
        contractAddress: networkConfig.contractAddress,
        contractName: networkConfig.contractName,
        functionName: 'get-total-vaults',
        functionArgs: [],
        network: this.network,
        senderAddress: networkConfig.contractAddress,
      };
  
      const result = await callReadOnlyFunction(options);
      const jsonResult = cvToJSON(result);
      return parseInt(jsonResult.value);
    }
  }
  
  export const stacksService = new StacksService();
  