import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreateSBTCVaultData, CreateBeneficiaryData, PrivacyLevel } from '../types/index';
import { toast } from 'react-hot-toast';
import { sbtcStacksService } from '../services/sbtcStacksService';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface CreateVaultWizardProps {
  onSuccess?: (vaultId: string) => void;
  onCancel?: () => void;
}

// Step configuration
const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: ShieldCheckIcon, description: 'Vault name and ID' },
  { id: 'settings', title: 'Settings', icon: CogIcon, description: 'Inheritance and privacy' },
  { id: 'bitcoin', title: 'Bitcoin', icon: CurrencyDollarIcon, description: 'Addresses and sBTC' },
  { id: 'beneficiaries', title: 'Beneficiaries', icon: UserGroupIcon, description: 'Who gets what' },
  { id: 'review', title: 'Review', icon: DocumentTextIcon, description: 'Final confirmation' }
];

// Preset options
const INHERITANCE_DELAY_PRESETS = [
  { label: '1 Month', value: 144 * 30, description: '30 days' },
  { label: '3 Months', value: 144 * 90, description: '90 days' },
  { label: '6 Months', value: 144 * 180, description: '180 days' },
  { label: '1 Year', value: 144 * 365, description: '365 days' },
  { label: '2 Years', value: 144 * 730, description: '730 days' },
  { label: '5 Years', value: 144 * 1825, description: '1825 days' },
  { label: 'Custom', value: 'custom', description: 'Enter custom days' }
];

const GRACE_PERIOD_PRESETS = [
  { label: '1 Day', value: 144, description: '24 hours' },
  { label: '3 Days', value: 144 * 3, description: '72 hours' },
  { label: '1 Week', value: 144 * 7, description: '7 days' },
  { label: '2 Weeks', value: 144 * 14, description: '14 days' },
  { label: '1 Month', value: 144 * 30, description: '30 days' },
  { label: 'Custom', value: 'custom', description: 'Enter custom days' }
];

const PRIVACY_LEVEL_OPTIONS = [
  { value: PrivacyLevel.PUBLIC, label: 'Public', description: 'Fully visible to everyone' },
  { value: PrivacyLevel.SEMI_PRIVATE, label: 'Semi-Private', description: 'Visible to selected parties' },
  { value: PrivacyLevel.PRIVATE, label: 'Private', description: 'Limited visibility' },
  { value: PrivacyLevel.HIGHLY_PRIVATE, label: 'Highly Private', description: 'Maximum privacy' }
];

const INITIAL_SBTC_PRESETS = [
  { label: 'No Initial Deposit', value: 0, description: 'Create empty vault' },
  { label: '0.001 sBTC', value: 100000, description: 'Small test amount' },
  { label: '0.01 sBTC', value: 1000000, description: 'Moderate amount' },
  { label: '0.1 sBTC', value: 10000000, description: 'Significant amount' },
  { label: '1 sBTC', value: 100000000, description: 'Large amount' },
  { label: 'Custom', value: 'custom', description: 'Enter custom amount' }
];

export function CreateVaultWizard({ onSuccess, onCancel }: CreateVaultWizardProps) {
  const { user, userSession } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Form data with all contract parameters
  const [formData, setFormData] = useState<CreateSBTCVaultData>({
    vaultId: '',
    name: '',
    inheritanceDelay: 144 * 365, // 1 year default
    privacyLevel: PrivacyLevel.PRIVATE,
    gracePeriod: 144 * 7, // 1 week default
    autoDistribute: true,
    minimumInheritance: 10000000, // 0.1 sBTC default
    beneficiaries: [],
    initialSbtcAmount: 0
  });

  // Additional contract parameters
  const [bitcoinAddresses, setBitcoinAddresses] = useState<string[]>(['']);
  const [beneficiaries, setBeneficiaries] = useState<CreateBeneficiaryData[]>([
    { address: '', allocationPercentage: 100, minimumSbtcAmount: 0 }
  ]);
  const [lockSbtc, setLockSbtc] = useState(false);

  // Custom input states
  const [customInheritanceDelay, setCustomInheritanceDelay] = useState(365);
  const [customGracePeriod, setCustomGracePeriod] = useState(7);
  const [customInitialSbtc, setCustomInitialSbtc] = useState(0);
  const [customMinInheritance, setCustomMinInheritance] = useState(0.1);

  const handleInputChange = (field: keyof CreateSBTCVaultData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBeneficiaryChange = (index: number, field: keyof CreateBeneficiaryData, value: any) => {
    const newBeneficiaries = [...beneficiaries];
    newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
    setBeneficiaries(newBeneficiaries);
  };

  const addBeneficiary = () => {
    setBeneficiaries(prev => [...prev, { address: '', allocationPercentage: 0, minimumSbtcAmount: 0 }]);
  };

  const removeBeneficiary = (index: number) => {
    if (beneficiaries.length > 1) {
      setBeneficiaries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addBitcoinAddress = () => {
    setBitcoinAddresses(prev => [...prev, '']);
  };

  const removeBitcoinAddress = (index: number) => {
    if (bitcoinAddresses.length > 1) {
      setBitcoinAddresses(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateBitcoinAddress = (index: number, value: string) => {
    const newAddresses = [...bitcoinAddresses];
    newAddresses[index] = value;
    setBitcoinAddresses(newAddresses);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Info
        if (!formData.vaultId.trim() || !formData.name.trim()) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 1: // Settings
        if (formData.inheritanceDelay < 144 || formData.gracePeriod < 144) {
          toast.error('Please set valid inheritance delay and grace period');
          return false;
        }
        break;
      case 2: // Bitcoin
        if (bitcoinAddresses.some(addr => !addr.trim())) {
          toast.error('Please fill in all Bitcoin addresses');
          return false;
        }
        break;
      case 3: // Beneficiaries
        if (beneficiaries.length === 0) {
          toast.error('At least one beneficiary is required');
          return false;
        }
        const totalAllocation = beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0);
        if (totalAllocation !== 100) {
          toast.error('Total beneficiary allocation must equal 100%');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Generate hashes for contract
      const bitcoinAddressesHash = generateHash(bitcoinAddresses.join(','));
      const beneficiariesHash = generateHash(JSON.stringify(beneficiaries));

      // Prepare contract data
      const contractData = {
        ...formData,
        beneficiaries: beneficiaries.map(b => ({
          ...b,
          minimumSbtcAmount: b.minimumSbtcAmount || 0
        }))
      };

      if (!user?.address) {
        throw new Error('User not authenticated');
      }

      // Call blockchain service
      const vaultId = await sbtcStacksService.createSBTCVault(
        userSession,
        contractData.vaultId,
        contractData.name,
        contractData.inheritanceDelay,
        contractData.privacyLevel,
        contractData.gracePeriod,
        contractData.autoDistribute,
        contractData.minimumInheritance,
        contractData.beneficiaries,
        contractData.initialSbtcAmount
      );

      toast.success('Vault created successfully on blockchain!');
      onSuccess?.(vaultId);
    } catch (error) {
      console.error('Failed to create vault:', error);
      toast.error('Failed to create vault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simple hash function (in production, use proper crypto)
  const generateHash = (data: string): string => {
    return '0x' + Array.from(data).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  };

  const formatBlocksToDays = (blocks: number) => Math.round(blocks / 144);
  const formatDaysToBlocks = (days: number) => days * 144;
  const formatSatoshisToSBTC = (satoshis: number) => (satoshis / 100000000).toFixed(8);
  const formatSBTCToSatoshis = (sbtc: number) => Math.floor(sbtc * 100000000);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep formData={formData} onInputChange={handleInputChange} />;
      case 1:
        return <SettingsStep 
          formData={formData} 
          onInputChange={handleInputChange}
          customInheritanceDelay={customInheritanceDelay}
          setCustomInheritanceDelay={setCustomInheritanceDelay}
          customGracePeriod={customGracePeriod}
          setCustomGracePeriod={setCustomGracePeriod}
        />;
      case 2:
        return <BitcoinStep 
          bitcoinAddresses={bitcoinAddresses}
          onAddAddress={addBitcoinAddress}
          onRemoveAddress={removeBitcoinAddress}
          onUpdateAddress={updateBitcoinAddress}
          formData={formData}
          onInputChange={handleInputChange}
          lockSbtc={lockSbtc}
          setLockSbtc={setLockSbtc}
          customInitialSbtc={customInitialSbtc}
          setCustomInitialSbtc={setCustomInitialSbtc}
          customMinInheritance={customMinInheritance}
          setCustomMinInheritance={setCustomMinInheritance}
        />;
      case 3:
        return <BeneficiariesStep 
          beneficiaries={beneficiaries}
          onBeneficiaryChange={handleBeneficiaryChange}
          onAddBeneficiary={addBeneficiary}
          onRemoveBeneficiary={removeBeneficiary}
        />;
      case 4:
        return <ReviewStep 
          formData={formData}
          bitcoinAddresses={bitcoinAddresses}
          beneficiaries={beneficiaries}
          lockSbtc={lockSbtc}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700">
      {/* Progress Header */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create sBTC Inheritance Vault</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                index <= currentStep
                  ? 'border-bitcoin-500 bg-bitcoin-500 text-white'
                  : 'border-gray-300 dark:border-dark-600 text-gray-500 dark:text-gray-400'
              }`}>
                {index < currentStep ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-medium ${
                  index <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-bitcoin-500' : 'bg-gray-300 dark:bg-dark-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-dark-700">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-bitcoin-600 hover:bg-bitcoin-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Vault...' : 'Create Vault'}
            </button>
          ) : (
            <button
              onClick={() => {
                if (validateStep(currentStep)) {
                  nextStep();
                }
              }}
              className="flex items-center px-6 py-2 bg-bitcoin-600 hover:bg-bitcoin-700 text-white rounded-md transition-colors"
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function BasicInfoStep({ formData, onInputChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vault ID *
          </label>
          <input
            type="text"
            value={formData.vaultId}
            onChange={(e) => onInputChange('vaultId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g., family-legacy-2024"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unique identifier for your vault</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vault Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g., Family sBTC Legacy"
            required
          />
        </div>
      </div>
    </div>
  );
}

function SettingsStep({ formData, onInputChange, customInheritanceDelay, setCustomInheritanceDelay, customGracePeriod, setCustomGracePeriod }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Inheritance Delay
          </label>
          <select
            value={formData.inheritanceDelay}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'custom') {
                onInputChange('inheritanceDelay', formatDaysToBlocks(customInheritanceDelay));
              } else {
                onInputChange('inheritanceDelay', Number(value));
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            {INHERITANCE_DELAY_PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.label} ({preset.description})
              </option>
            ))}
          </select>
          {formData.inheritanceDelay === 'custom' && (
            <input
              type="number"
              value={customInheritanceDelay}
              onChange={(e) => {
                const days = Number(e.target.value);
                setCustomInheritanceDelay(days);
                onInputChange('inheritanceDelay', formatDaysToBlocks(days));
              }}
              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              min="1"
              max="3650"
              placeholder="Enter days"
            />
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Days of inactivity before inheritance triggers</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Grace Period
          </label>
          <select
            value={formData.gracePeriod}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'custom') {
                onInputChange('gracePeriod', formatDaysToBlocks(customGracePeriod));
              } else {
                onInputChange('gracePeriod', Number(value));
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            {GRACE_PERIOD_PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.label} ({preset.description})
              </option>
            ))}
          </select>
          {formData.gracePeriod === 'custom' && (
            <input
              type="number"
              value={customGracePeriod}
              onChange={(e) => {
                const days = Number(e.target.value);
                setCustomGracePeriod(days);
                onInputChange('gracePeriod', formatDaysToBlocks(days));
              }}
              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              min="1"
              max="365"
              placeholder="Enter days"
            />
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Additional days after inheritance trigger</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Privacy Level
          </label>
          <select
            value={formData.privacyLevel}
            onChange={(e) => onInputChange('privacyLevel', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            {PRIVACY_LEVEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.autoDistribute}
            onChange={(e) => onInputChange('autoDistribute', e.target.checked)}
            className="h-4 w-4 text-bitcoin-600 focus:ring-bitcoin-500 border-gray-300 dark:border-dark-600 rounded bg-white dark:bg-dark-700"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-distribute inheritance</span>
        </label>
      </div>
    </div>
  );
}

function BitcoinStep({ bitcoinAddresses, onAddAddress, onRemoveAddress, onUpdateAddress, formData, onInputChange, lockSbtc, setLockSbtc, customInitialSbtc, setCustomInitialSbtc, customMinInheritance, setCustomMinInheritance }: any) {
  return (
    <div className="space-y-6">
      {/* Bitcoin Addresses */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bitcoin Addresses *
        </label>
        <div className="space-y-3">
          {bitcoinAddresses.map((address, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={address}
                onChange={(e) => onUpdateAddress(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="bc1..."
                required
              />
              {bitcoinAddresses.length > 1 && (
                <button
                  onClick={() => onRemoveAddress(index)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={onAddAddress}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Add Bitcoin Address
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bitcoin addresses associated with this vault</p>
      </div>

      {/* sBTC Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Initial sBTC Deposit
          </label>
          <select
            value={formData.initialSbtcAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'custom') {
                onInputChange('initialSbtcAmount', formatSBTCToSatoshis(customInitialSbtc));
              } else {
                onInputChange('initialSbtcAmount', Number(value));
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            {INITIAL_SBTC_PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.label} - {preset.description}
              </option>
            ))}
          </select>
          {formData.initialSbtcAmount === 'custom' && (
            <input
              type="number"
              step="0.00000001"
              value={customInitialSbtc}
              onChange={(e) => {
                const sbtc = Number(e.target.value);
                setCustomInitialSbtc(sbtc);
                onInputChange('initialSbtcAmount', formatSBTCToSatoshis(sbtc));
              }}
              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              min="0"
              placeholder="0.00000000"
            />
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Initial sBTC to deposit when creating vault</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Inheritance
          </label>
          <select
            value={formData.minimumInheritance}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'custom') {
                onInputChange('minimumInheritance', formatSBTCToSatoshis(customMinInheritance));
              } else {
                onInputChange('minimumInheritance', Number(value));
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            {INITIAL_SBTC_PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.label} - {preset.description}
              </option>
            ))}
          </select>
          {formData.minimumInheritance === 'custom' && (
            <input
              type="number"
              step="0.00000001"
              value={customMinInheritance}
              onChange={(e) => {
                const sbtc = Number(e.target.value);
                setCustomMinInheritance(sbtc);
                onInputChange('minimumInheritance', formatSBTCToSatoshis(sbtc));
              }}
              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              min="0"
              placeholder="0.00000000"
            />
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum sBTC required to trigger inheritance</p>
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={lockSbtc}
              onChange={(e) => setLockSbtc(e.target.checked)}
              className="h-4 w-4 text-bitcoin-600 focus:ring-bitcoin-500 border-gray-300 dark:border-dark-600 rounded bg-white dark:bg-dark-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Lock sBTC immediately</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function BeneficiariesStep({ beneficiaries, onBeneficiaryChange, onAddBeneficiary, onRemoveBeneficiary }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Beneficiaries</h3>
        <button
          onClick={onAddBeneficiary}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
        >
          Add Beneficiary
        </button>
      </div>

      <div className="space-y-4">
        {beneficiaries.map((beneficiary, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address *
              </label>
              <input
                type="text"
                value={beneficiary.address}
                onChange={(e) => onBeneficiaryChange(index, 'address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="SP..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Allocation % *
              </label>
              <input
                type="number"
                value={beneficiary.allocationPercentage}
                onChange={(e) => onBeneficiaryChange(index, 'allocationPercentage', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Amount (sBTC)
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formatSatoshisToSBTC(beneficiary.minimumSbtcAmount)}
                onChange={(e) => onBeneficiaryChange(index, 'minimumSbtcAmount', formatSBTCToSatoshis(Number(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                min="0"
                placeholder="0.00000000"
              />
            </div>

            <div className="flex items-end">
              {beneficiaries.length > 1 && (
                <button
                  onClick={() => onRemoveBeneficiary(index)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {beneficiaries.length > 0 && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Total Allocation: {beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0)}%
          {beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0) !== 100 && (
            <span className="text-red-600 dark:text-red-400 ml-2">(Must equal 100%)</span>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewStep({ formData, bitcoinAddresses, beneficiaries, lockSbtc }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vault Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Basic Information</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div><strong>Vault ID:</strong> {formData.vaultId}</div>
              <div><strong>Name:</strong> {formData.name}</div>
              <div><strong>Privacy Level:</strong> {formData.privacyLevel}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timing</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div><strong>Inheritance Delay:</strong> {Math.round(formData.inheritanceDelay / 144)} days</div>
              <div><strong>Grace Period:</strong> {Math.round(formData.gracePeriod / 144)} days</div>
              <div><strong>Auto-distribute:</strong> {formData.autoDistribute ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">sBTC Settings</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div><strong>Initial Deposit:</strong> {formatSatoshisToSBTC(formData.initialSbtcAmount)} sBTC</div>
              <div><strong>Min Inheritance:</strong> {formatSatoshisToSBTC(formData.minimumInheritance)} sBTC</div>
              <div><strong>Lock Immediately:</strong> {lockSbtc ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Beneficiaries</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div><strong>Count:</strong> {beneficiaries.length}</div>
              <div><strong>Total Allocation:</strong> {beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0)}%</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Bitcoin Addresses</h4>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {bitcoinAddresses.map((address, index) => (
              <div key={index}><strong>{index + 1}.</strong> {address}</div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Ready to Create</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>Your vault will be created on the Stacks blockchain. This action cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
