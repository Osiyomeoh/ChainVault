import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SBTCVault, 
  SBTCVaultStats, 
  SBTCTransaction, 
  CreateSBTCVaultData,
  CreateBeneficiaryData
} from '../types/index';
import { useAuth } from './AuthContext';
import { sbtcStacksService } from '../services/sbtcStacksService';

import { toast } from 'react-hot-toast';

interface SBTCVaultContextType {
  vaults: SBTCVault[];
  stats: SBTCVaultStats;
  transactions: SBTCTransaction[];
  loading: boolean;
  selectedVault: SBTCVault | null;
  
  // Vault Management
  createVault: (vaultData: CreateSBTCVaultData) => Promise<string>;
  addBeneficiary: (vaultId: string, beneficiaryData: CreateBeneficiaryData) => Promise<string>;
  updateProofOfLife: (vaultId: string) => Promise<void>;
  triggerInheritance: (vaultId: string) => Promise<void>;
  
  // sBTC Operations
  depositSBTC: (vaultId: string, amount: number) => Promise<string>;
  withdrawSBTC: (vaultId: string, amount: number) => Promise<string>;
  claimInheritance: (vaultId: string, beneficiaryIndex: number) => Promise<string>;
  
  // Contract Read Functions
  getVaultSBTCBalance: (vaultId: string) => Promise<number>;
  getVaultInheritanceReadiness: (vaultId: string) => Promise<boolean>;
  calculateInheritanceAmount: (vaultId: string, beneficiaryIndex: number) => Promise<any>;
  
  // UI State
  setSelectedVault: (vault: SBTCVault | null) => void;
  refreshVaults: () => Promise<void>;
}

const SBTCVaultContext = createContext<SBTCVaultContextType | undefined>(undefined);

export function SBTCVaultProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, user } = useAuth();
  const [vaults, setVaults] = useState<SBTCVault[]>([]);
  const [stats, setStats] = useState<SBTCVaultStats>({
    totalVaults: 0,
    totalSbtcLocked: 0,
    totalSbtcValue: 0,
    activeVaults: 0,
    nearDeadlineVaults: 0
  });
  const [transactions, setTransactions] = useState<SBTCTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVault, setSelectedVault] = useState<SBTCVault | null>(null);

  const refreshVaults = async () => {
    if (!isSignedIn || !user?.address) return;
    
    setLoading(true);
    try {
      console.log('SBTCVaultContext: Refreshing vaults for', user.address);
      
      // Call the actual blockchain service to get user vaults
      const userVaults = await sbtcStacksService.getUserVaults(user.address);
      console.log('SBTCVaultContext: Got vaults from service:', userVaults);
      
      // Convert the service response to SBTCVault format
      console.log('🔍 DEBUG: Raw vault data from service:', userVaults);
      
      const formattedVaults: SBTCVault[] = userVaults.map((vault: any) => {
        const formattedVault = {
          id: vault.vaultId || vault.id || 'unknown',
          name: vault.name || 'Unnamed Vault',
          owner: vault.owner || user.address,
          status: vault.status || 'active',
          sbtcBalance: vault.sbtcBalance || 0,
          beneficiaries: vault.beneficiaries || [],
          inheritanceDelay: vault.inheritanceDelay || 0,
          privacyLevel: vault.privacyLevel || 1,
          gracePeriod: vault.gracePeriod || 30,
          autoDistribute: vault.autoDistribute || true,
          minimumInheritance: vault.minimumInheritance || 0,
          createdAt: new Date(vault.createdAt || Date.now()),
          lastActivity: new Date(vault.lastActivity || Date.now()),
          // Add missing required properties
          sbtcLocked: vault.sbtcLocked || false,
          totalFunds: vault.totalFunds || vault.sbtcBalance || 0,
          proofOfLife: vault.proofOfLife || {
            lastCheckin: new Date(),
            nextDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            reminderCount: 0,
            gracePeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'active'
          }
        };
        
        console.log('🔍 DEBUG: Formatted vault:', { 
          original: vault, 
          formatted: formattedVault,
          id: formattedVault.id,
          vaultId: vault.vaultId 
        });
        
        return formattedVault;
      });
      
      console.log('SBTCVaultContext: Formatted vaults:', formattedVaults);
      
      // Calculate stats from the vaults
      const vaultStats: SBTCVaultStats = {
        totalVaults: formattedVaults.length,
        totalSbtcLocked: formattedVaults.reduce((sum, vault) => sum + vault.sbtcBalance, 0),
        totalSbtcValue: formattedVaults.reduce((sum, vault) => sum + vault.sbtcBalance, 0) * 0.000001, // Convert to STX
        activeVaults: formattedVaults.filter(vault => vault.status === 'active').length,
        nearDeadlineVaults: 0 // TODO: Calculate based on grace period
      };
      
      const userTransactions: SBTCTransaction[] = []; // TODO: Implement transaction fetching
      
      console.log('SBTCVaultContext: Setting vaults and stats:', { vaults: formattedVaults.length, stats: vaultStats });
      
      setVaults(formattedVaults);
      setStats(vaultStats);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Failed to refresh vaults:', error);
      toast.error('Failed to load vaults');
    } finally {
      setLoading(false);
    }
  };

  const createVault = async (vaultData: CreateSBTCVaultData): Promise<string> => {
    if (!user?.address) throw new Error('User not authenticated');
    
    // TODO: This method is deprecated - use blockchain service directly
    throw new Error('createVault method is deprecated. Use the blockchain service directly from components.');
  };

  const addBeneficiary = async (vaultId: string, beneficiaryData: CreateBeneficiaryData): Promise<string> => {
    // TODO: This method is deprecated - use blockchain service directly
    throw new Error('addBeneficiary method is deprecated. Use the blockchain service directly from components.');
  };

  const updateProofOfLife = async (vaultId: string): Promise<void> => {
    // TODO: This method is deprecated - use blockchain service directly
    throw new Error('updateProofOfLife method is deprecated. Use the blockchain service directly from components.');
  };

  const triggerInheritance = async (vaultId: string): Promise<void> => {
    // TODO: This method is deprecated - use blockchain service directly
    throw new Error('triggerInheritance method is deprecated. Use the blockchain service directly from components.');
  };

  const depositSBTC = async (vaultId: string, amount: number): Promise<string> => {
    // TODO: This method is deprecated - use blockchain service directly
    throw new Error('depositSBTC method is deprecated. Use the blockchain service directly from components.');
  };

  const withdrawSBTC = async (vaultId: string, amount: number): Promise<string> => {
    // TODO: This method is deprecated - use blockchain service directly
    throw new Error('withdrawSBTC method is deprecated. Use the blockchain service directly from components.');
  };

  const claimInheritance = async (vaultId: string, beneficiaryIndex: number): Promise<string> => {
    // TODO: This method is deprecated - use blockchain service directly
    throw new Error('claimInheritance method is deprecated. Use the blockchain service directly from components.');
  };

  // Contract read functions
  const getVaultSBTCBalance = async (vaultId: string): Promise<number> => {
    // TODO: This method is deprecated - use blockchain service directly
    return 0;
  };

  const getVaultInheritanceReadiness = async (vaultId: string): Promise<boolean> => {
    // TODO: This method is deprecated - use blockchain service directly
    return false;
  };

  const calculateInheritanceAmount = async (vaultId: string, beneficiaryIndex: number): Promise<any> => {
    // TODO: This method is deprecated - use blockchain service directly
    return {
      grossAmount: 0,
      feeAmount: 0,
      netAmount: 0
    };
  };

  useEffect(() => {
    console.log('SBTCVaultContext: Auth state changed', { isSignedIn, userAddress: user?.address });
    
    if (isSignedIn && user?.address) {
      refreshVaults();
    } else {
      // Clear data when user signs out
      setVaults([]);
      setStats({
        totalVaults: 0,
        totalSbtcLocked: 0,
        totalSbtcValue: 0,
        activeVaults: 0,
        nearDeadlineVaults: 0
      });
      setTransactions([]);
      setSelectedVault(null);
    }
  }, [isSignedIn, user?.address]);

  const contextValue = {
    vaults,
    stats,
    transactions,
    loading,
    selectedVault,
    createVault,
    addBeneficiary,
    updateProofOfLife,
    triggerInheritance,
    depositSBTC,
    withdrawSBTC,
    claimInheritance,
    getVaultSBTCBalance,
    getVaultInheritanceReadiness,
    calculateInheritanceAmount,
    setSelectedVault,
    refreshVaults
  };

  console.log('SBTCVaultContext render:', { 
    vaultsLength: vaults.length, 
    loading, 
    isSignedIn, 
    userAddress: user?.address 
  });

  return (
    <SBTCVaultContext.Provider value={contextValue}>
      {children}
    </SBTCVaultContext.Provider>
  );
}

export function useSBTCVaults() {
  const context = useContext(SBTCVaultContext);
  if (context === undefined) {
    throw new Error('useSBTCVaults must be used within a SBTCVaultProvider');
  }
  return context;
}