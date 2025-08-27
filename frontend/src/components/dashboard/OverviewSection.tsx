import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { SBTCVault } from '../../types';

interface OverviewSectionProps {
  vaults: SBTCVault[];
  stats: any;
}

export function OverviewSection({ vaults, stats }: OverviewSectionProps) {
  // Filter vaults by status
  const activeVaults = vaults.filter(v => v.status === 'active');
  const warningVaults = vaults.filter(v => {
    const daysSinceLastActivity = Math.floor((Date.now() / 1000 - v.lastActivity) / 86400);
    const inheritanceDelayDays = Math.floor(v.inheritanceDelay / 144);
    return daysSinceLastActivity > inheritanceDelayDays * 0.8; // 80% threshold
  });
  const inheritanceTriggeredVaults = vaults.filter(v => v.status === 'inherit-triggered');

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalVaults || vaults.length}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Vaults</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-bitcoin-600 dark:text-bitcoin-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalSbtcLocked ? (stats.totalSbtcLocked / 100000000).toFixed(4) : '0.0000'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total sBTC</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats?.totalSbtcValue ? stats.totalSbtcValue.toLocaleString() : '0'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Value</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.nearDeadlineVaults || warningVaults.length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Need Attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/create-vault"
            className="flex items-center p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <PlusIcon className="h-8 w-8 text-bitcoin-600 dark:text-bitcoin-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Create Vault</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set up new sBTC inheritance</p>
            </div>
          </Link>
          
          <div className="flex items-center p-4 border border-gray-200 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700">
            <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Security Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">All vaults secured</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 border border-gray-200 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700">
            <ClockIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Proof of Life</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update activity status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Vaults */}
      {warningVaults.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vaults Needing Attention</h2>
            <span className="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {warningVaults.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {warningVaults.map((vault) => (
              <div key={vault.id} className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{vault.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Action needed soon</p>
                <Link
                  to={`/vault/${vault.id}`}
                  className="text-bitcoin-600 dark:text-bitcoin-400 hover:text-bitcoin-700 dark:hover:text-bitcoin-300 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inheritance Triggered Vaults */}
      {inheritanceTriggeredVaults.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Inheritances</h2>
            <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {inheritanceTriggeredVaults.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {inheritanceTriggeredVaults.map((vault) => (
              <div key={vault.id} className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{vault.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Inheritance in progress</p>
                <Link
                  to={`/vault/${vault.id}`}
                  className="text-bitcoin-600 dark:text-bitcoin-400 hover:text-bitcoin-700 dark:hover:text-bitcoin-300 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Vaults */}
      {activeVaults.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Vaults</h2>
            <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {activeVaults.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeVaults.map((vault) => (
              <div key={vault.id} className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{vault.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Secure and active</p>
                <Link
                  to={`/vault/${vault.id}`}
                  className="text-bitcoin-600 dark:text-bitcoin-400 hover:text-bitcoin-700 dark:hover:text-bitcoin-300 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
