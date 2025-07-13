export interface User {
    id: string;
    stacksAddress: string;
    email?: string;
    createdAt: string;
    isVerified: boolean;
  }
  
  export interface Vault {
    id: string;
    vaultId: string;
    owner: string;
    vaultName: string;
    createdAt: number;
    lastActivity: number;
    inheritanceDelay: number;
    status: VaultStatus;
    privacyLevel: PrivacyLevel;
    bitcoinAddressesHash: string;
    beneficiariesHash: string;
    legalDocumentHash?: string;
    gracePeriod: number;
    emergencyContacts: string[];
    totalBtcValue: number;
  }
  
  export interface Beneficiary {
    vaultId: string;
    beneficiaryIndex: number;
    beneficiaryAddress: string;
    allocationPercentage: number;
    allocationConditions: string;
    notificationPreference: number;
    encryptedMetadata: string;
  }
  
  export interface ProofOfLife {
    vaultId: string;
    lastCheckin: number;
    nextDeadline: number;
    reminderCount: number;
    gracePeriodEnd: number;
    status: string;
  }
  
  export interface InheritanceExecution {
    vaultId: string;
    triggeredAt: number;
    triggeredBy: string;
    executionStatus: string;
    beneficiaryClaims: BeneficiaryClaim[];
    totalFees: number;
    completionPercentage: number;
  }
  
  export interface BeneficiaryClaim {
    beneficiary: string;
    amount: number;
    claimed: boolean;
    claimBlock: number;
  }
  
  export type VaultStatus = 'active' | 'inherit-triggered' | 'pending' | 'expired' | 'emergency-paused';
  
  export type PrivacyLevel = 1 | 2 | 3 | 4; // 1=Stealth, 2=Delayed, 3=Gradual, 4=Transparent
  
  export interface CreateVaultRequest {
    vaultName: string;
    inheritanceDelay: number;
    privacyLevel: PrivacyLevel;
    bitcoinAddresses: string[];
    beneficiaries: CreateBeneficiaryRequest[];
    gracePeriod: number;
    legalDocuments?: File[];
  }
  
  export interface CreateBeneficiaryRequest {
    name: string;
    email: string;
    allocationPercentage: number;
    conditions?: string;
    relationship: string;
  }
  
  export interface BitcoinBalance {
    address: string;
    balance: number;
    unconfirmedBalance: number;
    totalReceived: number;
    totalSent: number;
    txCount: number;
  }
  
  export interface NetworkConfig {
    stacksNetwork: 'mainnet' | 'testnet';
    contractAddress: string;
    contractName: string;
    apiBaseUrl: string;
    stacksApiUrl: string;
    btcApiUrl: string;
  }
  