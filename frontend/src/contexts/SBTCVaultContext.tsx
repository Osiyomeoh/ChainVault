import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SBTCVault, SBTCVaultStats, SBTCTransaction, CreateSBTCVaultData } from '../types/sbtc';
import { useAuth } from './AuthContext';
import { sbtcVaultService } from '../services/sbtcVaultService';
import { toast } from 'react-hot-toast';

interface SBTCVaultContextType {
  vaults: SBTCVault[];
  stats: SBTCVaultStats;
  transactions: SBTCTransaction[];
  loading: boolean;
  selectedVault: SBTCVault | null;
  
  // Vault Management
  createVault: (vaultData: CreateSBTCVaultData) => Promise<string>;
  updateProofOfLife: (vaultId: string) => Promise<void>;
  triggerInheritance: (vaultId: string) => Promise<void>;
  
  // sBTC Operations
  depositSBTC: (vaultId: string, amount: number) => Promise<string>;
  withdrawSBTC: (vaultId: string, amount: number) => Promise<string>;
  claimInheritance: (vaultId: string, beneficiaryIndex: number) => Promise<string>;
  
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
    if (!isSignedIn || !user?.stacksAddress) return;
    
    setLoading(true);
    try {
      console.log('SBTCVaultContext: Refreshing vaults for', user.stacksAddress);
      
      const userVaults = await sbtcVaultService.getUserVaults(user.stacksAddress);
      const vaultStats = await sbtcVaultService.getVaultStats(user.stacksAddress);
      const userTransactions = await sbtcVaultService.getTransactions(user.stacksAddress);
      
      console.log('SBTCVaultContext: Got vaults:', userVaults.length);
      
      setVaults(userVaults);
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
    if (!user?.stacksAddress) throw new Error('User not authenticated');
    
    try {
      console.log('SBTCVaultContext: Creating vault', vaultData);
      const vaultId = await sbtcVaultService.createVault(user.stacksAddress, vaultData);
      toast.success('Vault created successfully');
      await refreshVaults();
      return vaultId;
    } catch (error) {
      console.error('Failed to create vault:', error);
      toast.error('Failed to create vault');
      throw error;
    }
  };

  const updateProofOfLife = async (vaultId: string): Promise<void> => {
    try {
      console.log('SBTCVaultContext: Updating proof of life for', vaultId);
      await sbtcVaultService.updateProofOfLife(vaultId);
      toast.success('Proof of life updated');
      await refreshVaults();
    } catch (error) {
      console.error('Failed to update proof of life:', error);
      toast.error('Failed to update proof of life');
      throw error;
    }
  };

  const triggerInheritance = async (vaultId: string): Promise<void> => {
    try {
      console.log('SBTCVaultContext: Triggering inheritance for', vaultId);
      await sbtcVaultService.triggerInheritance(vaultId);
      toast.success('Inheritance triggered');
      await refreshVaults();
    } catch (error) {
      console.error('Failed to trigger inheritance:', error);
      toast.error('Failed to trigger inheritance');
      throw error;
    }
  };

  const depositSBTC = async (vaultId: string, amount: number): Promise<string> => {
    try {
      console.log('SBTCVaultContext: Depositing sBTC', { vaultId, amount });
      const txId = await sbtcVaultService.depositSBTC(vaultId, amount);
      toast.success('sBTC deposit initiated');
      await refreshVaults();
      return txId;
    } catch (error) {
      console.error('Failed to deposit sBTC:', error);
      toast.error('Failed to deposit sBTC');
      throw error;
    }
  };

  const withdrawSBTC = async (vaultId: string, amount: number): Promise<string> => {
    try {
      console.log('SBTCVaultContext: Withdrawing sBTC', { vaultId, amount });
      const txId = await sbtcVaultService.withdrawSBTC(vaultId, amount);
      toast.success('sBTC withdrawal initiated');
      await refreshVaults();
      return txId;
    } catch (error) {
      console.error('Failed to withdraw sBTC:', error);
      toast.error('Failed to withdraw sBTC');
      throw error;
    }
  };

  const claimInheritance = async (vaultId: string, beneficiaryIndex: number): Promise<string> => {
    try {
      console.log('SBTCVaultContext: Claiming inheritance', { vaultId, beneficiaryIndex });
      const txId = await sbtcVaultService.claimInheritance(vaultId, beneficiaryIndex);
      toast.success('Inheritance claim initiated');
      await refreshVaults();
      return txId;
    } catch (error) {
      console.error('Failed to claim inheritance:', error);
      toast.error('Failed to claim inheritance');
      throw error;
    }
  };

  useEffect(() => {
    console.log('SBTCVaultContext: Auth state changed', { isSignedIn, userAddress: user?.stacksAddress });
    
    if (isSignedIn && user?.stacksAddress) {
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
  }, [isSignedIn, user?.stacksAddress]);

  const contextValue = {
    vaults,
    stats,
    transactions,
    loading,
    selectedVault,
    createVault,
    updateProofOfLife,
    triggerInheritance,
    depositSBTC,
    withdrawSBTC,
    claimInheritance,
    setSelectedVault,
    refreshVaults
  };

  console.log('SBTCVaultContext render:', { 
    vaultsLength: vaults.length, 
    loading, 
    isSignedIn, 
    userAddress: user?.stacksAddress 
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