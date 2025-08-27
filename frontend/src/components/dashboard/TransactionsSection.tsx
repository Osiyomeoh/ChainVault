import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { SBTCVault } from '../../types';

interface TransactionsSectionProps {
  vaults: SBTCVault[];
}

export function TransactionsSection({ vaults }: TransactionsSectionProps) {
  return (
    <div className="text-center py-12">
      <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Transaction History</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Monitor sBTC movements and distributions across all vaults
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        Coming soon - This section will show all transaction history
      </p>
    </div>
  );
}
