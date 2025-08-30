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
import { SBTCMintModal } from '../components/SBTCMintModal';
import { useDarkMode } from '../contexts/DarkModeContext';
import { sbtcStacksService } from '../services/sbtcStacksService';
import { SBTCTransaction, SBTCVault } from '../types';
import { toast } from 'react-hot-toast';

export function VaultDetailsPage() {
  const { vaultId } = useParams<{ vaultId: string }>();
  const navigate = useNavigate();
  const { vaults, updateProofOfLife, triggerInheritance, withdrawSBTC } = useSBTCVaults();
  const { darkMode } = useDarkMode();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [updatingProof, setUpdatingProof] = useState(false);
  const [triggeringInheritance, setTriggeringInheritance] = useState(false);
  const [transactions, setTransactions] = useState<SBTCTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [minting, setMinting] = useState(false);
  const [userSbtcBalance, setUserSbtcBalance] = useState<number>(0);
  const [vaultSbtcBalance, setVaultSbtcBalance] = useState<number>(0);

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

  // Use real-time vault balance if available, otherwise fall back to static data
  const sbtcBalance = vaultSbtcBalance > 0 ? vaultSbtcBalance / 100000000 : vault.sbtcBalance / 100000000;
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

  // Fetch real transaction history
  const fetchTransactions = async () => {
    if (!vault) return;
    
    setLoadingTransactions(true);
    try {
      const realTransactions = await sbtcStacksService.getVaultTransactions(vault.id);
      setTransactions(realTransactions);
      console.log('Fetched real transactions:', realTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Fallback to empty array
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Mint mock sBTC tokens to user
  const handleMintMockSBTC = async (amount: number) => {
    setMinting(true);
    try {
      console.log('Minting mock sBTC tokens:', { amount, userAddress: vault.owner });
      
      // Use the service to mint tokens
      const response = await sbtcStacksService.mintMockSBTC(vault.owner, amount);
      
      console.log('Mint response:', response);
      
      if (response) {
        toast.success(`Mock sBTC tokens minted successfully! Amount: ${(amount / 100000000).toFixed(8)} sBTC`);
        // Wait a moment for the transaction to be processed, then refresh user balance
        setTimeout(() => {
          console.log('Refreshing balance after minting...');
          fetchUserSbtcBalance();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to mint mock sBTC:', error);
      toast.error('Failed to mint mock sBTC tokens');
      throw error; // Re-throw to let modal handle the error
    } finally {
      setMinting(false);
    }
  };

  // Fetch user's mock sBTC balance
  const fetchUserSbtcBalance = async () => {
    if (!vault) return;
    
    try {
      const balance = await sbtcStacksService.getUserMockSbtcBalance(vault.owner);
      setUserSbtcBalance(balance);
    } catch (error) {
      console.error('Failed to fetch user sBTC balance:', error);
    }
  };

  // Fetch vault's sBTC balance
  const fetchVaultSbtcBalance = async () => {
    if (!vault) return;
    
    try {
      // Try to get the vault balance from the contract
      const balance = await sbtcStacksService.getVaultSBTCBalance(vault.id);
      if (balance && balance > 0) {
        setVaultSbtcBalance(balance);
      } else {
        // Fallback to the vault object data
        setVaultSbtcBalance(vault.sbtcBalance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch vault sBTC balance:', error);
      // Fallback to the vault object data
      setVaultSbtcBalance(vault.sbtcBalance || 0);
    }
  };

  // Local deposit function using the service directly
  const handleDepositSBTC = async (amount: number) => {
    if (!vault) return;
    
    try {
      console.log('Depositing sBTC to vault:', vault.id, 'amount:', amount);
      
      // Convert sBTC to sats (1 sBTC = 100,000,000 sats)
      const amountInSats = Math.floor(amount * 100000000);
      
      const response = await sbtcStacksService.depositSBTC(vault.id, amountInSats);
      console.log('Deposit response:', response);
      
      toast.success(`Successfully deposited ${amount} sBTC to vault! Transaction ID: ${response}`);
      
      // Refresh vault data after successful deposit
      await refreshVaultData();
      
    } catch (error) {
      console.error('Failed to deposit sBTC:', error);
      toast.error('Failed to deposit sBTC. Please try again.');
    }
  };

  // Refresh vault data after operations
  const refreshVaultData = async () => {
    if (!vault) return;
    
    try {
      console.log('Refreshing vault data...');
      
      // Refresh transactions
      await fetchTransactions();
      
      // Refresh user balance
      await fetchUserSbtcBalance();
      
      // Refresh vault balance
      await fetchVaultSbtcBalance();
      
      toast.success('Vault data refreshed successfully!');
      
    } catch (error) {
      console.error('Failed to refresh vault data:', error);
      toast.error('Failed to refresh vault data');
    }
  };

  // Load transactions and user balance when component mounts
  React.useEffect(() => {
    fetchTransactions();
    fetchUserSbtcBalance();
    fetchVaultSbtcBalance();
  }, [vault]);

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
                {/* User Mock sBTC Balance - Prominently positioned */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                  <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Your Mock sBTC Balance</div>
                  <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-3">
                    {(userSbtcBalance / 100000000).toFixed(8)} sBTC
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                    Available for deposits and testing
                  </div>
                  
                  {/* Mint Button - Centered and prominent */}
                  <div className="flex flex-col items-center space-y-3">
                    <button
                      onClick={() => setShowMintModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                      Mint Mock sBTC
                    </button>
                    
                    {/* Wallet Status Indicator */}
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {typeof window !== 'undefined' && ((window as any).StacksProvider || (window as any).stacks || (window as any).XverseProvider) 
                        ? '✅ Wallet Connected - Ready to Mint'
                        : '⚠️ Wallet Not Connected - Connect to Mint'
                      }
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-4">
                    Contract: {sbtcStacksService.getNetworkInfo().contractAddress}.mock-sbtc-token-v2
                  </div>
                </div>
                
                {/* Vault sBTC Balance */}
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
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{heir.relationshipToOwner || `Heir ${index + 1}`}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{heir.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">{heir.allocationPercentage}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
            
            {loadingTransactions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx: SBTCTransaction) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        tx.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {tx.type.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {tx.amount && (
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tx.amount / 100000000).toFixed(8)} sBTC
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tx.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No transactions found for this vault.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Transactions will appear here when you deposit, withdraw, or trigger inheritance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw Modal */}
      {showDepositModal && (
        <SBTCDepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          vaultId={vault.id}
          onDeposit={handleDepositSBTC}
        />
      )}

      {/* Mint Modal */}
      {showMintModal && (
        <SBTCMintModal
          isOpen={showMintModal}
          onClose={() => setShowMintModal(false)}
          onMint={handleMintMockSBTC}
          userAddress={vault.owner}
        />
      )}
    </div>
  );
}