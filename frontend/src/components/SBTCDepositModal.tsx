import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SBTCDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  onDeposit: (amount: number) => Promise<void>;
}

export function SBTCDepositModal({ isOpen, onClose, vaultId, onDeposit }: SBTCDepositModalProps) {
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
      await onDeposit(parseFloat(amount));
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit sBTC');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-dark-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Deposit sBTC</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-dark-300 mb-2">
              Amount (sBTC)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.00000001"
              min="0"
              className="input w-full"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-error-500 bg-error-900/20 border border-error-800 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? 'Depositing...' : 'Deposit'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-dark-400">
          <p>Vault ID: {vaultId}</p>
          <p>Minimum deposit: 0.00000001 sBTC</p>
        </div>
      </div>
    </div>
  );
}
