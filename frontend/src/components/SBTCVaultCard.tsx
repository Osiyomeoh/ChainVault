import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { SBTCVault } from '../types/sbtc';

interface SBTCVaultCardProps {
  vault: SBTCVault;
  onProofOfLifeUpdate: (vaultId: string) => Promise<void>;
  onTriggerInheritance: (vaultId: string) => Promise<void>;
  onViewDetails: (vault: SBTCVault) => void;
  updating?: boolean;
}

const LoadingSpinner = ({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-bitcoin-500 ${sizeClasses[size]} ${className}`} />
  );
};

export function SBTCVaultCard({ 
  vault, 
  onProofOfLifeUpdate, 
  onTriggerInheritance, 
  onViewDetails,
  updating = false 
}: SBTCVaultCardProps) {
  const [updatingProof, setUpdatingProof] = useState(false);
  const [triggeringInheritance, setTriggeringInheritance] = useState(false);

  // Calculate time-based values
  const now = Math.floor(Date.now() / 1000);
  const daysSinceLastActivity = Math.floor((now - vault.lastActivity) / 86400);
  const inheritanceDelayDays = Math.floor(vault.inheritanceDelay / 144); // Blocks to days
  const daysUntilInheritance = inheritanceDelayDays - daysSinceLastActivity;
  const gracePeriodDays = Math.floor(vault.gracePeriod / 144);

  // Status calculations
  const isNearDeadline = daysUntilInheritance <= 7 && daysUntilInheritance > 0;
  const isPastDeadline = daysUntilInheritance <= 0;
  const isInGracePeriod = isPastDeadline && Math.abs(daysUntilInheritance) <= gracePeriodDays;
  const canTriggerInheritance = isPastDeadline && !isInGracePeriod;

  // Format sBTC balance
  const sbtcBalance = vault.sbtcBalance / 100000000; // Convert satoshis to BTC
  const usdValue = sbtcBalance * 45000; // Approximate USD value

  // Get status styling
  const getStatusColor = () => {
    if (vault.status === 'inherit-triggered') return 'border-red-200 bg-red-50';
    if (canTriggerInheritance) return 'border-red-200 bg-red-50';
    if (isNearDeadline) return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const getStatusIcon = () => {
    if (vault.status === 'inherit-triggered') return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    if (canTriggerInheritance) return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    if (isNearDeadline) return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    return <ShieldCheckIcon className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (vault.status === 'inherit-triggered') return 'Inheritance Active';
    if (canTriggerInheritance) return 'Ready for Inheritance';
    if (isInGracePeriod) return 'Grace Period';
    if (isNearDeadline) return 'Action Needed Soon';
    return 'Active & Secure';
  };

  const getPrivacyLevelText = (level: number) => {
    const levels = {
      1: 'Stealth',
      2: 'Delayed',
      3: 'Gradual',
      4: 'Transparent'
    };
    return levels[level as keyof typeof levels] || 'Unknown';
  };

  const handleProofOfLife = async () => {
    if (updatingProof) return;
    
    setUpdatingProof(true);
    try {
      await onProofOfLifeUpdate(vault.id);
    } finally {
      setUpdatingProof(false);
    }
  };

  const handleTriggerInheritance = async () => {
    if (triggeringInheritance) return;
    
    setTriggeringInheritance(true);
    try {
      await onTriggerInheritance(vault.id);
    } finally {
      setTriggeringInheritance(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-lg border-2 p-4 sm:p-6 transition-all duration-200 hover:shadow-lg ${getStatusColor()}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{vault.vaultName}</h3>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {vault.sbtcLocked ? (
            <LockClosedIcon className="h-5 w-5 text-red-500" title="sBTC Locked" />
          ) : (
            <LockOpenIcon className="h-5 w-5 text-green-500" title="sBTC Unlocked" />
          )}
          
          {vault.privacyLevel === 1 ? (
            <EyeSlashIcon className="h-5 w-5 text-purple-500" title="Stealth Mode" />
          ) : (
            <EyeIcon className="h-5 w-5 text-blue-500" title={`Privacy: ${getPrivacyLevelText(vault.privacyLevel)}`} />
          )}
        </div>
      </div>

      {/* sBTC Balance */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
              {sbtcBalance.toFixed(8)} sBTC
            </div>
            <div className="text-sm text-gray-600">
              ${usdValue.toLocaleString()} USD (estimated)
            </div>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <div className="text-sm text-gray-600">
              Min. Inheritance: {(vault.minimumInheritance / 100000000).toFixed(8)} sBTC
            </div>
            <div className="text-sm text-gray-600">
              Auto-distribute: {vault.autoDistribute ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Inheritance Timeline */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Inheritance Timeline</span>
          <span>{daysSinceLastActivity} days since last activity</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isPastDeadline ? 'bg-red-500' : isNearDeadline ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, (daysSinceLastActivity / inheritanceDelayDays) * 100))}%`
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Created</span>
          {isPastDeadline ? (
            <span className="text-red-600 font-medium">
              {isInGracePeriod ? `Grace period: ${gracePeriodDays - Math.abs(daysUntilInheritance)} days left` : 'Ready for inheritance'}
            </span>
          ) : (
            <span>{daysUntilInheritance} days until inheritance</span>
          )}
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          <UserGroupIcon className="h-4 w-4" />
          <span>{vault.beneficiaries.length} Beneficiaries</span>
          <span>•</span>
          <span>Privacy: {getPrivacyLevelText(vault.privacyLevel)}</span>
        </div>
        
        {vault.privacyLevel > 2 && (
          <div className="space-y-1">
            {vault.beneficiaries.slice(0, 2).map((beneficiary, index) => (
              <div key={beneficiary.id} className="flex justify-between text-xs">
                <span className="text-gray-600">
                  {beneficiary.relationshipToOwner || `Beneficiary ${index + 1}`}
                </span>
                <span className="font-medium">{beneficiary.allocationPercentage}%</span>
              </div>
            ))}
            {vault.beneficiaries.length > 2 && (
              <div className="text-xs text-gray-500">
                +{vault.beneficiaries.length - 2} more beneficiaries
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        {!isPastDeadline && (
          <button
            onClick={handleProofOfLife}
            disabled={updatingProof}
            className="tour-proof-of-life flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {updatingProof ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <ClockIcon className="h-4 w-4" />
            )}
            <span className="text-sm sm:text-base">Update Proof of Life</span>
          </button>
        )}
        
        {canTriggerInheritance && (
          <button
            onClick={handleTriggerInheritance}
            disabled={triggeringInheritance}
            className="tour-inheritance flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {triggeringInheritance ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4" />
            )}
            <span className="text-sm sm:text-base">Trigger Inheritance</span>
          </button>
        )}
        
        <button
          onClick={() => onViewDetails(vault)}
          className="px-4 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
        >
          View Details
        </button>
      </div>

      {/* Warning Messages */}
      {isNearDeadline && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Action Needed</p>
              <p className="text-sm text-yellow-700">
                Update your proof of life within {daysUntilInheritance} days to prevent inheritance trigger.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPastDeadline && !canTriggerInheritance && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">Grace Period Active</p>
              <p className="text-sm text-orange-700">
                You have {gracePeriodDays - Math.abs(daysUntilInheritance)} days left to update proof of life.
              </p>
            </div>
          </div>
        </div>
      )}

      {vault.status === 'inherit-triggered' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Inheritance in Progress</p>
              <p className="text-sm text-red-700">
                sBTC distribution to beneficiaries is {vault.autoDistribute ? 'automatic' : 'awaiting claims'}.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}