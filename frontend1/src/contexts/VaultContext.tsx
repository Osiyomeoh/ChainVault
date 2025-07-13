import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Vault, ProofOfLife, Beneficiary } from '@/types';
import { vaultService } from '@/services/vaultService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface VaultContextType {
  vaults: Vault[];
  selectedVault: Vault | null;
  proofOfLifeData: Record<string, ProofOfLife>;
  loading: boolean;
  refreshVaults: () => Promise<void>;
  selectVault: (vault: Vault | null) => void;
  updateProofOfLife: (vaultId: string) => Promise<boolean>;
  createVault: (vaultData: any) => Promise<string | null>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isSignedIn } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [proofOfLifeData, setProofOfLifeData] = useState<Record<string, ProofOfLife>>({});
  const [loading, setLoading] = useState(false);

  const refreshVaults = async () => {
    if (!user || !isSignedIn) return;
    
    setLoading(true);
    try {
      const userVaults = await vaultService.getUserVaults(user.stacksAddress);
      setVaults(userVaults);

      // Fetch proof-of-life data for each vault
      const proofData: Record<string, ProofOfLife> = {};
      for (const vault of userVaults) {
        try {
          const proof = await vaultService.getProofOfLife(vault.vaultId);
          if (proof) {
            proofData[vault.vaultId] = proof;
          }
        } catch (error) {
          console.error(`Failed to fetch proof-of-life for vault ${vault.vaultId}:`, error);
        }
      }
      setProofOfLifeData(proofData);
    } catch (error) {
      console.error('Failed to refresh vaults:', error);
      toast.error('Failed to load vaults');
    } finally {
      setLoading(false);
    }
  };

  const selectVault = (vault: Vault | null) => {
    setSelectedVault(vault);
  };

  const updateProofOfLife = async (vaultId: string): Promise<boolean> => {
    try {
      const success = await vaultService.updateProofOfLife(vaultId);
      if (success) {
        await refreshVaults();
        toast.success('Proof of life updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update proof of life:', error);
      toast.error('Failed to update proof of life');
      return false;
    }
  };

  const createVault = async (vaultData: any): Promise<string | null> => {
    try {
      const vaultId = await vaultService.createVault(vaultData);
      if (vaultId) {
        await refreshVaults();
        toast.success('Vault created successfully');
        return vaultId;
      }
      return null;
    } catch (error) {
      console.error('Failed to create vault:', error);
      toast.error('Failed to create vault');
      return null;
    }
  };

  useEffect(() => {
    if (isSignedIn && user) {
      refreshVaults();
    }
  }, [isSignedIn, user]);

  return (
    <VaultContext.Provider value={{
      vaults,
      selectedVault,
      proofOfLifeData,
      loading,
      refreshVaults,
      selectVault,
      updateProofOfLife,
      createVault,
    }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVaults = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVaults must be used within a VaultProvider');
  }
  return context;
};