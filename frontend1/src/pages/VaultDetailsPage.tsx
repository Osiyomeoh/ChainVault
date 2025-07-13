

// src/pages/VaultDetailsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  EyeIcon,
  CogIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useVaults } from '../contexts/VaultContext';
import { Vault } from '../types';
import { ProofOfLifeCard } from '../components/ProofOfLifeCard';
import { BeneficiariesCard } from '../components/BeneficiariesCard';
import { BitcoinBalanceCard } from '../components/BitcoinBalanceCard';
import { VaultActivityCard } from '../components/VaultActivityCard';

export const VaultDetailsPage = () => {
  const { vaultId } = useParams<{ vaultId: string }>();
  const { vaults, proofOfLifeData, updateProofOfLife } = useVaults();
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProof, setUpdatingProof] = useState(false);

  useEffect(() => {
    if (vaultId && vaults.length > 0) {
      const foundVault = vaults.find(v => v.vaultId === vaultId);
      setVault(foundVault || null);
      setLoading(false);
    }
  }, [vaultId, vaults]);

  const handleProofOfLifeUpdate = async () => {
    if (!vaultId) return;
    setUpdatingProof(true);
    await updateProofOfLife(vaultId);
    setUpdatingProof(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin-500"></div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="text-center py-16">
        <ExclamationTriangleIcon className="h-16 w-16 text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Vault Not Found</h2>
        <p className="text-dark-400 mb-6">The vault you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const proofOfLife = proofOfLifeData[vault.vaultId];
  const privacyLevelNames = {
    1: 'Stealth Mode',
    2: 'Delayed Disclosure',
    3: 'Gradual Education',
    4: 'Full Transparency',
  };

  const statusColors = {
    active: 'text-green-400 bg-green-500/10',
    'inherit-triggered': 'text-red-400 bg-red-500/10',
    pending: 'text-yellow-400 bg-yellow-500/10',
    expired: 'text-red-400 bg-red-500/10',
    'emergency-paused': 'text-orange-400 bg-orange-500/10',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{vault.vaultName}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[vault.status]}`}>
                {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
              </span>
              <span className="text-dark-400">
                Privacy: {privacyLevelNames[vault.privacyLevel]}
              </span>
              <span className="text-dark-400">
                Created: {new Date(vault.createdAt * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <EyeIcon className="h-4 w-4" />
            <span>View Details</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <CogIcon className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proof of Life */}
          <ProofOfLifeCard
            vault={vault}
            proofOfLife={proofOfLife}
            onUpdate={handleProofOfLifeUpdate}
            updating={updatingProof}
          />
          
          {/* Bitcoin Balances */}
          <BitcoinBalanceCard vaultId={vault.vaultId} />
          
          {/* Beneficiaries */}
          <BeneficiariesCard vaultId={vault.vaultId} privacyLevel={vault.privacyLevel} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4">Vault Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-400">Inheritance Delay</span>
                <span>{Math.floor(vault.inheritanceDelay / 144)} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Grace Period</span>
                <span>{Math.floor(vault.gracePeriod / 144)} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Last Activity</span>
                <span>{Math.floor((Date.now() / 1000 - vault.lastActivity) / 86400)} days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Total BTC Value</span>
                <span>{(vault.totalBtcValue / 100000000).toFixed(8)} BTC</span>
              </div>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <VaultActivityCard vaultId={vault.vaultId} />
          
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleProofOfLifeUpdate}
                disabled={updatingProof}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {updatingProof ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <ClockIcon className="h-4 w-4" />
                )}
                <span>Update Proof of Life</span>
              </button>
              
              <Link
                to={`/vault/${vault.vaultId}/edit`}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <CogIcon className="h-4 w-4" />
                <span>Edit Vault Settings</span>
              </Link>
              
              <button className="w-full btn-outline flex items-center justify-center space-x-2">
                <EyeIcon className="h-4 w-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
