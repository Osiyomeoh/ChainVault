import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { FlowProgress } from './FlowProgress';
import { ProductTour } from './ProductTour';
import { sbtcStacksService } from '../services/sbtcStacksService';
import { useAuth } from '../contexts/AuthContext';

interface CompleteFlowManagerProps {
  vaultId: string;
  vaultData?: any;
}

export function CompleteFlowManager({ vaultId, vaultData }: CompleteFlowManagerProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('mint');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [flowStatus, setFlowStatus] = useState({
    mint: false,
    deposit: false,
    proofOfLife: false,
    inheritanceTrigger: false
  });

  // Check current flow status
  useEffect(() => {
    if (vaultData) {
      const hasSbtc = vaultData.sbtcBalance > 0;
      const hasDeposits = vaultData.sbtcBalance > 0;
      const hasRecentActivity = vaultData.lastActivity && 
        (Date.now() - new Date(vaultData.lastActivity).getTime()) < (24 * 60 * 60 * 1000); // 24 hours
      const isInheritanceTriggered = vaultData.status === 'inherit-triggered';

      setFlowStatus({
        mint: hasSbtc,
        deposit: hasDeposits,
        proofOfLife: hasRecentActivity,
        inheritanceTrigger: isInheritanceTriggered
      });

      // Determine current step
      if (!hasSbtc) {
        setCurrentStep('mint');
      } else if (!hasDeposits) {
        setCurrentStep('deposit');
      } else if (!hasRecentActivity) {
        setCurrentStep('proof-of-life');
      } else if (!isInheritanceTriggered) {
        setCurrentStep('inheritance-trigger');
      } else {
        setCurrentStep('complete');
      }
    }
  }, [vaultData]);

  const handleStepAction = async (stepId: string) => {
    if (!user?.address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      switch (stepId) {
        case 'mint':
          await handleMint();
          break;
        case 'deposit':
          await handleDeposit();
          break;
        case 'proof-of-life':
          await handleProofOfLife();
          break;
        case 'inheritance-trigger':
          await handleInheritanceTrigger();
          break;
        default:
          setError('Unknown step');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    try {
      const amount = 1000000000; // 10 sBTC in satoshis
      const result = await sbtcStacksService.mintMockSBTC(user!.address, amount);
      
      setSuccess(`Successfully minted ${amount / 100000000} sBTC! Transaction: ${result}`);
      
      // Update flow status
      setFlowStatus(prev => ({ ...prev, mint: true }));
      setCurrentStep('deposit');
      
      // Refresh vault data after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err) {
      throw new Error(`Failed to mint sBTC: ${err}`);
    }
  };

  const handleDeposit = async () => {
    try {
      const amount = 500000000; // 5 sBTC in satoshis
      const result = await sbtcStacksService.depositSBTC(vaultId, amount);
      
      setSuccess(`Successfully deposited ${amount / 100000000} sBTC to vault! Transaction: ${result}`);
      
      // Update flow status
      setFlowStatus(prev => ({ ...prev, deposit: true }));
      setCurrentStep('proof-of-life');
      
      // Refresh vault data after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err) {
      throw new Error(`Failed to deposit sBTC: ${err}`);
    }
  };

  const handleProofOfLife = async () => {
    try {
      const result = await sbtcStacksService.updateProofOfLife(vaultId);
      
      setSuccess('Proof of life updated successfully! Your inheritance deadline has been extended.');
      
      // Update flow status
      setFlowStatus(prev => ({ ...prev, proofOfLife: true }));
      setCurrentStep('inheritance-trigger');
      
      // Refresh vault data after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err) {
      throw new Error(`Failed to update proof of life: ${err}`);
    }
  };

  const handleInheritanceTrigger = async () => {
    try {
      const result = await sbtcStacksService.triggerInheritance(vaultId);
      
      setSuccess('Inheritance triggered successfully! sBTC distribution to beneficiaries has begun.');
      
      // Update flow status
      setFlowStatus(prev => ({ ...prev, inheritanceTrigger: true }));
      setCurrentStep('complete');
      
      // Refresh vault data after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err) {
      throw new Error(`Failed to trigger inheritance: ${err}`);
    }
  };

  const getCurrentStepDescription = () => {
    switch (currentStep) {
      case 'mint':
        return 'Start by minting test sBTC tokens';
      case 'deposit':
        return 'Deposit sBTC into your inheritance vault';
      case 'proof-of-life':
        return 'Update your proof of life to extend the deadline';
      case 'inheritance-trigger':
        return 'Trigger inheritance distribution to beneficiaries';
      case 'complete':
        return 'All steps completed! Your inheritance vault is active';
      default:
        return 'Complete the inheritance flow';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-bitcoin-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Complete Inheritance Flow
            </h1>
            <p className="text-white text-opacity-90">
              {getCurrentStepDescription()}
            </p>
          </div>
          <button
            onClick={() => setIsTourOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
            <span>Take Tour</span>
          </button>
        </div>
      </div>

      {/* Flow Progress */}
      <FlowProgress
        vaultId={vaultId}
        currentStep={currentStep}
        onStepAction={handleStepAction}
        vaultData={vaultData}
      />

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Success</p>
              <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Processing...</p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">Please wait while we process your transaction</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleStepAction('mint')}
            disabled={isLoading || flowStatus.mint}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
              <PlayIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">Mint sBTC</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {flowStatus.mint ? 'Completed' : 'Create test tokens'}
            </span>
          </button>

          <button
            onClick={() => handleStepAction('deposit')}
            disabled={isLoading || !flowStatus.mint || flowStatus.deposit}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
              <PlayIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">Deposit</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {flowStatus.deposit ? 'Completed' : 'Transfer to vault'}
            </span>
          </button>

          <button
            onClick={() => handleStepAction('proof-of-life')}
            disabled={isLoading || !flowStatus.deposit || flowStatus.proofOfLife}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-2">
              <PlayIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">Proof of Life</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {flowStatus.proofOfLife ? 'Completed' : 'Extend deadline'}
            </span>
          </button>

          <button
            onClick={() => handleStepAction('inheritance-trigger')}
            disabled={isLoading || !flowStatus.proofOfLife || flowStatus.inheritanceTrigger}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
              <PlayIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">Trigger</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {flowStatus.inheritanceTrigger ? 'Completed' : 'Start distribution'}
            </span>
          </button>
        </div>
      </div>

      {/* Product Tour */}
      <ProductTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        currentStep={currentStep}
      />
    </div>
  );
}
