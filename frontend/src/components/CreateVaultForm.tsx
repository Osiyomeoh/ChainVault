import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreateSBTCVaultData, CreateBeneficiaryData, PrivacyLevel } from '../types/index';
import { toast } from 'react-hot-toast';
import { sbtcStacksService } from '../services/sbtcStacksService';
import { ShieldCheckIcon, CogIcon, CurrencyDollarIcon, UserGroupIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { showConnect, UserSession, AppConfig } from '@stacks/connect';

interface CreateVaultFormProps {
  onSuccess?: (vaultId: string) => void;
  onCancel?: () => void;
}

// Privacy level options
const PRIVACY_LEVEL_OPTIONS = [
  { value: PrivacyLevel.PUBLIC, label: 'Public', description: 'Fully visible to everyone' },
  { value: PrivacyLevel.SEMI_PRIVATE, label: 'Semi-Private', description: 'Visible to selected parties' },
  { value: PrivacyLevel.PRIVATE, label: 'Private', description: 'Limited visibility' },
  { value: PrivacyLevel.HIGHLY_PRIVATE, label: 'Highly Private', description: 'Maximum privacy' }
];

export function CreateVaultForm({ onSuccess, onCancel }: CreateVaultFormProps) {
  const { user, userSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  
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
  const [lockSbtc, setLockSbtc] = useState(false);

  const [beneficiaries, setBeneficiaries] = useState<CreateBeneficiaryData[]>([
    { address: '', allocationPercentage: 100, minimumSbtcAmount: 0 }
  ]);



  const handleInputChange = (field: keyof CreateSBTCVaultData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Vault name is required');
      return false;
    }
    if (formData.inheritanceDelay < 144) {
      toast.error('Inheritance delay must be at least 1 day (144 blocks)');
      return false;
    }
    if (formData.gracePeriod < 144) {
      toast.error('Grace period must be at least 1 day (144 blocks)');
      return false;
    }
    
    // Validate Bitcoin addresses
    if (bitcoinAddresses.some(addr => !addr.trim())) {
      toast.error('All Bitcoin addresses are required');
      return false;
    }
    
    if (beneficiaries.length === 0) {
      toast.error('At least one beneficiary is required');
      return false;
    }

    const totalAllocation = beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0);
    if (totalAllocation !== 100) {
      toast.error('Total beneficiary allocation must equal 100%');
      return false;
    }

    for (const beneficiary of beneficiaries) {
      if (!beneficiary.address.trim()) {
        toast.error('All beneficiary addresses are required');
        return false;
      }
      if (beneficiary.allocationPercentage <= 0) {
        toast.error('All beneficiary allocations must be greater than 0%');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      // Step 1: Verify Stacks Connect authentication
      console.log('=== Verifying Stacks Connect Authentication ===');
      
      const appConfig = new AppConfig(['store_write', 'publish_data', 'contract_write']);
      const stacksUserSession = new UserSession({ appConfig });
      
      console.log('Stacks UserSession signed in:', stacksUserSession.isUserSignedIn());
      
      if (!stacksUserSession.isUserSignedIn()) {
        console.log('User not signed in with Stacks Connect, triggering authentication...');
        
        // Force Stacks authentication
        await new Promise((resolve, reject) => {
          showConnect({
            appDetails: {
              name: 'ChainVault',
              icon: window.location.origin + '/favicon.ico',
            },
            redirectTo: '/',
            onFinish: (authData) => {
              console.log('Stacks authentication successful:', authData);
              resolve(authData);
            },
            onCancel: () => {
              reject(new Error('Authentication cancelled'));
            },
          });
        });
      }
  
      // Step 2: Verify user address
      if (!user?.address) {
        throw new Error('User address not available. Please reconnect your wallet.');
      }
  
      console.log('Authentication verified, proceeding with transaction...');
  
      // Step 3: Prepare transaction data
      const timestamp = Date.now();
      const shortAddress = user.address.slice(-6);
      const autoVaultId = `vault-${timestamp}-${shortAddress}`;
  
      const transactionData = {
        vaultId: autoVaultId,
        vaultName: formData.name,
        inheritanceDelay: formData.inheritanceDelay,
        privacyLevel: formData.privacyLevel,
        gracePeriod: formData.gracePeriod,
        autoDistribute: formData.autoDistribute,
        minimumInheritance: formData.minimumInheritance,
        beneficiaries: beneficiaries,
        initialSbtcAmount: formData.initialSbtcAmount || 0,
        bitcoinAddresses: bitcoinAddresses.filter(addr => addr.trim() !== ''),
        lockSbtc: lockSbtc
      };
  
      console.log('Transaction data prepared:', transactionData);
  
      // Step 4: Call the service
      console.log('Calling createSBTCVault...');
      const vaultId = await sbtcStacksService.createSBTCVault(transactionData);
      
      console.log('Vault creation successful! Transaction ID:', vaultId);
      toast.success(`Vault created successfully! Transaction: ${vaultId.slice(0, 10)}...`);
      
      onSuccess?.(vaultId);
      
    } catch (error: any) {
      console.error('Vault creation failed:', error);
      
      let errorMessage = 'Failed to create vault. Please try again.';
      
      if (error.message) {
        if (error.message.includes('cancelled')) {
          errorMessage = 'Transaction was cancelled.';
        } else if (error.message.includes('Authentication cancelled')) {
          errorMessage = 'Wallet authentication was cancelled.';
        } else if (error.message.includes('not authenticated')) {
          errorMessage = 'Please connect your Stacks wallet first.';
        } else {
          errorMessage = `Creation failed: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatBlocksToDays = (blocks: number) => {
    return Math.round(blocks / 144);
  };

  const formatDaysToBlocks = (days: number) => {
    return days * 144;
  };

  const formatSatoshisToSBTC = (satoshis: number) => {
    return satoshis / 100000000;
  };

  const formatSBTCToSatoshis = (sbtc: number) => {
    return Math.floor(sbtc * 100000000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-bitcoin-500" />
              Basic Vault Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vault Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., Family sBTC Legacy"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Give your vault a descriptive name</p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CogIcon className="w-5 h-5 mr-2 text-bitcoin-500" />
              Inheritance Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inheritance Delay (days)
                </label>
                <input
                  type="number"
                  value={formatBlocksToDays(formData.inheritanceDelay)}
                  onChange={(e) => {
                    const days = Number(e.target.value);
                    if (days >= 1 && days <= 3650) {
                      handleInputChange('inheritanceDelay', formatDaysToBlocks(days));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  min="1"
                  max="3650"
                  placeholder="e.g., 365"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Days before inheritance triggers (1-3650)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grace Period (days)
                </label>
                <input
                  type="number"
                  value={formatBlocksToDays(formData.gracePeriod)}
                  onChange={(e) => {
                    const days = Number(e.target.value);
                    if (days >= 1 && days <= 365) {
                      handleInputChange('gracePeriod', formatDaysToBlocks(days));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  min="1"
                  max="365"
                  placeholder="e.g., 7"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Additional days after trigger (1-365)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Privacy Level
                </label>
                <select
                  value={formData.privacyLevel}
                  onChange={(e) => handleInputChange('privacyLevel', Number(e.target.value))}
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
                  onChange={(e) => handleInputChange('autoDistribute', e.target.checked)}
                  className="h-4 w-4 text-bitcoin-600 focus:ring-bitcoin-500 border-gray-300 dark:border-dark-600 rounded bg-white dark:bg-dark-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-distribute inheritance</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-bitcoin-500" />
              Bitcoin & sBTC Configuration
            </h3>
            
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
                      onChange={(e) => updateBitcoinAddress(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="bc1..."
                      required
                    />
                    {bitcoinAddresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBitcoinAddress(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBitcoinAddress}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Add Bitcoin Address
                </button>
              </div>
            </div>

            {/* sBTC Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial sBTC Deposit
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formatSatoshisToSBTC(formData.initialSbtcAmount || 0)}
                  onChange={(e) => {
                    const sbtc = Number(e.target.value);
                    if (sbtc >= 0 && sbtc <= 1000) {
                      handleInputChange('initialSbtcAmount', formatSBTCToSatoshis(sbtc));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  min="0"
                  max="1000"
                  placeholder="0.00000000"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatSatoshisToSBTC(formData.initialSbtcAmount || 0).toFixed(8)} sBTC = {formData.initialSbtcAmount || 0} satoshis
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Initial sBTC to deposit (0-1000 sBTC)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Inheritance
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formatSatoshisToSBTC(formData.minimumInheritance)}
                  onChange={(e) => {
                    const sbtc = Number(e.target.value);
                    if (sbtc >= 0 && sbtc <= 1000) {
                      handleInputChange('minimumInheritance', formatSBTCToSatoshis(sbtc));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  min="0"
                  max="1000"
                  placeholder="0.00000000"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatSatoshisToSBTC(formData.minimumInheritance).toFixed(8)} sBTC = {formData.minimumInheritance} satoshis
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Min sBTC to trigger inheritance</p>
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

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2 text-bitcoin-500" />
              Beneficiaries
            </h3>
            
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={addBeneficiary}
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
                      onChange={(e) => handleBeneficiaryChange(index, 'address', e.target.value)}
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
                      onChange={(e) => {
                        const percentage = Number(e.target.value);
                        if (percentage >= 0 && percentage <= 100) {
                          handleBeneficiaryChange(index, 'allocationPercentage', percentage);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
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
                      onChange={(e) => handleBeneficiaryChange(index, 'minimumSbtcAmount', formatSBTCToSatoshis(Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 dark:focus:ring-bitcoin-400 bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      min="0"
                      placeholder="0.00000000"
                    />
                  </div>

                  <div className="flex items-end">
                    {beneficiaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBeneficiary(index)}
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
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Allocation Summary
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <div>Total Allocation: <strong>{beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0)}%</strong></div>
                  {beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0) !== 100 && (
                    <div className="text-red-600 dark:text-red-400">
                      ⚠️ Must equal 100% for inheritance to work properly
                    </div>
                  )}
                  {beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0) === 100 && (
                    <div className="text-green-600 dark:text-green-400">
                      ✅ Perfect! Allocations are properly set
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create sBTC Inheritance Vault</h2>
      
      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 0 ? 'bg-bitcoin-500 text-white' : 'bg-gray-300 dark:bg-dark-600 text-gray-500 dark:text-gray-400'
            }`}>1</div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Basic Info</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep >= 1 ? 'bg-bitcoin-500' : 'bg-gray-300 dark:bg-dark-600'}`}></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-bitcoin-500 text-white' : 'bg-gray-300 dark:bg-dark-600 text-gray-500 dark:text-gray-400'
            }`}>2</div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-bitcoin-500' : 'bg-gray-300 dark:bg-dark-600'}`}></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-bitcoin-500 text-white' : 'bg-gray-300 dark:bg-dark-600 text-gray-500 dark:text-gray-400'
            }`}>3</div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Bitcoin & sBTC</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-bitcoin-500' : 'bg-gray-300 dark:bg-dark-600'}`}></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-bitcoin-500 text-white' : 'bg-gray-300 dark:bg-dark-600 text-gray-500 dark:text-gray-400'
            }`}>4</div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Beneficiaries</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Content */}
        <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6 border border-gray-200 dark:border-dark-600">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-dark-600">
          <button
            type="button"
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
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
            )}
            
            {currentStep === 3 ? (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-bitcoin-600 hover:bg-bitcoin-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Vault...' : 'Create Vault'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-2 bg-bitcoin-600 hover:bg-bitcoin-700 text-white rounded-md transition-colors"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
