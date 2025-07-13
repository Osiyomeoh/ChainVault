import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useVaults } from '../contexts/VaultContext';
import { useAuth } from '../contexts/AuthContext';
import { VaultCard } from '../components/VaultCard';
import { StatsOverview } from '../components/StatsOverview';
import { RecentActivity } from '../components/RecentActivity';

export const DashboardPage = () => {
  const { vaults, loading, updateProofOfLife } = useVaults();
  const { user } = useAuth();
  const [updatingVault, setUpdatingVault] = useState<string | null>(null);

  const handleProofOfLifeUpdate = async (vaultId: string) => {
    setUpdatingVault(vaultId);
    await updateProofOfLife(vaultId);
    setUpdatingVault(null);
  };

  const activeVaults = vaults.filter(v => v.status === 'active');
  const warningVaults = vaults.filter(() => {
    // Add logic to determine if vault needs attention
    return false; // Placeholder
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-dark-300 mt-1">
            Welcome back, {user?.stacksAddress.slice(0, 8)}...
          </p>
        </div>
        <Link to="/create-vault" className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Create Vault</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <StatsOverview vaults={vaults} />

      {/* Quick Actions */}
      {vaults.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                // Update all vaults proof of life
                activeVaults.forEach(vault => handleProofOfLifeUpdate(vault.vaultId));
              }}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
              disabled={updatingVault !== null}
            >
              <ClockIcon className="h-5 w-5" />
              <span>Update All Proof of Life</span>
            </button>
            
            <Link
              to="/analytics"
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <EyeIcon className="h-5 w-5" />
              <span>View Analytics</span>
            </Link>
            
            <Link
              to="/settings"
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Security Settings</span>
            </Link>
          </div>
        </div>
      )}

      {/* Vaults Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Vaults ({vaults.length})</h2>
          {vaults.length > 0 && (
            <div className="flex space-x-2 text-sm">
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active ({activeVaults.length})</span>
              </span>
              {warningVaults.length > 0 && (
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Needs Attention ({warningVaults.length})</span>
                </span>
              )}
            </div>
          )}
        </div>

        {vaults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShieldCheckIcon className="h-16 w-16 text-dark-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Vaults Created</h3>
            <p className="text-dark-400 mb-6 max-w-md mx-auto">
              Create your first inheritance vault to secure your Bitcoin legacy with complete privacy.
            </p>
            <Link to="/create-vault" className="btn-primary">
              Create Your First Vault
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault, index) => (
              <motion.div
                key={vault.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <VaultCard
                  vault={vault}
                  onProofOfLifeUpdate={() => handleProofOfLifeUpdate(vault.vaultId)}
                  updating={updatingVault === vault.vaultId}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {vaults.length > 0 && <RecentActivity />}
    </div>
  );
};