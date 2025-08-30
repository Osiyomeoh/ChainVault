import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SBTCMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (amount: number) => Promise<void>;
  userAddress: string;
}

export function SBTCMintModal({ isOpen, onClose, onMint, userAddress }: SBTCMintModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Convert sBTC to sats (1 sBTC = 100,000,000 sats)
      const amountInSats = Math.floor(parseFloat(amount) * 100000000);
      await onMint(amountInSats);
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint mock sBTC');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white dark:bg-dark-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mint Mock sBTC</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (sBTC)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              step="0.00000001"
              min="0.00000001"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter amount in sBTC (e.g., 1.00 for 1 sBTC)
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div className="font-medium mb-1">Mint Details:</div>
              <div>• Recipient: {userAddress}</div>
              <div>• Network: Testnet</div>
              <div>• Contract: mock-sbtc-token-v2</div>
              <div>• Purpose: Testing only</div>
            </div>
          </div>

          {/* Wallet Connection Status */}
          <div className={`border rounded-lg p-3 ${
            typeof window !== 'undefined' && ((window as any).StacksProvider || (window as any).stacks || (window as any).XverseProvider)
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className={`text-sm ${
              typeof window !== 'undefined' && ((window as any).StacksProvider || (window as any).stacks || (window as any).XverseProvider)
                ? 'text-green-800 dark:text-green-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              <div className="font-medium mb-1">Wallet Connection:</div>
              <div>• Status: {typeof window !== 'undefined' && ((window as any).StacksProvider || (window as any).stacks || (window as any).XverseProvider) ? '✅ Connected' : '❌ Not Connected'}</div>
              <div>• Required: Hiro Wallet, Xverse, or Stacks wallet</div>
              <div>• Network: Must be connected to testnet</div>
              {typeof window !== 'undefined' && !((window as any).StacksProvider || (window as any).stacks || (window as any).XverseProvider) && (
                <div className="mt-2 text-xs">
                  💡 To mint tokens, you need to connect a Stacks wallet first.
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tour-mint flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors disabled:opacity-50"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? 'Minting...' : 'Mint sBTC'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>⚠️ This mints mock sBTC tokens for testing purposes only.</p>
          <p>These tokens have no real value and are only for development.</p>
        </div>
      </div>
    </div>
  );
}
