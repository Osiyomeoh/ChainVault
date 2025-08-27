import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vault, CreateVaultRequest, AddBeneficiaryRequest, UpdateProofOfLifeRequest } from '../types';

interface VaultContextType {
  vaults: Vault[];
  isLoading: boolean;
  error: string | null;
  createVault: (request: CreateVaultRequest) => Promise<Vault>;
  addBeneficiary: (request: AddBeneficiaryRequest) => Promise<void>;
  updateProofOfLife: (request: UpdateProofOfLifeRequest) => Promise<void>;
  getVault: (id: string) => Vault | undefined;
  refreshVaults: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const useVault = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};

interface VaultProviderProps {
  children: ReactNode;
}

export const VaultProvider: React.FC<VaultProviderProps> = ({ children }) => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load vaults from localStorage on mount
    const loadVaults = () => {
      try {
        const storedVaults = localStorage.getItem('chainvault_vaults');
        if (storedVaults) {
          const parsedVaults = JSON.parse(storedVaults);
          setVaults(parsedVaults);
        }
      } catch (error) {
        console.error('Error loading vaults:', error);
      }
    };

    loadVaults();
  }, []);

  const saveVaults = (newVaults: Vault[]) => {
    localStorage.setItem('chainvault_vaults', JSON.stringify(newVaults));
  };

  const createVault = async (request: CreateVaultRequest): Promise<Vault> => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a mock vault for now - in production this would call an API
      const newVault: Vault = {
        id: `vault_${Date.now()}`,
        name: request.name,
        owner: 'mock_owner', // This would come from auth context
        status: 'active' as any,
        privacyLevel: request.privacyLevel,
        inheritanceDelay: request.inheritanceDelay,
        gracePeriod: request.gracePeriod,
        createdAt: new Date(),
        lastActivity: new Date(),
        totalFunds: 0,
        beneficiaries: [],
        proofOfLife: {
          lastCheckin: new Date(),
          nextDeadline: new Date(Date.now() + request.inheritanceDelay * 24 * 60 * 60 * 1000),
          reminderCount: 0,
          gracePeriodEnd: new Date(Date.now() + (request.inheritanceDelay + request.gracePeriod) * 24 * 60 * 60 * 1000),
          status: 'active' as any,
        },
      };

      const updatedVaults = [...vaults, newVault];
      setVaults(updatedVaults);
      saveVaults(updatedVaults);

      return newVault;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create vault';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addBeneficiary = async (request: AddBeneficiaryRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const vaultIndex = vaults.findIndex(v => v.id === request.vaultId);
      if (vaultIndex === -1) {
        throw new Error('Vault not found');
      }

      const vault = vaults[vaultIndex];
      const newBeneficiary = {
        id: `beneficiary_${Date.now()}`,
        address: request.address,
        allocationPercentage: request.allocationPercentage,
        conditions: request.conditions,
        notificationPreference: 1, // Default to email
      };

      const updatedVault = {
        ...vault,
        beneficiaries: [...vault.beneficiaries, newBeneficiary],
      };

      const updatedVaults = [...vaults];
      updatedVaults[vaultIndex] = updatedVault;
      setVaults(updatedVaults);
      saveVaults(updatedVaults);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add beneficiary';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProofOfLife = async (request: UpdateProofOfLifeRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const vaultIndex = vaults.findIndex(v => v.id === request.vaultId);
      if (vaultIndex === -1) {
        throw new Error('Vault not found');
      }

      const vault = vaults[vaultIndex];
      const updatedProofOfLife = {
        ...vault.proofOfLife,
        lastCheckin: new Date(),
        nextDeadline: new Date(Date.now() + vault.inheritanceDelay * 24 * 60 * 60 * 1000),
        reminderCount: 0,
      };

      const updatedVault = {
        ...vault,
        lastActivity: new Date(),
        proofOfLife: updatedProofOfLife,
      };

      const updatedVaults = [...vaults];
      updatedVaults[vaultIndex] = updatedVault;
      setVaults(updatedVaults);
      saveVaults(updatedVaults);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update proof of life';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getVault = (id: string): Vault | undefined => {
    return vaults.find(v => v.id === id);
  };

  const refreshVaults = async (): Promise<void> => {
    // In production, this would fetch from an API
    // For now, just reload from localStorage
    try {
      const storedVaults = localStorage.getItem('chainvault_vaults');
      if (storedVaults) {
        const parsedVaults = JSON.parse(storedVaults);
        setVaults(parsedVaults);
      }
    } catch (error) {
      console.error('Error refreshing vaults:', error);
    }
  };

  const value: VaultContextType = {
    vaults,
    isLoading,
    error,
    createVault,
    addBeneficiary,
    updateProofOfLife,
    getVault,
    refreshVaults,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
};
