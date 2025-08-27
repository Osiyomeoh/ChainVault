import { SBTCVault, SBTCVaultStats, SBTCTransaction, CreateSBTCVaultData, SBTCBeneficiary } from '../types/sbtc';
import { sbtcStacksService } from './sbtcStacksService';
import { apiService } from './apiService';

class SBTCVaultService {
  async getUserVaults(userAddress: string): Promise<SBTCVault[]> {
    try {
      console.log('Getting vaults for user:', userAddress);
      
      // For now, return mock data while backend is being built
      const mockVaults: SBTCVault[] = [
        {
          id: 'sbtc-vault-1',
          vaultName: 'Family sBTC Legacy',
          owner: userAddress,
          inheritanceDelay: 144 * 365, // 1 year in blocks
          lastActivity: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
          status: 'active',
          sbtcBalance: 50000000, // 0.5 sBTC in satoshis
          sbtcLocked: false,
          minimumInheritance: 10000000, // 0.1 sBTC
          autoDistribute: true,
          privacyLevel: 2,
          gracePeriod: 144 * 7, // 1 week
          beneficiaries: [
            {
              id: 'ben-1',
              address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
              allocationPercentage: 60,
              minimumSbtcAmount: 5000000,
              sbtcClaimed: false,
              claimDeadline: 0,
              relationshipToOwner: 'Spouse',
              contactInfo: 'spouse@email.com'
            },
            {
              id: 'ben-2', 
              address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
              allocationPercentage: 40,
              minimumSbtcAmount: 3000000,
              sbtcClaimed: false,
              claimDeadline: 0,
              relationshipToOwner: 'Child',
              contactInfo: 'child@email.com'
            }
          ],
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
          updatedAt: Math.floor(Date.now() / 1000) - 86400
        },
        {
          id: 'sbtc-vault-2',
          vaultName: 'Emergency sBTC Fund',
          owner: userAddress,
          inheritanceDelay: 144 * 30, // 30 days
          lastActivity: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          status: 'active',
          sbtcBalance: 25000000, // 0.25 sBTC
          sbtcLocked: true,
          minimumInheritance: 5000000, // 0.05 sBTC
          autoDistribute: false,
          privacyLevel: 4, // Transparent
          gracePeriod: 144 * 3, // 3 days
          beneficiaries: [
            {
              id: 'ben-3',
              address: 'SP1K1A1PMGW2BU1WMA7SEQSFSW9WXHK4KK1H1FR5M',
              allocationPercentage: 100,
              minimumSbtcAmount: 25000000,
              sbtcClaimed: false,
              claimDeadline: 0,
              relationshipToOwner: 'Trust',
              contactInfo: 'trust@family.com'
            }
          ],
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 7,
          updatedAt: Math.floor(Date.now() / 1000) - 3600
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockVaults;

    } catch (error) {
      console.error('Failed to get user vaults:', error);
      return [];
    }
  }

  async getVaultStats(userAddress: string): Promise<SBTCVaultStats> {
    try {
      const vaults = await this.getUserVaults(userAddress);
      
      const stats: SBTCVaultStats = {
        totalVaults: vaults.length,
        totalSbtcLocked: vaults.reduce((sum, vault) => sum + vault.sbtcBalance, 0),
        totalSbtcValue: vaults.reduce((sum, vault) => sum + vault.sbtcBalance, 0) * 45000 / 100000000, // Convert to USD
        activeVaults: vaults.filter(v => v.status === 'active').length,
        nearDeadlineVaults: vaults.filter(v => {
          const daysSinceLastActivity = Math.floor((Date.now() / 1000 - v.lastActivity) / 86400);
          const inheritanceDelayDays = Math.floor(v.inheritanceDelay / 144);
          return daysSinceLastActivity > inheritanceDelayDays * 0.8;
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Failed to get vault stats:', error);
      return {
        totalVaults: 0,
        totalSbtcLocked: 0,
        totalSbtcValue: 0,
        activeVaults: 0,
        nearDeadlineVaults: 0
      };
    }
  }

  async getTransactions(userAddress: string): Promise<SBTCTransaction[]> {
    try {
      // Mock transaction data
      const mockTransactions: SBTCTransaction[] = [
        {
          id: 'tx-1',
          vaultId: 'sbtc-vault-1',
          type: 'deposit',
          amount: 50000000,
          txId: '0x123...abc',
          status: 'confirmed',
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 30
        },
        {
          id: 'tx-2',
          vaultId: 'sbtc-vault-2',
          type: 'deposit', 
          amount: 25000000,
          txId: '0x456...def',
          status: 'confirmed',
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 7
        },
        {
          id: 'tx-3',
          vaultId: 'sbtc-vault-1',
          type: 'proof-of-life',
          txId: '0x789...ghi',
          status: 'confirmed',
          timestamp: Math.floor(Date.now() / 1000) - 86400
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTransactions;
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  async createVault(userAddress: string, vaultData: CreateSBTCVaultData): Promise<string> {
    try {
      console.log('Creating sBTC vault:', vaultData);
      
      // Generate unique vault ID
      const vaultId = `sbtc-vault-${Date.now()}`;
      
      // In production, call smart contract
      // const txId = await sbtcStacksService.createSBTCVault(...);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return vaultId;
    } catch (error) {
      console.error('Failed to create vault:', error);
      throw new Error('Failed to create sBTC vault');
    }
  }

  async depositSBTC(vaultId: string, amount: number): Promise<string> {
    try {
      console.log(`Depositing ${amount} satoshis to vault ${vaultId}`);
      
      // In production, call smart contract
      // const txId = await sbtcStacksService.depositSBTC(vaultId, amount);
      
      // Mock transaction ID
      const txId = `0x${Math.random().toString(16).slice(2)}`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return txId;
    } catch (error) {
      console.error('Failed to deposit sBTC:', error);
      throw new Error('Failed to deposit sBTC');
    }
  }

  async withdrawSBTC(vaultId: string, amount: number): Promise<string> {
    try {
      console.log(`Withdrawing ${amount} satoshis from vault ${vaultId}`);
      
      // In production, call smart contract
      // const txId = await sbtcStacksService.withdrawSBTC(vaultId, amount);
      
      // Mock transaction ID
      const txId = `0x${Math.random().toString(16).slice(2)}`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return txId;
    } catch (error) {
      console.error('Failed to withdraw sBTC:', error);
      throw new Error('Failed to withdraw sBTC');
    }
  }

  async updateProofOfLife(vaultId: string): Promise<void> {
    try {
      console.log(`Updating proof of life for vault ${vaultId}`);
      
      // In production, call smart contract
      // await sbtcStacksService.updateProofOfLife(vaultId);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Failed to update proof of life:', error);
      throw new Error('Failed to update proof of life');
    }
  }

  async triggerInheritance(vaultId: string): Promise<void> {
    try {
      console.log(`Triggering inheritance for vault ${vaultId}`);
      
      // In production, call smart contract
      // await sbtcStacksService.triggerInheritance(vaultId);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Failed to trigger inheritance:', error);
      throw new Error('Failed to trigger inheritance');
    }
  }

  async claimInheritance(vaultId: string, beneficiaryIndex: number): Promise<string> {
    try {
      console.log(`Claiming inheritance from vault ${vaultId}, beneficiary ${beneficiaryIndex}`);
      
      // In production, call smart contract
      // const txId = await sbtcStacksService.claimInheritance(vaultId, beneficiaryIndex);
      
      // Mock transaction ID
      const txId = `0x${Math.random().toString(16).slice(2)}`;
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      return txId;
    } catch (error) {
      console.error('Failed to claim inheritance:', error);
      throw new Error('Failed to claim inheritance');
    }
  }

  // Utility functions
  satoshisToSBTC(satoshis: number): number {
    return satoshis / 100000000;
  }

  sbtcToSatoshis(sbtc: number): number {
    return Math.floor(sbtc * 100000000);
  }

  formatSBTC(satoshis: number): string {
    const sbtc = this.satoshisToSBTC(satoshis);
    return `${sbtc.toFixed(8)} sBTC`;
  }

  calculateInheritanceDeadline(vault: SBTCVault): number {
    return vault.lastActivity + (vault.inheritanceDelay * 600); // 10 minutes per block
  }

  isNearDeadline(vault: SBTCVault): boolean {
    const deadline = this.calculateInheritanceDeadline(vault);
    const now = Math.floor(Date.now() / 1000);
    const timeUntilDeadline = deadline - now;
    const warningThreshold = vault.inheritanceDelay * 600 * 0.2; // 20% of total time
    
    return timeUntilDeadline <= warningThreshold && timeUntilDeadline > 0;
  }

  isPastDeadline(vault: SBTCVault): boolean {
    const deadline = this.calculateInheritanceDeadline(vault);
    const now = Math.floor(Date.now() / 1000);
    
    return now > deadline;
  }
}

export const sbtcVaultService = new SBTCVaultService();