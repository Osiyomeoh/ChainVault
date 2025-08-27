import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    stringUtf8CV,
    uintCV,
    bufferCV,
    boolCV,
    listCV,
    tupleCV,
    standardPrincipalCV,
    callReadOnlyFunction,
    cvToString,
  } from '@stacks/transactions';
  import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
  import { UserSession } from '@stacks/connect';
  
  interface SBTCBeneficiaryInput {
    address: string;
    allocationPercentage: number;
    minimumSbtcAmount: number;
  }
  
  class SBTCStacksService {
    private contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    private contractName = 'sbtc-inheritance-vault';
    private sbtcTokenAddress = process.env.REACT_APP_SBTC_TOKEN_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    private sbtcTokenName = 'sbtc-token';
    private network: StacksNetwork;
  
    constructor() {
      this.network = process.env.REACT_APP_NETWORK === 'mainnet' 
        ? new StacksMainnet()
        : new StacksTestnet();
    }
  
    async createSBTCVault(
      userSession: UserSession,
      vaultId: string,
      vaultName: string,
      inheritanceDelay: number,
      privacyLevel: number,
      gracePeriod: number,
      autoDistribute: boolean,
      minimumInheritance: number,
      beneficiaries: SBTCBeneficiaryInput[]
    ): Promise<string> {
      console.log('Creating sBTC vault with smart contract:', {
        vaultId,
        vaultName,
        inheritanceDelay,
        beneficiariesCount: beneficiaries.length
      });
  
      const functionArgs = [
        stringUtf8CV(vaultId),
        stringUtf8CV(vaultName),
        uintCV(inheritanceDelay),
        uintCV(privacyLevel),
        uintCV(gracePeriod),
        boolCV(autoDistribute),
        uintCV(minimumInheritance),
        listCV(beneficiaries.map(b => tupleCV({
          'beneficiary-address': standardPrincipalCV(b.address),
          'allocation-percentage': uintCV(b.allocationPercentage),
          'minimum-sbtc-amount': uintCV(b.minimumSbtcAmount)
        })))
      ];
  
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'create-sbtc-vault',
        functionArgs,
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 10000 // Set reasonable fee
      };
  
      try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, this.network);
        
        if (broadcastResponse.error) {
          throw new Error(`Transaction failed: ${broadcastResponse.error}`);
        }
  
        return broadcastResponse.txid;
      } catch (error) {
        console.error('Failed to create sBTC vault:', error);
        throw new Error(`Failed to create sBTC vault: ${error}`);
      }
    }
  
    async depositSBTC(
      userSession: UserSession,
      vaultId: string,
      amount: number
    ): Promise<string> {
      console.log('Depositing sBTC:', { vaultId, amount });
  
      const functionArgs = [
        stringUtf8CV(vaultId),
        uintCV(amount)
      ];
  
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'deposit-sbtc',
        functionArgs,
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 5000
      };
  
      try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, this.network);
        
        if (broadcastResponse.error) {
          throw new Error(`Deposit failed: ${broadcastResponse.error}`);
        }
  
        return broadcastResponse.txid;
      } catch (error) {
        console.error('Failed to deposit sBTC:', error);
        throw new Error(`Failed to deposit sBTC: ${error}`);
      }
    }
  
    async withdrawSBTC(
      userSession: UserSession,
      vaultId: string,
      amount: number
    ): Promise<string> {
      console.log('Withdrawing sBTC:', { vaultId, amount });
  
      const functionArgs = [
        stringUtf8CV(vaultId),
        uintCV(amount)
      ];
  
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'withdraw-sbtc',
        functionArgs,
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 5000
      };
  
      try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, this.network);
        
        if (broadcastResponse.error) {
          throw new Error(`Withdrawal failed: ${broadcastResponse.error}`);
        }
  
        return broadcastResponse.txid;
      } catch (error) {
        console.error('Failed to withdraw sBTC:', error);
        throw new Error(`Failed to withdraw sBTC: ${error}`);
      }
    }
  
    async updateProofOfLife(
      userSession: UserSession,
      vaultId: string
    ): Promise<string> {
      console.log('Updating proof of life:', { vaultId });
  
      const functionArgs = [
        stringUtf8CV(vaultId)
      ];
  
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'update-proof-of-life',
        functionArgs,
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 3000
      };
  
      try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, this.network);
        
        if (broadcastResponse.error) {
          throw new Error(`Proof of life update failed: ${broadcastResponse.error}`);
        }
  
        return broadcastResponse.txid;
      } catch (error) {
        console.error('Failed to update proof of life:', error);
        throw new Error(`Failed to update proof of life: ${error}`);
      }
    }
  
    async triggerSBTCInheritance(
      userSession: UserSession,
      vaultId: string
    ): Promise<string> {
      console.log('Triggering sBTC inheritance:', { vaultId });
  
      const functionArgs = [
        stringUtf8CV(vaultId)
      ];
  
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'trigger-sbtc-inheritance',
        functionArgs,
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 8000
      };
  
      try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, this.network);
        
        if (broadcastResponse.error) {
          throw new Error(`Inheritance trigger failed: ${broadcastResponse.error}`);
        }
  
        return broadcastResponse.txid;
      } catch (error) {
        console.error('Failed to trigger inheritance:', error);
        throw new Error(`Failed to trigger inheritance: ${error}`);
      }
    }
  
    async claimSBTCInheritance(
      userSession: UserSession,
      vaultId: string,
      beneficiaryIndex: number
    ): Promise<string> {
      console.log('Claiming sBTC inheritance:', { vaultId, beneficiaryIndex });
  
      const functionArgs = [
        stringUtf8CV(vaultId),
        uintCV(beneficiaryIndex)
      ];
  
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'claim-sbtc-inheritance',
        functionArgs,
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 8000
      };
  
      try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, this.network);
        
        if (broadcastResponse.error) {
          throw new Error(`Inheritance claim failed: ${broadcastResponse.error}`);
        }
  
        return broadcastResponse.txid;
      } catch (error) {
        console.error('Failed to claim inheritance:', error);
        throw new Error(`Failed to claim inheritance: ${error}`);
      }
    }
  
    async getVaultData(vaultId: string): Promise<any> {
      console.log('Reading vault data from contract:', { vaultId });
  
      try {
        const result = await callReadOnlyFunction({
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: 'get-vault',
          functionArgs: [stringUtf8CV(vaultId)],
          network: this.network,
          senderAddress: this.contractAddress
        });
  
        return result;
      } catch (error) {
        console.error('Failed to read vault data:', error);
        throw new Error(`Failed to read vault data: ${error}`);
      }
    }
  
    async getSBTCBalance(address: string): Promise<number> {
      console.log('Getting sBTC balance for address:', address);
  
      try {
        const result = await callReadOnlyFunction({
          contractAddress: this.sbtcTokenAddress,
          contractName: this.sbtcTokenName,
          functionName: 'get-balance',
          functionArgs: [standardPrincipalCV(address)],
          network: this.network,
          senderAddress: address
        });
  
        // Parse the result to get balance
        const balanceString = cvToString(result);
        return parseInt(balanceString.replace(/\D/g, '')) || 0;
      } catch (error) {
        console.error('Failed to get sBTC balance:', error);
        return 0;
      }
    }
  
    async isVaultOwner(vaultId: string, address: string): Promise<boolean> {
      try {
        const result = await callReadOnlyFunction({
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: 'is-vault-owner',
          functionArgs: [
            stringUtf8CV(vaultId),
            standardPrincipalCV(address)
          ],
          network: this.network,
          senderAddress: address
        });
  
        return cvToString(result).includes('true');
      } catch (error) {
        console.error('Failed to check vault ownership:', error);
        return false;
      }
    }
  
    async canTriggerInheritance(vaultId: string): Promise<boolean> {
      try {
        const result = await callReadOnlyFunction({
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: 'can-trigger-inheritance',
          functionArgs: [stringUtf8CV(vaultId)],
          network: this.network,
          senderAddress: this.contractAddress
        });
  
        return cvToString(result).includes('true');
      } catch (error) {
        console.error('Failed to check inheritance trigger status:', error);
        return false;
      }
    }
  
    // Utility functions
    getExplorerUrl(txId: string): string {
      const baseUrl = this.network.coreApiUrl.includes('testnet') 
        ? 'https://explorer.hiro.so/txid'
        : 'https://explorer.hiro.so/txid';
      return `${baseUrl}/${txId}?chain=testnet`;
    }
  
    getContractUrl(): string {
      const baseUrl = this.network.coreApiUrl.includes('testnet')
        ? 'https://explorer.hiro.so/txid'
        : 'https://explorer.hiro.so/txid';
      return `${baseUrl}/${this.contractAddress}.${this.contractName}?chain=testnet`;
    }
  }
  
  export const sbtcStacksService = new SBTCStacksService();