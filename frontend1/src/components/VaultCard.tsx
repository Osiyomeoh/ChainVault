import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Vault } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface VaultCardProps {
  vault: Vault;
  onProofOfLifeUpdate: () => void;
  updating?: boolean;
}

export const VaultCard: React.FC<VaultCardProps> = ({ 
  vault, 
  onProofOfLifeUpdate, 
  updating = false 
}) => {
  const privacyLevelNames = {
    1: 'Stealth',
    2: 'Delayed',
    3: 'Gradual',
    4: 'Transparent',
  };

  const statusColors = {
    active: 'status-active',
    'inherit-triggered': 'status-danger',
    pending: 'status-warning',
    expired: 'status-danger',
    'emergency-paused': 'status-warning',
  };

  const privacyColors = {
    1: 'privacy-level-1',
    2: 'privacy-level-2',
    3: 'privacy-level-3',
    4: 'privacy-level-4',
  };

  const daysSinceLastActivity = Math.floor((Date.now() / 1000 - vault.lastActivity) / 86400);
  const inheritanceDelayDays = Math.floor(vault.inheritanceDelay / 144);
  
  const isNearDeadline = daysSinceLastActivity > inheritanceDelayDays * 0.8;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-hover"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{vault.vaultName}</h3>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[vault.status]}`}>
              {vault.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${privacyColors[vault.privacyLevel]}`}>
              {privacyLevelNames[vault.privacyLevel]}
            </span>
          </div>
        </div>
        <Link
          to={`/vault/${vault.vaultId}`}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-dark-400">Last Activity</span>
          <span className={daysSinceLastActivity === 0 ? 'text-green-400' : isNearDeadline ? 'text-yellow-400' : ''}>
            {daysSinceLastActivity === 0 ? 'Today' : `${daysSinceLastActivity} days ago`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-dark-400">Inheritance Delay</span>
          <span>{inheritanceDelayDays} days</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-dark-400">BTC Value</span>
          <span>{(vault.totalBtcValue / 100000000).toFixed(4)} BTC</span>
        </div>
      </div>

      {isNearDeadline && vault.status === 'active' && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
          <span className="text-xs text-yellow-400">Proof of life needed soon</span>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={onProofOfLifeUpdate}
          disabled={updating}
          className="flex-1 btn-secondary flex items-center justify-center space-x-2 text-sm py-2"
        >
          {updating ? (
            <LoadingSpinner size="sm" />
          ) : (
            <ClockIcon className="h-4 w-4" />
          )}
          <span>Update Proof</span>
        </button>
        
        <Link
          to={`/vault/${vault.vaultId}`}
          className="flex-1 btn-outline flex items-center justify-center space-x-2 text-sm py-2"
        >
          <ShieldCheckIcon className="h-4 w-4" />
          <span>Details</span>
        </Link>
      </div>
    </motion.div>
  );
};