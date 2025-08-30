import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  actionHint?: string;
}

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep?: string;
}

export function ProductTour({ isOpen, onClose, currentStep }: ProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const tourRef = useRef<HTMLDivElement>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ChainVault! 🎉',
      content: 'Let\'s take a quick tour of your sBTC inheritance vault. You\'ll learn how to mint tokens, deposit them, manage proof of life, and trigger inheritance.',
      target: '.tour-welcome',
      position: 'bottom'
    },
    {
      id: 'mint',
      title: 'Step 1: Mint sBTC Tokens',
      content: 'First, you need test sBTC tokens. Click the "Mint sBTC" button to create tokens for testing. These are mock tokens on the testnet.',
      target: '.tour-mint',
      position: 'bottom',
      action: 'Click "Mint sBTC" to create test tokens',
      actionHint: 'This creates mock sBTC tokens for testing purposes'
    },
    {
      id: 'deposit',
      title: 'Step 2: Deposit to Vault',
      content: 'Once you have sBTC tokens, deposit them into your inheritance vault. This locks them until inheritance conditions are met.',
      target: '.tour-deposit',
      position: 'bottom',
      action: 'Click "Deposit sBTC" to transfer tokens to vault',
      actionHint: 'Tokens are now locked in your inheritance vault'
    },
    {
      id: 'proof-of-life',
      title: 'Step 3: Proof of Life',
      content: 'Regularly update your proof of life to extend the inheritance deadline. This prevents accidental inheritance triggers.',
      target: '.tour-proof-of-life',
      position: 'bottom',
      action: 'Click "Update Proof of Life" to extend deadline',
      actionHint: 'This resets your inheritance countdown timer'
    },
    {
      id: 'inheritance',
      title: 'Step 4: Inheritance Trigger',
      content: 'When ready, trigger inheritance to distribute sBTC to your beneficiaries. This can be automatic or manual based on your vault settings.',
      target: '.tour-inheritance',
      position: 'bottom',
      action: 'Click "Trigger Inheritance" to distribute assets',
      actionHint: 'This starts the distribution process to beneficiaries'
    },
    {
      id: 'beneficiaries',
      title: 'Managing Beneficiaries',
      content: 'Add and manage beneficiaries who will receive your sBTC. Set allocation percentages and minimum amounts for each.',
      target: '.tour-beneficiaries',
      position: 'bottom',
      action: 'Configure beneficiaries and allocation percentages',
      actionHint: 'Beneficiaries can claim their inheritance after trigger'
    },
    {
      id: 'complete',
      title: 'Tour Complete! 🎯',
      content: 'You now understand the complete inheritance flow! Your vault is secure and ready to protect your sBTC assets for future generations.',
      target: '.tour-complete',
      position: 'bottom'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsPlaying(false);
      highlightElement(tourSteps[0].target);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        nextStep();
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentStepIndex]);

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      setHighlightedElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const nextStep = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      highlightElement(tourSteps[nextIndex].target);
    } else {
      setIsPlaying(false);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      highlightElement(tourSteps[prevIndex].target);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    highlightElement(tourSteps[index].target);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50" onClick={onClose} />
      
      {/* Tour Modal */}
      <div 
        ref={tourRef}
        className="fixed inset-4 z-50 bg-white dark:bg-dark-800 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-bitcoin-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Product Tour</h2>
                <p className="text-sm text-white text-opacity-90">
                  Step {currentStepIndex + 1} of {tourSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 dark:bg-gray-700 h-1">
          <div 
            className="bg-gradient-to-r from-bitcoin-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {currentStepData.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {currentStepData.content}
            </p>

            {currentStepData.action && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Action Required:
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {currentStepData.action}
                    </p>
                    {currentStepData.actionHint && (
                      <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 italic">
                        {currentStepData.actionHint}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={previousStep}
                disabled={currentStepIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <PlayIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>

              <button
                onClick={nextStep}
                disabled={currentStepIndex === tourSteps.length - 1}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-bitcoin-600 hover:bg-bitcoin-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>{currentStepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex items-center justify-center space-x-2">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStepIndex
                    ? 'bg-bitcoin-500'
                    : index < currentStepIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Highlighted Element Overlay */}
      {highlightedElement && (
        <div
          className="fixed z-40 pointer-events-none"
          style={{
            top: highlightedElement.offsetTop - 4,
            left: highlightedElement.offsetLeft - 4,
            width: highlightedElement.offsetWidth + 8,
            height: highlightedElement.offsetHeight + 8,
            border: '3px solid #f59e0b',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
