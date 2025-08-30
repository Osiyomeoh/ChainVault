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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-dark-800 p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Deposit sBTC</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
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
              className="input w-full text-base sm:text-lg py-3 px-4"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-error-500 bg-error-900/20 border border-error-800 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3 text-base"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tour-deposit btn-primary flex-1 py-3 text-base"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? 'Depositing...' : 'Deposit'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-dark-400 space-y-1">
          <p className="break-all">Vault ID: {vaultId}</p>
          <p>Minimum deposit: 0.00000001 sBTC</p>
        </div>
      </div>
    </div>
  );
}
