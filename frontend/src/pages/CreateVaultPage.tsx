import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useSBTCVaults } from '../contexts/SBTCVaultContext';
import { toast } from 'react-hot-toast';

interface CreateSBTCVaultData {
  vaultName: string;
  inheritanceDelay: number;
  privacyLevel: number;
  gracePeriod: number;
  autoDistribute: boolean;
  minimumInheritance: number;
  beneficiaries: {
    address: string;
    allocationPercentage: number;
    minimumSbtcAmount: number;
    relationshipToOwner: string;
    contactInfo: string;
  }[];
}

const validationSchema = yup.object({
  vaultName: yup.string().required('Vault name is required').max(50, 'Name too long'),
  inheritanceDelay: yup.number().min(1, 'Minimum 1 day').max(365, 'Maximum 1 year').required(),
  privacyLevel: yup.number().min(1).max(4).required(),
  gracePeriod: yup.number().min(1, 'Minimum 1 day').max(30, 'Maximum 30 days').required(),
  autoDistribute: yup.boolean().required(),
  minimumInheritance: yup.number().min(0.001, 'Minimum 0.001 sBTC').required(),
  beneficiaries: yup.array()
    .min(1, 'At least one beneficiary required')
    .of(
      yup.object({
        address: yup.string().required('Address required'),
        allocationPercentage: yup.number().min(1, 'Minimum 1%').max(100, 'Maximum 100%').required(),
        minimumSbtcAmount: yup.number().min(0.001, 'Minimum 0.001 sBTC').required(),
        relationshipToOwner: yup.string().required(),
        contactInfo: yup.string().email('Invalid email format').required(),
      })
    )
    .test('total-allocation', 'Total allocation must equal 100%', function(beneficiaries) {
      if (!beneficiaries) return true;
      const total = beneficiaries.reduce((sum: number, b: any) => sum + (b.allocationPercentage || 0), 0);
      return Math.abs(total - 100) < 0.01;
    })
});

export function CreateVaultPage() {
  const navigate = useNavigate();
  const { createVault } = useSBTCVaults();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<CreateSBTCVaultData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      vaultName: '',
      inheritanceDelay: 365,
      privacyLevel: 2,
      gracePeriod: 7,
      autoDistribute: true,
      minimumInheritance: 0.1,
      beneficiaries: [
        {
          address: '',
          allocationPercentage: 100,
          minimumSbtcAmount: 0.1,
          relationshipToOwner: '',
          contactInfo: '',
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'beneficiaries'
  });

  const watchedBeneficiaries = watch('beneficiaries');
  const totalAllocation = watchedBeneficiaries?.reduce((sum, b) => sum + (b.allocationPercentage || 0), 0) || 0;

  const steps = [
    { title: 'Basic Info', description: 'Vault settings and timeline' },
    { title: 'sBTC Config', description: 'Bitcoin inheritance parameters' },
    { title: 'Beneficiaries', description: 'Add inheritance recipients' },
    { title: 'Review', description: 'Deploy your vault' },
  ];

  const nextStep = async () => {
    const fieldsToValidate = {
      1: ['vaultName', 'inheritanceDelay', 'privacyLevel', 'gracePeriod'],
      2: ['autoDistribute', 'minimumInheritance'],
      3: ['beneficiaries'],
    }[currentStep] as (keyof CreateSBTCVaultData)[];

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: any) => {
    setIsDeploying(true);
    try {
      const vaultId = await createVault(data);
      toast.success('Vault created successfully!');
      navigate('/sbtc-dashboard');
    } catch (error) {
      console.error('Failed to create vault:', error);
      toast.error('Failed to create vault. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const addBeneficiary = () => {
    append({
      address: '',
      allocationPercentage: Math.max(0, 100 - totalAllocation),
      minimumSbtcAmount: 0.05,
      relationshipToOwner: '',
      contactInfo: '',
    });
  };

  const privacyLevels = [
    { value: 1, title: 'Stealth', description: 'Complete secrecy until inheritance' },
    { value: 2, title: 'Delayed', description: '30-day notice before reveal' },
    { value: 3, title: 'Gradual', description: 'Progressive education over time' },
    { value: 4, title: 'Transparent', description: 'Immediate awareness' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/sbtc-dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create sBTC Inheritance Vault</h1>
          <p className="text-gray-600 dark:text-gray-400">Set up automated Bitcoin inheritance with programmable sBTC</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex flex-col items-center ${
                  index + 1 <= currentStep ? 'text-bitcoin-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 < currentStep
                      ? 'bg-bitcoin-600 text-white'
                      : index + 1 === currentStep
                      ? 'bg-bitcoin-100 text-bitcoin-600 border-2 border-bitcoin-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs">{step.description}</div>
                </div>
              </div>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vault Name
                      </label>
                      <Controller
                        name="vaultName"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Family Bitcoin Legacy"
                            className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-bitcoin-500 focus:border-bitcoin-500"
                          />
                        )}
                      />
                      {errors.vaultName && (
                        <p className="mt-1 text-sm text-red-600">{errors.vaultName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Inheritance Delay (days)
                      </label>
                      <Controller
                        name="inheritanceDelay"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <input
                              {...field}
                              type="range"
                              min="1"
                              max="365"
                              className="w-full"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span>1 day</span>
                              <span className="font-medium">{field.value} days</span>
                              <span>1 year</span>
                            </div>
                          </div>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grace Period (days)
                      </label>
                      <Controller
                        name="gracePeriod"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <input
                              {...field}
                              type="range"
                              min="1"
                              max="30"
                              className="w-full"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span>1 day</span>
                              <span className="font-medium">{field.value} days</span>
                              <span>30 days</span>
                            </div>
                          </div>
                        )}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Additional time after deadline before inheritance can be triggered
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Privacy Level
                      </label>
                      <Controller
                        name="privacyLevel"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            {privacyLevels.map((level) => (
                              <div
                                key={level.value}
                                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                  field.value === level.value
                                    ? 'border-bitcoin-500 bg-bitcoin-50 dark:bg-bitcoin-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                                onClick={() => field.onChange(level.value)}
                              >
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    checked={field.value === level.value}
                                    onChange={() => field.onChange(level.value)}
                                    className="text-bitcoin-600"
                                  />
                                  <div className="ml-3">
                                    <div className="font-medium text-gray-900 dark:text-white">{level.title}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{level.description}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: sBTC Configuration */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">sBTC Configuration</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum Inheritance (sBTC)
                      </label>
                      <Controller
                        name="minimumInheritance"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <input
                              {...field}
                              type="number"
                              step="0.001"
                              min="0.001"
                              placeholder="0.1"
                              className="w-full px-3 py-2 pr-16 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-bitcoin-500 focus:border-bitcoin-500"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                            <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">sBTC</span>
                          </div>
                        )}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Minimum sBTC amount required in vault before inheritance can trigger
                      </p>
                      {errors.minimumInheritance && (
                        <p className="mt-1 text-sm text-red-600">{errors.minimumInheritance.message}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Auto-distribute sBTC
                        </label>
                        <Controller
                          name="autoDistribute"
                          control={control}
                          render={({ field }) => (
                            <button
                              type="button"
                              onClick={() => field.onChange(!field.value)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                field.value ? 'bg-bitcoin-600' : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  field.value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          )}
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {watch('autoDistribute')
                          ? 'sBTC will be automatically distributed to beneficiaries when inheritance triggers'
                          : 'Beneficiaries must manually claim their sBTC allocation'
                        }
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                          <p className="font-medium mb-1">About sBTC Configuration</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>sBTC is Bitcoin made programmable through smart contracts</li>
                            <li>Your vault will hold actual sBTC that transfers to beneficiaries</li>
                            <li>You can deposit sBTC after vault creation</li>
                            <li>Auto-distribute provides seamless inheritance experience</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Beneficiaries */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Beneficiaries</h2>
                    <button
                      type="button"
                      onClick={addBeneficiary}
                      className="flex items-center px-3 py-2 text-sm bg-bitcoin-600 text-white rounded-lg hover:bg-bitcoin-700 transition-colors dark:bg-bitcoin-700 dark:hover:bg-bitcoin-800"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Beneficiary
                    </button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900 dark:text-white">Beneficiary {index + 1}</h3>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Stacks Address *
                            </label>
                            <Controller
                              name={`beneficiaries.${index}.address`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-bitcoin-500 focus:border-bitcoin-500"
                                />
                              )}
                            />
                            {errors.beneficiaries?.[index]?.address && (
                              <p className="mt-1 text-xs text-red-600">{errors.beneficiaries[index]?.address?.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Allocation % *
                            </label>
                            <Controller
                              name={`beneficiaries.${index}.allocationPercentage`}
                              control={control}
                              render={({ field }) => (
                                <div className="relative">
                                  <input
                                    {...field}
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-bitcoin-500 focus:border-bitcoin-500"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                                </div>
                              )}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Minimum sBTC Amount
                            </label>
                            <Controller
                              name={`beneficiaries.${index}.minimumSbtcAmount`}
                              control={control}
                              render={({ field }) => (
                                <div className="relative">
                                  <input
                                    {...field}
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    className="w-full px-3 py-2 pr-16 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-bitcoin-500 focus:border-bitcoin-500"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                  <span className="absolute right-3 top-2 text-gray-500 text-sm">sBTC</span>
                                </div>
                              )}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Relationship (Optional)
                            </label>
                            <Controller
                              name={`beneficiaries.${index}.relationshipToOwner`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="Spouse, Child, Trust..."
                                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-bitcoin-500 focus:border-bitcoin-500"
                                />
                              )}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Contact Info (Optional, Encrypted)
                            </label>
                            <Controller
                              name={`beneficiaries.${index}.contactInfo`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="email"
                                  placeholder="beneficiary@email.com"
                                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-bitcoin-500 focus:border-bitcoin-500"
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Allocation Summary */}
                    <div className={`p-4 rounded-lg ${
                      Math.abs(totalAllocation - 100) < 0.01 
                        ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                        : 'bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700'
                    }`}>
                      <div className="flex items-center">
                        {Math.abs(totalAllocation - 100) < 0.01 ? (
                          <div className="flex items-center text-green-700 dark:text-green-300">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            <span className="font-medium">Perfect! Total allocation: {totalAllocation}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-700 dark:text-yellow-300">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                            <span className="font-medium">
                              Total allocation: {totalAllocation}% (must equal 100%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {errors.beneficiaries?.root && (
                      <p className="text-sm text-red-600">{errors.beneficiaries.root.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Review & Deploy</h2>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Vault Name</div>
                        <div className="text-gray-900 dark:text-white">{watch('vaultName')}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Inheritance Delay</div>
                        <div className="text-gray-900 dark:text-white">{watch('inheritanceDelay')} days</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Grace Period</div>
                        <div className="text-gray-900 dark:text-white">{watch('gracePeriod')} days</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy Level</div>
                        <div className="text-gray-900 dark:text-white">
                          {privacyLevels.find(l => l.value === watch('privacyLevel'))?.title}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Inheritance</div>
                        <div className="text-gray-900 dark:text-white">{watch('minimumInheritance')} sBTC</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-distribute</div>
                        <div className="text-gray-900 dark:text-white">{watch('autoDistribute') ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Beneficiaries ({watchedBeneficiaries?.length})
                    </h3>
                    <div className="space-y-2">
                      {watchedBeneficiaries?.map((beneficiary, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {beneficiary.relationshipToOwner || `Beneficiary ${index + 1}`}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {beneficiary.address?.slice(0, 10)}...{beneficiary.address?.slice(-8)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {beneficiary.allocationPercentage}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Min: {beneficiary.minimumSbtcAmount} sBTC
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="ml-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p className="font-medium mb-1">Important Notice</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>This is experimental software. Only use amounts you can afford to lose.</li>
                          <li>Smart contract deployment cannot be undone.</li>
                          <li>Ensure all beneficiary addresses are correct.</li>
                          <li>You can deposit sBTC after vault creation.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-2">Estimated Deployment Cost</p>
                      <div className="flex justify-between">
                        <span>Smart Contract Deployment:</span>
                        <span>~0.01 STX</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transaction Fee:</span>
                        <span>~0.005 STX</span>
                      </div>
                      <div className="border-t border-blue-200 dark:border-blue-700 mt-2 pt-2 flex justify-between font-medium">
                        <span>Total:</span>
                        <span>~0.015 STX</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-gray-600 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-bitcoin-600 text-white rounded-lg hover:bg-bitcoin-700 transition-colors dark:bg-bitcoin-700 dark:hover:bg-bitcoin-800"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isDeploying || Math.abs(totalAllocation - 100) >= 0.01}
                  className="flex items-center px-6 py-2 bg-bitcoin-600 text-white rounded-lg hover:bg-bitcoin-700 transition-colors dark:bg-bitcoin-700 dark:hover:bg-bitcoin-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeploying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Deploying Vault...
                    </>
                  ) : (
                    'Deploy Vault'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}