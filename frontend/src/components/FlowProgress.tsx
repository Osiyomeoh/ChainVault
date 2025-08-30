import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'completed' | 'current' | 'pending' | 'error';
  action?: () => void;
  actionText?: string;
}

interface FlowProgressProps {
  vaultId: string;
  currentStep: string;
  onStepAction: (stepId: string) => void;
  vaultData?: any;
}

export function FlowProgress({ vaultId, currentStep, onStepAction, vaultData }: FlowProgressProps) {
  const steps: FlowStep[] = [
    {
      id: 'mint',
      title: 'Mint sBTC',
      description: 'Create test sBTC tokens for vault operations',
      icon: CurrencyDollarIcon,
      status: vaultData?.sbtcBalance > 0 ? 'completed' : 'pending',
      action: () => onStepAction('mint'),
      actionText: 'Mint sBTC'
    },
    {
      id: 'deposit',
      title: 'Deposit to Vault',
      description: 'Transfer sBTC tokens into your inheritance vault',
      icon: ShieldCheckIcon,
      status: vaultData?.sbtcBalance > 0 ? 'completed' : 'pending',
      action: () => onStepAction('deposit'),
      actionText: 'Deposit sBTC'
    },
    {
      id: 'proof-of-life',
      title: 'Proof of Life',
      description: 'Update your proof of life to extend inheritance deadline',
      icon: ClockIcon,
      status: currentStep === 'proof-of-life' ? 'current' : 'pending',
      action: () => onStepAction('proof-of-life'),
      actionText: 'Update Proof of Life'
    },
    {
      id: 'inheritance-trigger',
      title: 'Inheritance Trigger',
      description: 'Trigger inheritance distribution to beneficiaries',
      icon: UserGroupIcon,
      status: currentStep === 'inheritance-trigger' ? 'current' : 'pending',
      action: () => onStepAction('inheritance-trigger'),
      actionText: 'Trigger Inheritance'
    }
  ];

  const getStepIcon = (step: FlowStep) => {
    const iconClasses = "h-6 w-6";
    
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon className={`${iconClasses} text-green-500`} />;
      case 'current':
        return <ClockIcon className={`${iconClasses} text-blue-500`} />;
      case 'error':
        return <ExclamationTriangleIcon className={`${iconClasses} text-red-500`} />;
      default:
        return <step.icon className={`${iconClasses} text-gray-400`} />;
    }
  };

  const getStepStatusText = (step: FlowStep) => {
    switch (step.status) {
      case 'completed':
        return 'Completed';
      case 'current':
        return 'In Progress';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Inheritance Flow Progress
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Complete all steps to set up your sBTC inheritance vault
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connection line */}
            {index < steps.length - 1 && (
              <div className="absolute left-3 top-8 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
            )}
            
            <div className="flex items-start space-x-4">
              {/* Step icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {getStepIcon(step)}
                </div>
              </div>
              
              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : step.status === 'current'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : step.status === 'error'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {getStepStatusText(step)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {step.description}
                </p>
                
                {/* Action button */}
                {step.action && step.status !== 'completed' && (
                  <button
                    onClick={step.action}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      step.status === 'current'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {step.actionText}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flow summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Flow Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
