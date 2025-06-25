import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Vault, ProofOfLife } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProofOfLifeCardProps {
  vault: Vault;
  proofOfLife?: ProofOfLife;
  onUpdate: () => void;
  updating: boolean;
}

export const ProofOfLifeCard: React.FC<ProofOfLifeCardProps> = ({
  vault,
  proofOfLife,
  onUpdate,
  updating,
}) => {
  const daysSinceLastActivity = Math.floor((Date.now() / 1000 - vault.lastActivity) / 86400);
  const inheritanceDelayDays = Math.floor(vault.inheritanceDelay / 144);
  const gracePeriodDays = Math.floor(vault.gracePeriod / 144);
  
  const daysUntilInheritance = inheritanceDelayDays - daysSinceLastActivity;
  const isNearDeadline = daysUntilInheritance <= 7;
  const isPastDeadline = daysUntilInheritance <= 0;

  const getStatusColor = () => {
    if (isPastDeadline) return 'text-red-400 bg-red-500/10';
    if (isNearDeadline) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-green-400 bg-green-500/10';
  };

  const getStatusIcon = () => {
    if (isPastDeadline) return ExclamationTriangleIcon;
    if (isNearDeadline) return ClockIcon;
    return CheckCircleIcon;
  };

  const StatusIcon = getStatusIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold">Proof of Life Status</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${getStatusColor()}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isPastDeadline ? 'Action Required' : isNearDeadline ? 'Update Soon' : 'Active'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold mb-1">
            {daysSinceLastActivity}
          </div>
          <div className="text-sm text-dark-400">Days since last check-in</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${isPastDeadline ? 'text-red-400' : isNearDeadline ? 'text-yellow-400' : 'text-green-400'}`}>
            {Math.max(0, daysUntilInheritance)}
          </div>
          <div className="text-sm text-dark-400">Days until inheritance</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold mb-1">
            {gracePeriodDays}
          </div>
          <div className="text-sm text-dark-400">Grace period (days)</div>
        </div>
      </div>

      {isPastDeadline && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <span className="font-medium text-red-400">Inheritance Period Active</span>
          </div>
          <p className="text-sm text-red-300">
            The inheritance delay has passed. Anyone can trigger inheritance execution.
            Update your proof of life immediately to prevent inheritance activation.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-dark-400">
          <CalendarIcon className="h-4 w-4" />
          <span>
            Last updated: {new Date(vault.lastActivity * 1000).toLocaleDateString()}
          </span>
        </div>
        
        <button
          onClick={onUpdate}
          disabled={updating}
          className="btn-primary flex items-center space-x-2"
        >
          {updating ? (
            <LoadingSpinner size="sm" />
          ) : (
            <ClockIcon className="h-4 w-4" />
          )}
          <span>Update Proof of Life</span>
        </button>
      </div>
    </motion.div>
  );
};