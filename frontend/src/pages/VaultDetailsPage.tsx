import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeftIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useSBTCVaults } from '../contexts/SBTCVaultContext';
import { SBTCDepositModal } from '../components/SBTCDepositModal';
import { useDarkMode } from '../contexts/DarkModeContext';
import { SBTCTransaction, SBTCVault } from '../types';

export function VaultDetailsPage() {
  const { vaultId } = useParams<{ vaultId: string }>();
  const navigate = useNavigate();
  const { vaults, updateProofOfLife, triggerInheritance, depositSBTC, withdrawSBTC } = useSBTCVaults();
  const { darkMode } = useDarkMode();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [updatingProof, setUpdatingProof] = useState(false);
  const [triggeringInheritance, setTriggeringInheritance] = useState(false);

  console.log('🔍 DEBUG: VaultDetailsPage - vaultId from params:', vaultId);
  console.log('🔍 DEBUG: VaultDetailsPage - all vaults:', vaults);
  console.log('🔍 DEBUG: VaultDetailsPage - vaults with IDs:', vaults.map(v => ({ id: v.id, vaultId: (v as any).vaultId, name: v.name })));

  // Try to find vault by id first, then by vaultId as fallback
  const vault = vaults.find(v => v.id === vaultId) || vaults.find(v => (v as any).vaultId === vaultId);
  console.log('🔍 DEBUG: VaultDetailsPage - found vault:', vault);

  if (!vault) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vault Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The vault you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/sbtc-dashboard')}
            className="bg-bitcoin-600 hover:bg-bitcoin-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate time-based values
  const now = Math.floor(Date.now() / 1000);
  const daysSinceLastActivity = Math.floor((now - vault.lastActivity.getTime()) / 86400);
  const inheritanceDelayDays = Math.floor(vault.inheritanceDelay / 144);
  const daysUntilInheritance = inheritanceDelayDays - daysSinceLastActivity;
  const gracePeriodDays = Math.floor(vault.gracePeriod / 144);

  const isNearDeadline = daysUntilInheritance <= 7 && daysUntilInheritance > 0;
  const isPastDeadline = daysUntilInheritance <= 0;
  const isInGracePeriod = isPastDeadline && Math.abs(daysUntilInheritance) <= gracePeriodDays;
  const canTriggerInheritance = isPastDeadline && !isInGracePeriod;

  const sbtcBalance = vault.sbtcBalance / 100000000;
  const usdValue = sbtcBalance * 45000;

  const getStatusColor = () => {
    if (vault.status === 'inherit-triggered') return 'red';
    if (canTriggerInheritance) return 'red';
    if (isNearDeadline) return 'yellow';
    return 'green';
  };

  const getStatusText = () => {
    if (vault.status === 'inherit-triggered') return 'Inheritance Active';
    if (canTriggerInheritance) return 'Ready for Inheritance';
    if (isInGracePeriod) return 'Grace Period';
    if (isNearDeadline) return 'Action Needed Soon';
    return 'Active & Secure';
  };

  const handleProofOfLife = async () => {
    setUpdatingProof(true);
    try {
      await updateProofOfLife(vault.id);
    } finally {
      setUpdatingProof(false);
    }
  };

  const handleTriggerInheritance = async () => {
    if (confirm('Are you sure you want to trigger inheritance? This action cannot be undone.')) {
      setTriggeringInheritance(true);
      try {
        await triggerInheritance(vault.id);
      } finally {
        setTriggeringInheritance(false);
      }
    }
  };

  // Mock transaction history
  const mockTransactions: SBTCTransaction[] = [
    {
      id: 'tx-1',
      vaultId: vault.id,
      type: 'deposit' as any,
      amount: vault.sbtcBalance,
      from: 'user',
      to: vault.id,
      status: 'confirmed' as any,
      timestamp: vault.createdAt,
      blockHeight: 12345,
      txHash: '0x123...abc'
    },
    {
      id: 'tx-2',
      vaultId: vault.id,
      type: 'inheritance-payout' as any,
      amount: 0,
      from: vault.id,
      to: 'heir',
      status: 'confirmed' as any,
      timestamp: vault.lastActivity,
      blockHeight: 12346,
      txHash: '0x456...def'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/sbtc-dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{vault.name}</h1>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                getStatusColor() === 'green' ? 'bg-green-100 text-green-800' :
                getStatusColor() === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getStatusText()}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {vault.sbtcLocked ? (
                <LockClosedIcon className="h-6 w-6 text-red-500" title="sBTC Locked" />
              ) : (
                <LockOpenIcon className="h-6 w-6 text-green-500" title="sBTC Unlocked" />
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* sBTC Balance */}
            <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <CurrencyDollarIcon className="h-6 w-6 mr-2 text-bitcoin-600" />
                  sBTC Balance
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    disabled={vault.sbtcLocked}
                    className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors text-sm"
                  >
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                    Withdraw
                  </button>
                </div>
              </div>
              
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {sbtcBalance.toFixed(8)} sBTC
                </div>
                <div className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  ${usdValue.toLocaleString()} USD
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Minimum Inheritance</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{(vault.minimumInheritance / 100000000).toFixed(8)} sBTC</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Distribution Mode</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{vault.autoDistribute ? 'Auto' : 'Manual'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inheritance Timeline */}
            <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-blue-600" />
                Inheritance Timeline
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Days since last activity: {daysSinceLastActivity}</span>
                  <span>Inheritance delay: {inheritanceDelayDays} days</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isPastDeadline ? 'bg-red-500' : isNearDeadline ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, (daysSinceLastActivity / inheritanceDelayDays) * 100))}%`
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  {isPastDeadline ? (
                    <span className="text-red-600 font-medium">
                      {isInGracePeriod 
                        ? `Grace period: ${gracePeriodDays - Math.abs(daysUntilInheritance)} days left`
                        : 'Ready for inheritance'
                      }
                    </span>
                  ) : (
                    <span className="text-gray-900 font-medium">
                      {daysUntilInheritance} days until inheritance
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-3 mt-6">
                  {!isPastDeadline && (
                    <button
                      onClick={handleProofOfLife}
                      disabled={updatingProof}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {updatingProof ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      ) : (
                        <ClockIcon className="h-4 w-4 mr-2" />
                      )}
                      Update Proof of Life
                    </button>
                  )}
                  
                  {canTriggerInheritance && (
                    <button
                      onClick={handleTriggerInheritance}
                      disabled={triggeringInheritance}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {triggeringInheritance ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      ) : (
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      )}
                      Trigger Inheritance
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vault Info */}
            <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vault Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vault ID:</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{vault.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{vault.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{vault.lastActivity.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`text-sm font-medium ${
                    vault.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {vault.status === 'active' ? 'Active' : 'Inheritance Triggered'}
                  </span>
                </div>
              </div>
            </div>

            {/* Heirs */}
            <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                Heirs
              </h3>
              <div className="space-y-3">
                {vault.beneficiaries.map((heir: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{heir.relationshipToOwner || `Heir ${index + 1}`}</div>
                      <div className="text-sm text-gray-600">{heir.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{heir.allocationPercentage}%</div>
                      <div className="text-sm text-gray-600">
                        {((heir.allocationPercentage / 100) * sbtcBalance).toFixed(8)} sBTC
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
            <div className="space-y-3">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      tx.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{tx.type.replace('-', ' ')}</div>
                      <div className="text-sm text-gray-600">{tx.txHash}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.amount && (
                      <div className="font-medium text-gray-900">
                        {(tx.amount / 100000000).toFixed(8)} sBTC
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw Modal */}
      {showDepositModal && (
        <SBTCDepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          vaultId={vault.id}
          onDeposit={depositSBTC}
        />
      )}
    </div>
  );
}