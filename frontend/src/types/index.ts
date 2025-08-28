export interface User {
  id: string;
  address: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Vault {
  id: string;
  name: string;
  owner: string;
  status: VaultStatus;
  privacyLevel: PrivacyLevel;
  inheritanceDelay: number;
  gracePeriod: number;
  createdAt: Date;
  lastActivity: Date;
  totalFunds: number;
  beneficiaries: Beneficiary[];
  proofOfLife: ProofOfLife;
}

export interface SBTCVault extends Vault {
  sbtcBalance: number;
  sbtcLocked: boolean;
  minimumInheritance: number;
  autoDistribute: boolean;
}

export interface Beneficiary {
  id: string;
  address: string;
  allocationPercentage: number;
  conditions?: string;
  notificationPreference: NotificationPreference;
  encryptedMetadata?: string;
  minimumSbtcAmount?: number;
  sbtcClaimed?: boolean;
  claimDeadline?: number;
}

export interface ProofOfLife {
  lastCheckin: Date;
  nextDeadline: Date;
  reminderCount: number;
  gracePeriodEnd: Date;
  status: ProofOfLifeStatus;
}

export interface InheritanceExecution {
  vaultId: string;
  triggeredAt: Date;
  triggeredBy: string;
  executionStatus: ExecutionStatus;
  totalSbtcDistributed: number;
  beneficiariesPaid: number;
  distributionComplete: boolean;
  totalFees: number;
  completionPercentage: number;
}

export interface SBTCTransaction {
  id: string;
  vaultId: string;
  type: TransactionType;
  amount: number;
  from: string;
  to: string;
  status: TransactionStatus;
  timestamp: Date;
  blockHeight: number;
  txHash: string;
}

// New types for our contract integration
export interface CreateSBTCVaultData {
  vaultId: string;
  name: string;
  inheritanceDelay: number;
  privacyLevel: PrivacyLevel;
  gracePeriod: number;
  initialSbtcAmount?: number;
  autoDistribute: boolean;
  minimumInheritance: number;
  beneficiaries: CreateBeneficiaryData[];
}

export interface CreateBeneficiaryData {
  address: string;
  allocationPercentage: number;
  minimumSbtcAmount: number;
}

export interface SBTCVaultStats {
  totalVaults: number;
  totalSbtcLocked: number;
  totalSbtcValue: number;
  activeVaults: number;
  nearDeadlineVaults: number;
}

export interface InheritanceCalculation {
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
}

export enum VaultStatus {
  ACTIVE = 'active',
  INHERITANCE_TRIGGERED = 'inherit-triggered',
  PENDING = 'pending',
  EXPIRED = 'expired',
  EMERGENCY_PAUSED = 'emergency-paused',
  PAYOUT_COMPLETED = 'payout-completed'
}

export enum PrivacyLevel {
  PUBLIC = 1,
  SEMI_PRIVATE = 2,
  PRIVATE = 3,
  HIGHLY_PRIVATE = 4
}

export enum ProofOfLifeStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  GRACE_PERIOD = 'grace-period'
}

export enum ExecutionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  INHERITANCE_PAYOUT = 'inheritance-payout',
  FEE_COLLECTION = 'fee-collection'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

export enum NotificationPreference {
  EMAIL = 1,
  SMS = 2,
  PUSH = 3,
  NONE = 4
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateVaultRequest {
  name: string;
  inheritanceDelay: number;
  privacyLevel: PrivacyLevel;
  gracePeriod: number;
  initialSbtcAmount?: number;
  lockSbtc?: boolean;
  autoDistribute?: boolean;
}

export interface AddBeneficiaryRequest {
  vaultId: string;
  address: string;
  allocationPercentage: number;
  conditions?: string;
  minimumSbtcAmount?: number;
}

export interface UpdateProofOfLifeRequest {
  vaultId: string;
}

export interface TriggerInheritanceRequest {
  vaultId: string;
}

export interface ClaimInheritanceRequest {
  vaultId: string;
  beneficiaryIndex: number;
}
