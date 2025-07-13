import { Vault, ProofOfLife, Beneficiary, CreateVaultRequest, BitcoinBalance } from '@/types';
import { stacksService } from './stacksService';
import { encryptionService } from './encryptionService';
import { apiService } from './apiService';
import { bitcoinService } from './bitcoinService';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

class VaultService {
  async createVault(vaultData: CreateVaultRequest & { userSession: any }): Promise<string | null> {
    try {
      const vaultId = uuidv4();
      
      // Encrypt sensitive data
      const encryptedBitcoinAddresses = await encryptionService.encryptData(
        JSON.stringify(vaultData.bitcoinAddresses)
      );
      
      const encryptedBeneficiaries = await encryptionService.encryptData(
        JSON.stringify(vaultData.beneficiaries)
      );

      // Create hashes for on-chain storage
      const bitcoinAddressesHash = CryptoJS.SHA256(encryptedBitcoinAddresses).toString();
      const beneficiariesHash = CryptoJS.SHA256(encryptedBeneficiaries).toString();

      // Store encrypted data off-chain via API
      await apiService.storeVaultData(vaultId, {
        encryptedBitcoinAddresses,
        encryptedBeneficiaries,
        vaultName: vaultData.vaultName,
        legalDocuments: vaultData.legalDocuments || [],
      });

      // Create vault on Stacks blockchain
      await stacksService.createVault(
        vaultData.userSession,
        vaultId,
        vaultData.vaultName,
        vaultData.inheritanceDelay,
        vaultData.privacyLevel,
        new TextEncoder().encode(bitcoinAddressesHash),
        new TextEncoder().encode(beneficiariesHash),
        vaultData.gracePeriod
      );

      // Add beneficiaries to blockchain
      for (let i = 0; i < vaultData.beneficiaries.length; i++) {
        const beneficiary = vaultData.beneficiaries[i];
        const encryptedMetadata = await encryptionService.encryptData(
          JSON.stringify({
            name: beneficiary.name,
            email: beneficiary.email,
            relationship: beneficiary.relationship,
          })
        );

        await stacksService.addBeneficiary(
          vaultData.userSession,
          vaultId,
          i,
          beneficiary.email, // This would be their Stacks address in production
          beneficiary.allocationPercentage * 100, // Convert to basis points
          beneficiary.conditions || '',
          new TextEncoder().encode(encryptedMetadata)
        );
      }

      return vaultId;
    } catch (error) {
      console.error('Failed to create vault:', error);
      throw error;
    }
  }

  async getUserVaults(userAddress: string): Promise<Vault[]> {
    try {
      // Get vaults from API (which tracks user-vault relationships)
      const vaultIds = await apiService.getUserVaults(userAddress);
      
      const vaults: Vault[] = [];
      for (const vaultId of vaultIds) {
        try {
          const vaultData = await stacksService.getVault(vaultId);
          if (vaultData.value) {
            const vault: Vault = {
              id: vaultId,
              vaultId,
              owner: vaultData.value.owner.value,
              vaultName: vaultData.value['vault-name'].value,
              createdAt: parseInt(vaultData.value['created-at'].value),
              lastActivity: parseInt(vaultData.value['last-activity'].value),
              inheritanceDelay: parseInt(vaultData.value['inheritance-delay'].value),
              status: vaultData.value.status.value as any,
              privacyLevel: parseInt(vaultData.value['privacy-level'].value) as any,
              bitcoinAddressesHash: vaultData.value['bitcoin-addresses-hash'].value,
              beneficiariesHash: vaultData.value['beneficiaries-hash'].value,
              legalDocumentHash: vaultData.value['legal-document-hash']?.value,
              gracePeriod: parseInt(vaultData.value['grace-period'].value),
              emergencyContacts: vaultData.value['emergency-contacts'].value || [],
              totalBtcValue: parseInt(vaultData.value['total-btc-value'].value),
            };
            vaults.push(vault);
          }
        } catch (error) {
          console.error(`Failed to fetch vault ${vaultId}:`, error);
        }
      }
      
      return vaults;
    } catch (error) {
      console.error('Failed to get user vaults:', error);
      return [];
    }
  }

  async getProofOfLife(vaultId: string): Promise<ProofOfLife | null> {
    try {
      const proofData = await stacksService.getProofOfLife(vaultId);
      if (proofData.value) {
        return {
          vaultId,
          lastCheckin: parseInt(proofData.value['last-checkin'].value),
          nextDeadline: parseInt(proofData.value['next-deadline'].value),
          reminderCount: parseInt(proofData.value['reminder-count'].value),
          gracePeriodEnd: parseInt(proofData.value['grace-period-end'].value),
          status: proofData.value.status.value,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get proof of life:', error);
      return null;
    }
  }

  async updateProofOfLife(vaultId: string): Promise<boolean> {
    try {
      // This would need to be called with the user's session
      // For now, we'll call via API which handles the transaction
      return await apiService.updateProofOfLife(vaultId);
    } catch (error) {
      console.error('Failed to update proof of life:', error);
      return false;
    }
  }

  async getVaultBeneficiaries(vaultId: string): Promise<Beneficiary[]> {
    try {
      const beneficiaries: Beneficiary[] = [];
      
      // Try to fetch beneficiaries (we don't know the count, so we'll try up to 10)
      for (let i = 0; i < 10; i++) {
        try {
          const beneficiaryData = await stacksService.getBeneficiary(vaultId, i);
          if (beneficiaryData.value) {
            const beneficiary: Beneficiary = {
              vaultId,
              beneficiaryIndex: i,
              beneficiaryAddress: beneficiaryData.value['beneficiary-address'].value,
              allocationPercentage: parseInt(beneficiaryData.value['allocation-percentage'].value) / 100,
              allocationConditions: beneficiaryData.value['allocation-conditions'].value,
              notificationPreference: parseInt(beneficiaryData.value['notification-preference'].value),
              encryptedMetadata: beneficiaryData.value['encrypted-metadata'].value,
            };
            beneficiaries.push(beneficiary);
          } else {
            break; // No more beneficiaries
          }
        } catch (error) {
          break; // No more beneficiaries or error
        }
      }
      
      return beneficiaries;
    } catch (error) {
      console.error('Failed to get vault beneficiaries:', error);
      return [];
    }
  }

  async getBitcoinBalances(vaultId: string): Promise<BitcoinBalance[]> {
    try {
      // Get encrypted Bitcoin addresses from API
      const vaultData = await apiService.getVaultData(vaultId);
      const decryptedAddresses = await encryptionService.decryptData(vaultData.encryptedBitcoinAddresses);
      const addresses: string[] = JSON.parse(decryptedAddresses);
      
      const balances: BitcoinBalance[] = [];
      for (const address of addresses) {
        try {
          const balance = await bitcoinService.getAddressBalance(address);
          balances.push(balance);
        } catch (error) {
          console.error(`Failed to get balance for address ${address}:`, error);
        }
      }
      
      return balances;
    } catch (error) {
      console.error('Failed to get Bitcoin balances:', error);
      return [];
    }
  }

  async isInheritanceDue(vaultId: string): Promise<boolean> {
    try {
      return await stacksService.isInheritanceDue(vaultId);
    } catch (error) {
      console.error('Failed to check inheritance status:', error);
      return false;
    }
  }

  async triggerInheritance(vaultId: string, userSession: any): Promise<boolean> {
    try {
      const txId = await stacksService.triggerInheritance(userSession, vaultId);
      return !!txId;
    } catch (error) {
      console.error('Failed to trigger inheritance:', error);
      return false;
    }
  }
}

export const vaultService = new VaultService();