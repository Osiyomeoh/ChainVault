import { SBTC_CONSTANTS, BITCOIN_PRICE_USD } from './constants';

/**
 * Format utilities for ChainVault sBTC platform
 */

// sBTC/Bitcoin formatting
export const formatSBTC = (satoshis: number, decimals: number = 8): string => {
  const sbtc = satoshis / SBTC_CONSTANTS.SATOSHIS_PER_BTC;
  return `${sbtc.toFixed(decimals)} sBTC`;
};

export const formatSatoshis = (satoshis: number): string => {
  return `${satoshis.toLocaleString()} sats`;
};

export const sbtcToSatoshis = (sbtc: number): number => {
  return Math.floor(sbtc * SBTC_CONSTANTS.SATOSHIS_PER_BTC);
};

export const satoshisToSBTC = (satoshis: number): number => {
  return satoshis / SBTC_CONSTANTS.SATOSHIS_PER_BTC;
};

// USD formatting
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const sbtcToUSD = (satoshis: number, bitcoinPrice: number = BITCOIN_PRICE_USD): number => {
  const sbtc = satoshisToSBTC(satoshis);
  return sbtc * bitcoinPrice;
};

// Address formatting
export const formatStacksAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const formatTxId = (txId: string, startChars: number = 8, endChars: number = 6): string => {
  if (txId.length <= startChars + endChars) {
    return txId;
  }
  return `${txId.slice(0, startChars)}...${txId.slice(-endChars)}`;
};

// Time formatting
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) {
    return 'Just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(timestamp);
  }
};

// Duration formatting
export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'Less than a minute';
  }
};

export const formatCountdown = (targetTimestamp: number): string => {
  const now = Date.now() / 1000;
  const diff = targetTimestamp - now;
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Number formatting
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

export const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  } else {
    return value.toString();
  }
};

// Privacy level formatting
export const formatPrivacyLevel = (level: number): string => {
  const levels = {
    1: 'Stealth',
    2: 'Delayed',
    3: 'Gradual',
    4: 'Transparent',
  };
  return levels[level as keyof typeof levels] || 'Unknown';
};

// Status formatting
export const formatVaultStatus = (status: string): string => {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Validation helpers
export const isValidStacksAddress = (address: string): boolean => {
  // Basic Stacks address validation
  return /^S[PT][123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{38}$/.test(address);
};

export const isValidSBTCAmount = (amount: number): boolean => {
  return amount >= SBTC_CONSTANTS.MIN_SBTC_AMOUNT && amount <= SBTC_CONSTANTS.MAX_SBTC_AMOUNT;
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Utility functions for calculations
export const calculateInheritanceDeadline = (lastActivity: number, inheritanceDelay: number): number => {
  // inheritanceDelay is in blocks, convert to seconds (10 minutes per block)
  return lastActivity + (inheritanceDelay * 600);
};

export const calculateDaysUntilInheritance = (lastActivity: number, inheritanceDelay: number): number => {
  const deadline = calculateInheritanceDeadline(lastActivity, inheritanceDelay);
  const now = Date.now() / 1000;
  const secondsRemaining = deadline - now;
  return Math.ceil(secondsRemaining / 86400);
};

export const isNearInheritanceDeadline = (lastActivity: number, inheritanceDelay: number, warningDays: number = 7): boolean => {
  const daysUntil = calculateDaysUntilInheritance(lastActivity, inheritanceDelay);
  return daysUntil <= warningDays && daysUntil > 0;
};

export const isPastInheritanceDeadline = (lastActivity: number, inheritanceDelay: number): boolean => {
  const daysUntil = calculateDaysUntilInheritance(lastActivity, inheritanceDelay);
  return daysUntil <= 0;
};

// Beneficiary allocation helpers
export const validateBeneficiaryAllocations = (beneficiaries: Array<{ allocationPercentage: number }>): boolean => {
  const total = beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0);
  return Math.abs(total - 100) < 0.01; // Allow for small floating point errors
};

export const calculateBeneficiaryAmount = (totalAmount: number, allocationPercentage: number): number => {
  return Math.floor((totalAmount * allocationPercentage) / 100);
};

// Sorting helpers
export const sortVaultsByStatus = (vaults: any[]): any[] => {
  const statusPriority = {
    'inherit-triggered': 1,
    'expired': 2,
    'active': 3,
    'pending': 4,
    'emergency-paused': 5,
  };

  return [...vaults].sort((a, b) => {
    const priorityA = statusPriority[a.status as keyof typeof statusPriority] || 999;
    const priorityB = statusPriority[b.status as keyof typeof statusPriority] || 999;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Secondary sort by last activity (most recent first)
    return b.lastActivity - a.lastActivity;
  });
};

export const sortTransactionsByDate = (transactions: any[]): any[] => {
  return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
};