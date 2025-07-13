import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useVaults } from '../contexts/VaultContext';
import { useAuth } from '../contexts/AuthContext';
import { CreateVaultRequest, PrivacyLevel } from '../types';
import { PRIVACY_LEVELS } from '../config';
import toast from 'react-hot-toast';

const validationSchema = yup.object({
  vaultName: yup.string().required('Vault name is required').max(50, 'Name too long'),
  inheritanceDelay: yup.number()
    .required('Inheritance delay is required')
    .min(1, 'Delay must be at least 1 block')
    .max(52560, 'Delay cannot exceed 1 year (52,560 blocks)'),
  privacyLevel: yup.number().required('Privacy level is required').oneOf([1, 2, 3, 4]),
  gracePeriod: yup.number()
    .required('Grace period is required')
    .min(144, 'Grace period must be at least 1 day (144 blocks)')
    .max(4320, 'Grace period cannot exceed 30 days (4,320 blocks)'),
  bitcoinAddresses: yup.array()
    .of(yup.string().required('Bitcoin address is required'))
    .min(1, 'At least one Bitcoin address is required'),
  beneficiaries: yup.array()
    .of(
      yup.object({
        name: yup.string().required('Beneficiary name is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
        allocationPercentage: yup.number()
          .required('Allocation is required')
          .min(1, 'Minimum 1%')
          .max(100, 'Maximum 100%'),
        relationship: yup.string().required('Relationship is required'),
        conditions: yup.string(),
      })
    )
    .min(1, 'At least one beneficiary is required')
    .test('total-allocation', 'Total allocation must equal 100%', function(beneficiaries) {
      if (!beneficiaries) return false;
      const total = beneficiaries.reduce((sum, b) => sum + (b?.allocationPercentage || 0), 0);
      return total === 100;
    }),
});

const privacyLevels = [
  {
    level: PRIVACY_LEVELS.STEALTH,
    name: 'Stealth Mode',
    description: 'Complete privacy - beneficiaries learn about inheritance only when triggered',
    icon: '👤',
  },
  {
    level: PRIVACY_LEVELS.DELAYED,
    name: 'Delayed Disclosure',
    description: '30-day notice period before inheritance information is revealed',
    icon: '⏰',
  },
  {
    level: PRIVACY_LEVELS.GRADUAL,
    name: 'Gradual Education',
    description: 'Beneficiaries are gradually educated about their inheritance over time',
    icon: '📚',
  },
  {
    level: PRIVACY_LEVELS.TRANSPARENT,
    name: 'Full Transparency',
    description: 'Beneficiaries are immediately aware of the inheritance plan',
    icon: '👁️',
  },
];

export const CreateVaultPage = () => {
  const navigate = useNavigate();
  const { createVault } = useVaults();
  const { userSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateVaultRequest>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      vaultName: '',
      inheritanceDelay: 4320, // 30 days
      privacyLevel: PRIVACY_LEVELS.STEALTH as PrivacyLevel,
      gracePeriod: 144, // 1 day
      bitcoinAddresses: [''],
      beneficiaries: [
        {
          name: '',
          email: '',
          allocationPercentage: 100,
          relationship: '',
          conditions: '',
        },
      ],
    },
    mode: 'onChange',
  });

  const watchedBitcoinAddresses = watch('bitcoinAddresses');
  const watchedBeneficiaries = watch('beneficiaries');

  const addBitcoinAddress = () => {
    setValue('bitcoinAddresses', [...watchedBitcoinAddresses, '']);
  };

  const removeBitcoinAddress = (index: number) => {
    const addresses = watchedBitcoinAddresses.filter((_, i) => i !== index);
    setValue('bitcoinAddresses', addresses);
  };

  const addBeneficiary = () => {
    setValue('beneficiaries', [
      ...watchedBeneficiaries,
      {
        name: '',
        email: '',
        allocationPercentage: 0,
        relationship: '',
        conditions: '',
      },
    ]);
  };

  const removeBeneficiary = (index: number) => {
    const beneficiaries = watchedBeneficiaries.filter((_, i) => i !== index);
    setValue('beneficiaries', beneficiaries);
  };

  const onSubmit = async (data: CreateVaultRequest) => {
    setLoading(true);
    try {
      const vaultId = await createVault({
        ...data,
        userSession,
      });

      if (vaultId) {
        toast.success('Vault created successfully!');
        navigate(`/vault/${vaultId}`);
      } else {
        toast.error('Failed to create vault');
      }
    } catch (error) {
      console.error('Failed to create vault:', error);
      toast.error('Failed to create vault');
    } finally {
      setLoading(false);
    }
  };

  const totalAllocation = watchedBeneficiaries.reduce(
    (sum, b) => sum + (b?.allocationPercentage || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center space-x-3">
          <ShieldCheckIcon className="h-8 w-8 text-bitcoin-500" />
          <span>Create Inheritance Vault</span>
        </h1>
        <p className="text-dark-300 mt-2">
          Set up a secure, private inheritance plan for your Bitcoin holdings.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Step 1: Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-6">1. Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Vault Name</label>
              <Controller
                name="vaultName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="input-field w-full"
                    placeholder="e.g., Family Bitcoin Legacy"
                  />
                )}
              />
              {errors.vaultName && (
                <p className="text-red-400 text-sm mt-1">{errors.vaultName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Inheritance Delay (Stacks blocks)
              </label>
              <Controller
                name="inheritanceDelay"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className="input-field w-full"
                    placeholder="4320 (≈30 days)"
                  />
                )}
              />
              {errors.inheritanceDelay && (
                <p className="text-red-400 text-sm mt-1">{errors.inheritanceDelay.message}</p>
              )}
              <p className="text-xs text-dark-400 mt-1">
                4,320 blocks ≈ 30 days
              </p>
            </div>
          </div>
        </motion.div>

        {/* Step 2: Privacy Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-6">2. Privacy Level</h2>
          
          <Controller
            name="privacyLevel"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {privacyLevels.map((level) => (
                  <div
                    key={level.level}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      field.value === level.level
                        ? 'border-bitcoin-500 bg-bitcoin-500/10'
                        : 'border-dark-600 hover:border-dark-500'
                    }`}
                    onClick={() => field.onChange(level.level)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <h3 className="font-semibold">{level.name}</h3>
                        <p className="text-sm text-dark-300 mt-1">{level.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </motion.div>

        {/* Step 3: Bitcoin Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-6">3. Bitcoin Addresses</h2>
          
          <div className="space-y-4">
            {watchedBitcoinAddresses.map((_, index) => (
              <div key={index} className="flex space-x-3">
                <Controller
                  name={`bitcoinAddresses.${index}`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="input-field flex-1"
                      placeholder="Bitcoin address (e.g., bc1q...)"
                    />
                  )}
                />
                {watchedBitcoinAddresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBitcoinAddress(index)}
                    className="btn-secondary px-3"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addBitcoinAddress}
              className="btn-outline flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Bitcoin Address</span>
            </button>
          </div>
        </motion.div>

        {/* Step 4: Beneficiaries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">4. Beneficiaries</h2>
            <div className={`text-sm px-3 py-1 rounded-lg ${
              totalAllocation === 100 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              Total: {totalAllocation}%
            </div>
          </div>
          
          <div className="space-y-6">
            {watchedBeneficiaries.map((_, index) => (
              <div key={index} className="border border-dark-600 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Beneficiary #{index + 1}</h3>
                  {watchedBeneficiaries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBeneficiary(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Controller
                      name={`beneficiaries.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="input-field w-full"
                          placeholder="Full name"
                        />
                      )}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Controller
                      name={`beneficiaries.${index}.email`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          className="input-field w-full"
                          placeholder="email@example.com"
                        />
                      )}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Allocation (%)</label>
                    <Controller
                      name={`beneficiaries.${index}.allocationPercentage`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          className="input-field w-full"
                          placeholder="50"
                        />
                      )}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Relationship</label>
                    <Controller
                      name={`beneficiaries.${index}.relationship`}
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="input-field w-full">
                          <option value="">Select relationship</option>
                          <option value="spouse">Spouse</option>
                          <option value="child">Child</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="friend">Friend</option>
                          <option value="charity">Charity</option>
                          <option value="other">Other</option>
                        </select>
                      )}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Special Conditions (Optional)
                  </label>
                  <Controller
                    name={`beneficiaries.${index}.conditions`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        className="input-field w-full h-20 resize-none"
                        placeholder="Any special conditions for this beneficiary..."
                      />
                    )}
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addBeneficiary}
              className="btn-outline flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Beneficiary</span>
            </button>
          </div>
        </motion.div>

        {/* Step 5: Advanced Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-6">5. Advanced Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Grace Period (Stacks blocks)
              </label>
              <Controller
                name="gracePeriod"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className="input-field w-full"
                    placeholder="144 (≈1 day)"
                  />
                )}
              />
              {errors.gracePeriod && (
                <p className="text-red-400 text-sm mt-1">{errors.gracePeriod.message}</p>
              )}
              <p className="text-xs text-dark-400 mt-1">
                Additional time after inheritance delay before triggering
              </p>
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center space-x-2 text-sm text-dark-400">
            <InformationCircleIcon className="h-4 w-4" />
            <span>All sensitive data is encrypted before storage</span>
          </div>
          
          <button
            type="submit"
            disabled={!isValid || loading || totalAllocation !== 100}
            className="btn-primary flex items-center space-x-2 px-8 py-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Vault...</span>
              </>
            ) : (
              <>
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Create Vault</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <h3 className="font-medium text-red-400 mb-2">Please fix the following issues:</h3>
            <ul className="text-sm text-red-300 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error?.message}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </form>
    </div>
  );
};