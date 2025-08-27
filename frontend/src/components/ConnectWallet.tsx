import React from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface ConnectWalletProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function ConnectWallet({ 
  className = '', 
  variant = 'primary',
  size = 'md' 
}: ConnectWalletProps) {
  const { signIn, signOut, isSignedIn, user, loading } = useAuth();

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-bitcoin-600 hover:bg-bitcoin-700 text-white focus:ring-bitcoin-500 shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    outline: "border-2 border-bitcoin-600 text-bitcoin-600 hover:bg-bitcoin-50 focus:ring-bitcoin-500"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm space-x-1.5",
    md: "px-4 py-2 text-sm space-x-2",
    lg: "px-6 py-3 text-base space-x-2"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-5 w-5"
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = () => {
    if (loading) return;
    signIn();
  };

  const handleDisconnect = () => {
    signOut();
  };

  // If user is signed in, show connected state
  if (isSignedIn && user) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDisconnect}
        className={`${baseClasses} bg-green-600 hover:bg-red-600 text-white focus:ring-green-500 shadow-sm hover:shadow-md ${sizeClasses[size]} ${className}`}
      >
        <CheckIcon className={iconSizes[size]} />
        <span>{user.stacksAddress ? formatAddress(user.stacksAddress) : 'Connected'}</span>
      </motion.button>
    );
  }

  // Show connect button when not signed in
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleConnect}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-current" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <WalletIcon className={iconSizes[size]} />
          <span>Connect Wallet</span>
        </>
      )}
    </motion.button>
  );
}