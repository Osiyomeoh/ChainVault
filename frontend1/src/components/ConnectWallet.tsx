import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WalletIcon } from '@heroicons/react/24/outline';

export const ConnectWallet: React.FC = () => {
  const { signIn, loading } = useAuth();

  return (
    <button
      onClick={signIn}
      disabled={loading}
      className="btn-primary flex items-center space-x-2"
    >
      <WalletIcon className="h-4 w-4" />
      <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
};