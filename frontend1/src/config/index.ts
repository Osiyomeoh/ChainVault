import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { NetworkConfig } from '../types';

export const networkConfig: NetworkConfig = {
  stacksNetwork: ((import.meta as any).env?.VITE_STACKS_NETWORK as 'mainnet' | 'testnet') || 'testnet',
  contractAddress: (import.meta as any).env?.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: (import.meta as any).env?.VITE_CONTRACT_NAME || 'chainvault-inheritance',
  apiBaseUrl: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001',
  stacksApiUrl: (import.meta as any).env?.VITE_STACKS_API_URL || 'https://stacks-node-api.testnet.stacks.co',
  btcApiUrl: (import.meta as any).env?.VITE_BTC_API_URL || 'https://mempool.space/testnet/api',
};

export const getStacksNetwork = () => {
  return networkConfig.stacksNetwork === 'mainnet' 
    ? new StacksMainnet() 
    : new StacksTestnet();
};

export const CONTRACT_FUNCTIONS = {
  CREATE_VAULT: 'create-vault',
  UPDATE_PROOF_OF_LIFE: 'update-proof-of-life',
  TRIGGER_INHERITANCE: 'trigger-inheritance',
  ADD_BENEFICIARY: 'add-beneficiary',
  CLAIM_INHERITANCE: 'claim-inheritance',
  GRANT_PROFESSIONAL_ACCESS: 'grant-professional-access',
} as const;

export const PRIVACY_LEVELS = {
  STEALTH: 1,
  DELAYED: 2,
  GRADUAL: 3,
  TRANSPARENT: 4,
} as const;

export const VAULT_STATUS = {
  ACTIVE: 'active',
  INHERITANCE_TRIGGERED: 'inherit-triggered',
  PENDING: 'pending',
  EXPIRED: 'expired',
  EMERGENCY_PAUSED: 'emergency-paused',
} as const;