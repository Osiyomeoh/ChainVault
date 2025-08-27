// Contract addresses and configuration
export const CONTRACT_CONFIG = {
    TESTNET: {
      SBTC_INHERITANCE_CONTRACT: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-inheritance-vault',
      SBTC_TOKEN_CONTRACT: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token',
    },
    MAINNET: {
      SBTC_INHERITANCE_CONTRACT: 'SP1K1A1PMGW2BU1WMA7SEQSFSW9WXHK4KK1H1FR5M.sbtc-inheritance-vault',
      SBTC_TOKEN_CONTRACT: 'SP1K1A1PMGW2BU1WMA7SEQSFSW9WXHK4KK1H1FR5M.sbtc-token',
    }
  };
  
  // Privacy levels
  export const PRIVACY_LEVELS = {
    STEALTH: 1,
    DELAYED: 2,
    GRADUAL: 3,
    TRANSPARENT: 4,
  } as const;
  
  export const PRIVACY_LEVEL_LABELS = {
    [PRIVACY_LEVELS.STEALTH]: 'Stealth',
    [PRIVACY_LEVELS.DELAYED]: 'Delayed',
    [PRIVACY_LEVELS.GRADUAL]: 'Gradual',
    [PRIVACY_LEVELS.TRANSPARENT]: 'Transparent',
  } as const;
  
  export const PRIVACY_LEVEL_DESCRIPTIONS = {
    [PRIVACY_LEVELS.STEALTH]: 'Complete secrecy until inheritance',
    [PRIVACY_LEVELS.DELAYED]: '30-day notice before reveal',
    [PRIVACY_LEVELS.GRADUAL]: 'Progressive education over time',
    [PRIVACY_LEVELS.TRANSPARENT]: 'Immediate awareness',
  } as const;
  
  // Vault status options
  export const VAULT_STATUS = {
    ACTIVE: 'active',
    INHERIT_TRIGGERED: 'inherit-triggered',
    PENDING: 'pending',
    EXPIRED: 'expired',
    EMERGENCY_PAUSED: 'emergency-paused',
  } as const;
  
  // Time constants (in seconds)
  export const TIME_CONSTANTS = {
    MINUTE: 60,
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 30,
    YEAR: 60 * 60 * 24 * 365,
  } as const;
  
  // Stacks block time (approximately 10 minutes)
  export const STACKS_BLOCK_TIME = 600; // seconds
  
  // Convert blocks to time periods
  export const BLOCKS_TO_TIME = {
    BLOCKS_PER_HOUR: 6,
    BLOCKS_PER_DAY: 144,
    BLOCKS_PER_WEEK: 144 * 7,
    BLOCKS_PER_MONTH: 144 * 30,
    BLOCKS_PER_YEAR: 144 * 365,
  } as const;
  
  // sBTC constants
  export const SBTC_CONSTANTS = {
    SATOSHIS_PER_BTC: 100_000_000,
    MIN_SBTC_AMOUNT: 0.001, // Minimum sBTC amount (0.001 BTC)
    MAX_SBTC_AMOUNT: 21_000_000, // Maximum possible BTC supply
    DUST_LIMIT: 546, // Satoshis
  } as const;
  
  // Transaction fees (in microSTX)
  export const TRANSACTION_FEES = {
    CREATE_VAULT: 10_000,
    DEPOSIT_SBTC: 5_000,
    WITHDRAW_SBTC: 5_000,
    UPDATE_PROOF_OF_LIFE: 3_000,
    TRIGGER_INHERITANCE: 8_000,
    CLAIM_INHERITANCE: 8_000,
  } as const;
  
  // API endpoints
  export const API_ENDPOINTS = {
    TESTNET: 'https://stacks-node-api.testnet.stacks.co',
    MAINNET: 'https://stacks-node-api.mainnet.stacks.co',
    MEMPOOL_SPACE: 'https://mempool.space/api',
    MEMPOOL_SPACE_TESTNET: 'https://mempool.space/testnet/api',
  } as const;
  
  // Validation limits
  export const VALIDATION_LIMITS = {
    VAULT_NAME_MAX_LENGTH: 50,
    INHERITANCE_DELAY_MIN_DAYS: 1,
    INHERITANCE_DELAY_MAX_DAYS: 365,
    GRACE_PERIOD_MIN_DAYS: 1,
    GRACE_PERIOD_MAX_DAYS: 30,
    MAX_BENEFICIARIES: 10,
    RELATIONSHIP_MAX_LENGTH: 30,
    CONTACT_INFO_MAX_LENGTH: 100,
  } as const;
  
  // UI constants
  export const UI_CONSTANTS = {
    TOAST_DURATION: 4000,
    LOADING_SPINNER_DELAY: 200,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
  } as const;
  
  // Colors for status indicators
  export const STATUS_COLORS = {
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red',
    INFO: 'blue',
    NEUTRAL: 'gray',
  } as const;
  
  // Bitcoin price estimation (this would typically come from an API)
  export const BITCOIN_PRICE_USD = 45000; // Fallback price
  
  // Error messages
  export const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: 'Please connect your Stacks wallet',
    INSUFFICIENT_BALANCE: 'Insufficient sBTC balance',
    INVALID_ADDRESS: 'Invalid Stacks address format',
    INVALID_AMOUNT: 'Invalid amount specified',
    VAULT_NOT_FOUND: 'Vault not found',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    NETWORK_ERROR: 'Network error. Please try again.',
    CONTRACT_ERROR: 'Smart contract error occurred',
    VALIDATION_ERROR: 'Validation failed',
    SBTC_LOCKED: 'sBTC is locked for inheritance',
    ALLOCATION_ERROR: 'Beneficiary allocations must equal 100%',
  } as const;
  
  // Success messages
  export const SUCCESS_MESSAGES = {
    VAULT_CREATED: 'Vault created successfully',
    PROOF_OF_LIFE_UPDATED: 'Proof of life updated',
    SBTC_DEPOSITED: 'sBTC deposited successfully',
    SBTC_WITHDRAWN: 'sBTC withdrawn successfully',
    INHERITANCE_TRIGGERED: 'Inheritance triggered successfully',
    INHERITANCE_CLAIMED: 'Inheritance claimed successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
  } as const;
  
  // Local storage keys
  export const STORAGE_KEYS = {
    VAULT_CACHE: 'chainvault_vaults',
    USER_PREFERENCES: 'chainvault_preferences',
    TRANSACTION_HISTORY: 'chainvault_transactions',
    LAST_SYNC: 'chainvault_last_sync',
  } as const;
  
  // App metadata
  export const APP_CONFIG = {
    NAME: 'ChainVault',
    DESCRIPTION: 'Privacy-first Bitcoin inheritance platform',
    VERSION: '1.0.0',
    SUPPORT_EMAIL: 'support@chainvault.io',
    DOCUMENTATION_URL: 'https://docs.chainvault.io',
    GITHUB_URL: 'https://github.com/chainvault/chainvault',
    TWITTER_URL: 'https://twitter.com/chainvault',
  } as const;
  
  // Feature flags
  export const FEATURE_FLAGS = {
    ENABLE_MAINNET: false,
    ENABLE_MULTI_SIG: false,
    ENABLE_CROSS_CHAIN: false,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: true,
  } as const;