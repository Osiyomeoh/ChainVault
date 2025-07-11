import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  stringUtf8CV,
  uintCV,
  bufferCV,
  StacksTestnet,
  StacksMainnet,
  StacksNetwork,
} from '@stacks/transactions';
import { StacksApi } from '@stacks/blockchain-api-client';

export interface VaultDeploymentParams {
  vaultId: string;
  vaultName?: string;
  inheritanceDelay: number;
  privacyLevel: number;
  bitcoinAddressesHash: Buffer;
  beneficiariesHash: Buffer;
  gracePeriod: number;
}

export interface DeploymentResult {
  transactionId: string;
  contractAddress: string;
  success: boolean;
}

@Injectable()
export class StacksService {
  private readonly logger = new Logger(StacksService.name);
  private readonly network: StacksNetwork;
  private readonly stacksApi: StacksApi;
  private readonly contractAddress: string;

  constructor(private configService: ConfigService) {
    this.network =
      configService.get('stacksNetwork') === 'mainnet'
        ? new StacksMainnet()
        : new StacksTestnet();

    this.stacksApi = new StacksApi({
      baseUrl: configService.get('stacksApiUrl'),
    });

    this.contractAddress = configService.get('chainvaultContractAddress');
  }

  async deployVault(params: VaultDeploymentParams): Promise<DeploymentResult> {
    try {
      this.logger.log(`Deploying vault: ${params.vaultId}`);

      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: 'chainvault-core',
        functionName: 'create-vault',
        functionArgs: [
          stringUtf8CV(params.vaultId),
          stringUtf8CV(params.vaultName || 'ChainVault'),
          uintCV(params.inheritanceDelay),
          uintCV(params.privacyLevel),
          bufferCV(params.bitcoinAddressesHash),
          bufferCV(params.beneficiariesHash),
          uintCV(params.gracePeriod),
        ],
        senderKey: this.configService.get('stacksPrivateKey'),
        network: this.network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);

      if (broadcastResponse.error) {
        throw new Error(broadcastResponse.error);
      }

      this.logger.log(`Vault deployed successfully: ${broadcastResponse.txid}`);

      return {
        transactionId: broadcastResponse.txid,
        contractAddress: `${this.contractAddress}.chainvault-core`,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to deploy vault: ${error.message}`, error.stack);
      throw new Error(`Vault deployment failed: ${error.message}`);
    }
  }

  async updateProofOfLife(vaultId: string, userPrivateKey: string): Promise<string> {
    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: 'chainvault-core',
        functionName: 'update-proof-of-life',
        functionArgs: [stringUtf8CV(vaultId)],
        senderKey: userPrivateKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);

      if (broadcastResponse.error) {
        throw new Error(broadcastResponse.error);
      }

      return broadcastResponse.txid;
    } catch (error) {
      this.logger.error(`Failed to update proof of life: ${error.message}`);
      throw error;
    }
  }

  async getVaultStatus(vaultId: string): Promise<any> {
    try {
      const contractAddress = this.contractAddress;
      const contractName = 'chainvault-core';
      const functionName = 'get-vault';

      const callReadOnlyFunction = {
        contractAddress,
        contractName,
        functionName,
        functionArgs: [stringUtf8CV(vaultId)],
        senderAddress: contractAddress,
      };

      const result = await this.stacksApi.callReadOnlyFunction(callReadOnlyFunction);
      return this.parseContractResponse(result);
    } catch (error) {
      this.logger.error(`Failed to get vault status: ${error.message}`);
      throw error;
    }
  }

  async triggerInheritance(vaultId: string): Promise<string> {
    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: 'chainvault-core',
        functionName: 'trigger-inheritance',
        functionArgs: [stringUtf8CV(vaultId)],
        senderKey: this.configService.get('stacksPrivateKey'),
        network: this.network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);

      if (broadcastResponse.error) {
        throw new Error(broadcastResponse.error);
      }

      return broadcastResponse.txid;
    } catch (error) {
      this.logger.error(`Failed to trigger inheritance: ${error.message}`);
      throw error;
    }
  }

  async getProofOfLifeStatus(vaultId: string): Promise<any> {
    try {
      const callReadOnlyFunction = {
        contractAddress: this.contractAddress,
        contractName: 'chainvault-core',
        functionName: 'get-proof-of-life',
        functionArgs: [stringUtf8CV(vaultId)],
        senderAddress: this.contractAddress,
      };

      const result = await this.stacksApi.callReadOnlyFunction(callReadOnlyFunction);
      return this.parseContractResponse(result);
    } catch (error) {
      this.logger.error(`Failed to get proof of life status: ${error.message}`);
      throw error;
    }
  }

  private parseContractResponse(response: any): any {
    return {
      exists: response.okay,
      status: response.result?.status?.value || 'unknown',
      lastActivity: parseInt(response.result?.['last-activity']?.value || '0'),
      owner: response.result?.owner?.value || '',
      privacyLevel: parseInt(response.result?.['privacy-level']?.value || '1'),
    };
  }
}