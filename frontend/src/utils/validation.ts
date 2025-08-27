import { VALIDATION_LIMITS, SBTC_CONSTANTS } from './constants';

/**
 * Validation utilities for ChainVault sBTC platform
 */

// Basic validation types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Stacks address validation
export const validateStacksAddress = (address: string): ValidationResult => {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }

  if (typeof address !== 'string') {
    return { isValid: false, error: 'Address must be a string' };
  }

  // Stacks addresses start with SP (mainnet) or ST (testnet) followed by 38 base58 characters
  const stacksAddressRegex = /^S[PT][123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{38}$/;
  
  if (!stacksAddressRegex.test(address)) {
    return { isValid: false, error: 'Invalid Stacks address format' };
  }

  return { isValid: true };
};

// Vault name validation
export const validateVaultName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Vault name is required' };
  }

  if (name.trim().length === 0) {
    return { isValid: false, error: 'Vault name cannot be empty' };
  }

  if (name.length > VALIDATION_LIMITS.VAULT_NAME_MAX_LENGTH) {
    return { isValid: false, error: `Vault name must be ${VALIDATION_LIMITS.VAULT_NAME_MAX_LENGTH} characters or less` };
  }

  // Check for potentially problematic characters
  const invalidChars = /[<>"\\/|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Vault name contains invalid characters' };
  }

  return { isValid: true };
};

// sBTC amount validation
export const validateSBTCAmount = (amount: number): ValidationResult => {
  if (typeof amount !== 'number') {
    return { isValid: false, error: 'Amount must be a number' };
  }

  if (isNaN(amount) || !isFinite(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  if (amount < SBTC_CONSTANTS.MIN_SBTC_AMOUNT) {
    return { isValid: false, error: `Minimum amount is ${SBTC_CONSTANTS.MIN_SBTC_AMOUNT} sBTC` };
  }

  if (amount > SBTC_CONSTANTS.MAX_SBTC_AMOUNT) {
    return { isValid: false, error: `Maximum amount is ${SBTC_CONSTANTS.MAX_SBTC_AMOUNT} sBTC` };
  }

  // Check for excessive decimal precision (more than 8 decimal places)
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 8) {
    return { isValid: false, error: 'Amount cannot have more than 8 decimal places' };
  }

  return { isValid: true };
};

// Inheritance delay validation
export const validateInheritanceDelay = (days: number): ValidationResult => {
  if (typeof days !== 'number') {
    return { isValid: false, error: 'Inheritance delay must be a number' };
  }

  if (!Number.isInteger(days)) {
    return { isValid: false, error: 'Inheritance delay must be a whole number of days' };
  }

  if (days < VALIDATION_LIMITS.INHERITANCE_DELAY_MIN_DAYS) {
    return { isValid: false, error: `Minimum inheritance delay is ${VALIDATION_LIMITS.INHERITANCE_DELAY_MIN_DAYS} day` };
  }

  if (days > VALIDATION_LIMITS.INHERITANCE_DELAY_MAX_DAYS) {
    return { isValid: false, error: `Maximum inheritance delay is ${VALIDATION_LIMITS.INHERITANCE_DELAY_MAX_DAYS} days` };
  }

  return { isValid: true };
};

// Grace period validation
export const validateGracePeriod = (days: number): ValidationResult => {
  if (typeof days !== 'number') {
    return { isValid: false, error: 'Grace period must be a number' };
  }

  if (!Number.isInteger(days)) {
    return { isValid: false, error: 'Grace period must be a whole number of days' };
  }

  if (days < VALIDATION_LIMITS.GRACE_PERIOD_MIN_DAYS) {
    return { isValid: false, error: `Minimum grace period is ${VALIDATION_LIMITS.GRACE_PERIOD_MIN_DAYS} day` };
  }

  if (days > VALIDATION_LIMITS.GRACE_PERIOD_MAX_DAYS) {
    return { isValid: false, error: `Maximum grace period is ${VALIDATION_LIMITS.GRACE_PERIOD_MAX_DAYS} days` };
  }

  return { isValid: true };
};

// Privacy level validation
export const validatePrivacyLevel = (level: number): ValidationResult => {
  if (typeof level !== 'number') {
    return { isValid: false, error: 'Privacy level must be a number' };
  }

  if (!Number.isInteger(level)) {
    return { isValid: false, error: 'Privacy level must be a whole number' };
  }

  if (level < 1 || level > 4) {
    return { isValid: false, error: 'Privacy level must be between 1 and 4' };
  }

  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

// Relationship validation
export const validateRelationship = (relationship: string): ValidationResult => {
  if (!relationship) {
    return { isValid: true }; // Relationship is optional
  }

  if (relationship.length > VALIDATION_LIMITS.RELATIONSHIP_MAX_LENGTH) {
    return { isValid: false, error: `Relationship must be ${VALIDATION_LIMITS.RELATIONSHIP_MAX_LENGTH} characters or less` };
  }

  return { isValid: true };
};

// Beneficiary validation
export const validateBeneficiary = (beneficiary: {
  address: string;
  allocationPercentage: number;
  minimumSbtcAmount: number;
  relationshipToOwner?: string;
  contactInfo?: string;
}): ValidationResult => {
  // Validate address
  const addressValidation = validateStacksAddress(beneficiary.address);
  if (!addressValidation.isValid) {
    return addressValidation;
  }

  // Validate allocation percentage
  if (typeof beneficiary.allocationPercentage !== 'number') {
    return { isValid: false, error: 'Allocation percentage must be a number' };
  }

  if (beneficiary.allocationPercentage < 1 || beneficiary.allocationPercentage > 100) {
    return { isValid: false, error: 'Allocation percentage must be between 1% and 100%' };
  }

  // Validate minimum sBTC amount
  const amountValidation = validateSBTCAmount(beneficiary.minimumSbtcAmount);
  if (!amountValidation.isValid) {
    return { isValid: false, error: `Minimum sBTC amount: ${amountValidation.error}` };
  }

  // Validate optional fields
  if (beneficiary.relationshipToOwner) {
    const relationshipValidation = validateRelationship(beneficiary.relationshipToOwner);
    if (!relationshipValidation.isValid) {
      return relationshipValidation;
    }
  }

  if (beneficiary.contactInfo) {
    const emailValidation = validateEmail(beneficiary.contactInfo);
    if (!emailValidation.isValid) {
      return emailValidation;
    }
  }

  return { isValid: true };
};

// Beneficiaries array validation
export const validateBeneficiaries = (beneficiaries: Array<{
  address: string;
  allocationPercentage: number;
  minimumSbtcAmount: number;
  relationshipToOwner?: string;
  contactInfo?: string;
}>): ValidationResult => {
  if (!Array.isArray(beneficiaries)) {
    return { isValid: false, error: 'Beneficiaries must be an array' };
  }

  if (beneficiaries.length === 0) {
    return { isValid: false, error: 'At least one beneficiary is required' };
  }

  if (beneficiaries.length > VALIDATION_LIMITS.MAX_BENEFICIARIES) {
    return { isValid: false, error: `Maximum ${VALIDATION_LIMITS.MAX_BENEFICIARIES} beneficiaries allowed` };
  }

  // Validate each beneficiary
  for (let i = 0; i < beneficiaries.length; i++) {
    const beneficiaryValidation = validateBeneficiary(beneficiaries[i]);
    if (!beneficiaryValidation.isValid) {
      return { isValid: false, error: `Beneficiary ${i + 1}: ${beneficiaryValidation.error}` };
    }
  }

  // Check for duplicate addresses
  const addresses = beneficiaries.map(b => b.address);
  const uniqueAddresses = new Set(addresses);
  if (addresses.length !== uniqueAddresses.size) {
    return { isValid: false, error: 'Duplicate beneficiary addresses are not allowed' };
  }

  // Validate total allocation
  const totalAllocation = beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0);
  if (Math.abs(totalAllocation - 100) > 0.01) {
    return { isValid: false, error: `Total allocation must equal 100% (currently ${totalAllocation.toFixed(2)}%)` };
  }

  return { isValid: true };
};

// Complete vault data validation
export const validateVaultData = (vaultData: {
  vaultName: string;
  inheritanceDelay: number;
  privacyLevel: number;
  gracePeriod: number;
  autoDistribute: boolean;
  minimumInheritance: number;
  beneficiaries: Array<{
    address: string;
    allocationPercentage: number;
    minimumSbtcAmount: number;
    relationshipToOwner?: string;
    contactInfo?: string;
  }>;
}): ValidationResult => {
  // Validate vault name
  const nameValidation = validateVaultName(vaultData.vaultName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  // Validate inheritance delay
  const delayValidation = validateInheritanceDelay(vaultData.inheritanceDelay);
  if (!delayValidation.isValid) {
    return delayValidation;
  }

  // Validate privacy level
  const privacyValidation = validatePrivacyLevel(vaultData.privacyLevel);
  if (!privacyValidation.isValid) {
    return privacyValidation;
  }

  // Validate grace period
  const graceValidation = validateGracePeriod(vaultData.gracePeriod);
  if (!graceValidation.isValid) {
    return graceValidation;
  }

  // Validate minimum inheritance amount
  const minimumValidation = validateSBTCAmount(vaultData.minimumInheritance);
  if (!minimumValidation.isValid) {
    return { isValid: false, error: `Minimum inheritance: ${minimumValidation.error}` };
  }

  // Validate auto-distribute flag
  if (typeof vaultData.autoDistribute !== 'boolean') {
    return { isValid: false, error: 'Auto-distribute must be a boolean value' };
  }

  // Validate beneficiaries
  const beneficiariesValidation = validateBeneficiaries(vaultData.beneficiaries);
  if (!beneficiariesValidation.isValid) {
    return beneficiariesValidation;
  }

  // Cross-field validations
  // Check that minimum inheritance is reasonable compared to beneficiary minimums
  const totalMinimumBeneficiary = vaultData.beneficiaries.reduce((sum, b) => sum + b.minimumSbtcAmount, 0);
  if (vaultData.minimumInheritance < totalMinimumBeneficiary) {
    return { 
      isValid: false, 
      error: `Minimum inheritance (${vaultData.minimumInheritance} sBTC) must be at least the sum of all beneficiary minimums (${totalMinimumBeneficiary} sBTC)` 
    };
  }

  return { isValid: true };
};

// Transaction validation
export const validateDepositAmount = (amount: number, currentBalance: number): ValidationResult => {
  const amountValidation = validateSBTCAmount(amount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }

  // Additional checks for deposits could go here
  // For example, checking against maximum vault capacity

  return { isValid: true };
};

export const validateWithdrawalAmount = (amount: number, currentBalance: number, isLocked: boolean): ValidationResult => {
  if (isLocked) {
    return { isValid: false, error: 'Cannot withdraw: sBTC is locked for inheritance' };
  }

  const amountValidation = validateSBTCAmount(amount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }

  const balanceInSBTC = currentBalance / SBTC_CONSTANTS.SATOSHIS_PER_BTC;
  if (amount > balanceInSBTC) {
    return { isValid: false, error: `Insufficient balance (available: ${balanceInSBTC.toFixed(8)} sBTC)` };
  }

  return { isValid: true };
};

// Security validations
export const validatePasswordStrength = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!hasLowercase) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!hasNumbers) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!hasSpecialChar) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeVaultName = (name: string): string => {
  return name.trim().replace(/[<>"\\\/|?*\x00-\x1f]/g, '').slice(0, VALIDATION_LIMITS.VAULT_NAME_MAX_LENGTH);
};

// Batch validation helper
export const validateMultiple = (validations: Array<() => ValidationResult>): ValidationResult => {
  for (const validate of validations) {
    const result = validate();
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

// Validation result aggregation
export const aggregateValidationResults = (results: ValidationResult[]): ValidationResult => {
  const errors = results.filter(r => !r.isValid).map(r => r.error).filter(Boolean);
  
  if (errors.length === 0) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: errors.length === 1 ? errors[0] : `Multiple validation errors: ${errors.join('; ')}`
  };
};

// Form validation helpers
export const createFieldValidator = (validator: (value: any) => ValidationResult) => {
  return (value: any): string | undefined => {
    const result = validator(value);
    return result.isValid ? undefined : result.error;
  };
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  STACKS_ADDRESS: /^S[PT][123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{38}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  POSITIVE_NUMBER: /^\d*\.?\d+$/,
  POSITIVE_INTEGER: /^\d+$/,
} as const;

// Validation helpers for UI components
export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  const fieldError = errors[fieldName];
  if (!fieldError) return undefined;
  
  if (typeof fieldError === 'string') return fieldError;
  if (fieldError.message) return fieldError.message;
  
  return 'Invalid value';
};

export const hasFieldError = (errors: any, fieldName: string): boolean => {
  return !!errors[fieldName];
};

// Validation state helpers
export const isFormValid = (errors: any): boolean => {
  return Object.keys(errors).length === 0;
};

export const getErrorCount = (errors: any): number => {
  return Object.keys(errors).length;
};

export const getFirstError = (errors: any): string | undefined => {
  const firstErrorKey = Object.keys(errors)[0];
  if (!firstErrorKey) return undefined;
  
  const error = errors[firstErrorKey];
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  
  return 'Form contains errors';
};