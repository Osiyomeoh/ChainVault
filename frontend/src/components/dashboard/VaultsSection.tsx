import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { SBTCVault } from '../../types';

interface VaultsSectionProps {
  vaults: SBTCVault[];
}

export function VaultsSection({ vaults }: VaultsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Vaults</h2>
        <Link
          to="/create-vault"
          className="inline-flex items-center px-4 py-2 bg-bitcoin-600 hover:bg-bitcoin-700 text-white rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Vault
        </Link>
      </div>

      {/* Vaults Grid */}
      {vaults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <div key={vault.id} className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{vault.name}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  vault.status === 'active' ? 'bg-green-500' : 
                  vault.status === 'inherit-triggered' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    vault.status === 'active' ? 'text-green-600 dark:text-green-400' : 
                    vault.status === 'inherit-triggered' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {vault.status === 'active' ? 'Active' : 
                     vault.status === 'inherit-triggered' ? 'Inheritance Active' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">sBTC Balance:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(vault.sbtcBalance / 100000000).toFixed(8)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Privacy Level:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {vault.privacyLevel === 1 ? 'Public' :
                     vault.privacyLevel === 2 ? 'Semi-Private' :
                     vault.privacyLevel === 3 ? 'Private' : 'Highly Private'}
                  </span>
                </div>
              </div>
              
              <Link
                to={`/vault/${vault.id}`}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-bitcoin-600 text-bitcoin-600 dark:text-bitcoin-400 hover:bg-bitcoin-50 dark:hover:bg-bitcoin-900/20 rounded-lg font-medium transition-colors"
              >
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Manage Vault
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Vaults Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first inheritance vault to secure your Bitcoin with programmable sBTC
          </p>
          <Link
            to="/create-vault"
            className="inline-flex items-center px-6 py-3 bg-bitcoin-600 hover:bg-bitcoin-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Vault
          </Link>
        </div>
      )}
    </div>
  );
}
