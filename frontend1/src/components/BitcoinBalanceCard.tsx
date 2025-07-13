import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { BitcoinBalance } from '../types';
import { vaultService } from '../services/vaultService';

interface BitcoinBalanceCardProps {
  vaultId: string;
}

export const BitcoinBalanceCard = ({ vaultId }: BitcoinBalanceCardProps) => {
  const [balances, setBalances] = useState<BitcoinBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);

  const fetchBalances = async () => {
    try {
      setRefreshing(true);
      const data = await vaultService.getBitcoinBalances(vaultId);
      setBalances(data);
    } catch (error) {
      console.error('Failed to fetch Bitcoin balances:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [vaultId]);

  const totalBalance = balances.reduce((sum, balance) => sum + balance.balance, 0);
  const totalBalanceBTC = totalBalance / 100000000;

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <CurrencyDollarIcon className="h-5 w-5 text-bitcoin-500" />
          <span>Bitcoin Holdings</span>
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddresses(!showAddresses)}
            className="btn-secondary flex items-center space-x-2"
          >
            {showAddresses ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
            <span>{showAddresses ? 'Hide' : 'Show'} Addresses</span>
          </button>
          
          <button
            onClick={fetchBalances}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="text-center p-4 bg-bitcoin-500/10 rounded-lg">
          <div className="text-2xl font-bold text-bitcoin-400 mb-1">
            {totalBalanceBTC.toFixed(8)} BTC
          </div>
          <div className="text-sm text-dark-400">Total Balance</div>
        </div>
        
        <div className="text-center p-4 bg-dark-700 rounded-lg">
          <div className="text-2xl font-bold mb-1">
            {balances.length}
          </div>
          <div className="text-sm text-dark-400">Addresses Monitored</div>
        </div>
      </div>

      {showAddresses && (
        <div className="space-y-3">
          <h4 className="font-medium text-dark-300">Address Details</h4>
          {balances.map((balance, index) => (
            <motion.div
              key={balance.address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-dark-600 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-mono text-sm">
                  {balance.address.slice(0, 12)}...{balance.address.slice(-8)}
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {(balance.balance / 100000000).toFixed(8)} BTC
                  </div>
                  {balance.unconfirmedBalance > 0 && (
                    <div className="text-xs text-yellow-400">
                      +{(balance.unconfirmedBalance / 100000000).toFixed(8)} unconfirmed
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-dark-400">
                <div>Transactions: {balance.txCount}</div>
                <div>Total Received: {(balance.totalReceived / 100000000).toFixed(8)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {balances.length === 0 && (
        <div className="text-center py-8">
          <CurrencyDollarIcon className="h-12 w-12 text-dark-500 mx-auto mb-3" />
          <p className="text-dark-400">No Bitcoin addresses configured</p>
        </div>
      )}
    </motion.div>
  );
};