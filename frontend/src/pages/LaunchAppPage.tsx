import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ConnectWallet } from '../components/ConnectWallet';
import {
  ShieldCheckIcon,
  WalletIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

export function LaunchAppPage() {
  const { isSignedIn, user } = useAuth();
  const navigate = useNavigate();

  // If user is already signed in, redirect to dashboard
  React.useEffect(() => {
    if (isSignedIn && user) {
      navigate('/sbtc-dashboard');
    }
  }, [isSignedIn, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="bg-bitcoin-600 p-4 rounded-2xl">
                <ShieldCheckIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to ChainVault
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Secure your family's Bitcoin future with programmable inheritance. 
              Connect your wallet to access your vaults and start planning.
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - App Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <LockClosedIcon className="h-6 w-6 mr-3 text-bitcoin-500" />
                Secure Inheritance Platform
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Create private inheritance vaults</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Lock sBTC with smart contracts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Automated beneficiary distribution</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Proof of life verification</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <WalletIcon className="h-6 w-6 mr-3 text-stacks-500" />
                Built on Stacks & Bitcoin
              </h3>
              <p className="text-gray-300 mb-4">
                Leverage the security of Bitcoin with the programmability of Stacks smart contracts.
                Your inheritance is secured by the most robust blockchain network.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Network:</span>
                <span className="bg-stacks-600 text-white px-2 py-1 rounded text-xs">Stacks Testnet</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Wallet Connection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
              <h3 className="text-2xl font-semibold mb-6">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-8">
                To access ChainVault, you need to connect your Stacks wallet. 
                This ensures secure access to your inheritance vaults.
              </p>
              
              <div className="mb-8">
                <ConnectWallet size="lg" className="w-full" />
              </div>

              <div className="text-sm text-gray-400 space-y-2">
                <p>Supported wallets:</p>
                <div className="flex justify-center space-x-4">
                  <span className="bg-dark-700 px-3 py-1 rounded">Hiro</span>
                  <span className="bg-dark-700 px-3 py-1 rounded">Xverse</span>
                  <span className="bg-dark-700 px-3 py-1 rounded">Leather</span>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 bg-dark-700 rounded-xl p-6 border border-dark-600"
            >
              <h4 className="font-semibold mb-3 flex items-center justify-center">
                <ArrowRightIcon className="h-5 w-5 mr-2 text-bitcoin-500" />
                What happens next?
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p>1. Connect your Stacks wallet</p>
                <p>2. Access your dashboard</p>
                <p>3. Create inheritance vaults</p>
                <p>4. Lock sBTC for your family</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16 text-gray-400"
        >
          <p className="text-sm">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
