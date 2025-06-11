// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeSlashIcon,
  LinkIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectWallet } from '@/components/ConnectWallet';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Bitcoin Security',
    description: 'Built on Stacks, inheriting Bitcoin\'s proven security model for your inheritance planning.',
  },
  {
    icon: EyeSlashIcon,
    title: 'Privacy First',
    description: 'Complete stealth mode - beneficiaries learn about inheritance only when triggered.',
  },
  {
    icon: LinkIcon,
    title: 'Cross-Chain Ready',
    description: 'Unified inheritance across Bitcoin, Ethereum, and Solana via Wormhole protocol.',
  },
  {
    icon: ClockIcon,
    title: 'Automated Execution',
    description: 'Smart contracts handle inheritance automatically based on your proof-of-life schedule.',
  },
];

const stats = [
  { label: 'Bitcoin Lost Annually', value: '$4B+' },
  { label: 'Privacy-First Design', value: '100%' },
  { label: 'Inheritance Success Rate', value: '99.9%' },
  { label: 'Average Setup Time', value: '15min' },
];

export const HomePage: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Private Bitcoin Inheritance
            <span className="block text-gradient">Built for Privacy</span>
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
            The first privacy-first Bitcoin inheritance platform. Create secure succession plans 
            without revealing your holdings until inheritance is triggered.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isSignedIn ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                Go to Dashboard
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <ConnectWallet />
            )}
            <Link to="#features" className="btn-outline text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-dark-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-bitcoin-500 mb-2">{stat.value}</div>
              <div className="text-dark-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why ChainVault?</h2>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Built by Bitcoiners, for Bitcoiners who value privacy and security above all else.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card text-center"
            >
              <feature.icon className="h-12 w-12 text-bitcoin-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-dark-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-dark-800/50 rounded-2xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-dark-300">Simple, secure, and completely private</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-bitcoin-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Create Your Vault</h3>
            <p className="text-dark-300">
              Set up your inheritance vault with encrypted beneficiary information and Bitcoin addresses.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-bitcoin-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Proof of Life</h3>
            <p className="text-dark-300">
              Check in regularly to prove you're active. Miss the deadline and inheritance triggers automatically.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-bitcoin-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure Transfer</h3>
            <p className="text-dark-300">
              Smart contracts execute inheritance automatically, revealing information to beneficiaries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Secure Your Bitcoin Legacy?</h2>
          <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            Join the privacy-conscious Bitcoin holders who trust ChainVault with their inheritance planning.
          </p>
          {!isSignedIn && (
            <ConnectWallet />
          )}
        </motion.div>
      </section>
    </div>
  );
};

// src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useVaults } from '@/contexts/VaultContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { VaultCard } from '@/components/VaultCard';
import { StatsOverview } from '@/components/StatsOverview';
import { RecentActivity } from '@/components/RecentActivity';

export const DashboardPage: React.FC = () => {
  const { vaults, loading, updateProofOfLife } = useVaults();
  const { user } = useAuth();
  const [updatingVault, setUpdatingVault] = useState<string | null>(null);

  const handleProofOfLifeUpdate = async (vaultId: string) => {
    setUpdatingVault(vaultId);
    await updateProofOfLife(vaultId);
    setUpdatingVault(null);
  };

  const activeVaults = vaults.filter(v => v.status === 'active');
  const warningVaults = vaults.filter(v => {
    // Add logic to determine if vault needs attention
    return false; // Placeholder
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-dark-300 mt-1">
            Welcome back, {user?.stacksAddress.slice(0, 8)}...
          </p>
        </div>
        <Link to="/create-vault" className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Create Vault</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <StatsOverview vaults={vaults} />

      {/* Quick Actions */}
      {vaults.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                // Update all vaults proof of life
                activeVaults.forEach(vault => handleProofOfLifeUpdate(vault.vaultId));
              }}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
              disabled={updatingVault !== null}
            >
              <ClockIcon className="h-5 w-5" />
              <span>Update All Proof of Life</span>
            </button>
            
            <Link
              to="/analytics"
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <EyeIcon className="h-5 w-5" />
              <span>View Analytics</span>
            </Link>
            
            <Link
              to="/settings"
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Security Settings</span>
            </Link>
          </div>
        </div>
      )}

      {/* Vaults Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Vaults ({vaults.length})</h2>
          {vaults.length > 0 && (
            <div className="flex space-x-2 text-sm">
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active ({activeVaults.length})</span>
              </span>
              {warningVaults.length > 0 && (
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Needs Attention ({warningVaults.length})</span>
                </span>
              )}
            </div>
          )}
        </div>

        {vaults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShieldCheckIcon className="h-16 w-16 text-dark-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Vaults Created</h3>
            <p className="text-dark-400 mb-6 max-w-md mx-auto">
              Create your first inheritance vault to secure your Bitcoin legacy with complete privacy.
            </p>
            <Link to="/create-vault" className="btn-primary">
              Create Your First Vault
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault, index) => (
              <motion.div
                key={vault.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <VaultCard
                  vault={vault}
                  onProofOfLifeUpdate={() => handleProofOfLifeUpdate(vault.vaultId)}
                  updating={updatingVault === vault.vaultId}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {vaults.length > 0 && <RecentActivity />}
    </div>
  );
};

// src/pages/CreateVaultPage.tsx
import React, { useState } from 'react';
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
import { useVaults } from '@/contexts/VaultContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreateVaultRequest, PrivacyLevel } from '@/types';
import { PRIVACY_LEVELS } from '@/config';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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

export const CreateVaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { createVault } = useVaults();
  const { userSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateVaultRequest>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      vaultName: '',
      inheritanceDelay: 4320, // 30 days
      privacyLevel: PRIVACY_LEVELS.STEALTH,
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
            {watchedBitcoinAddresses.map((address, index) => (
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
            {watchedBeneficiaries.map((beneficiary, index) => (
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
                <LoadingSpinner size="sm" />
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

// src/pages/VaultDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  ShieldCheckIcon,
  EyeIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useVaults } from '@/contexts/VaultContext';
import { Vault, BitcoinBalance } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProofOfLifeCard } from '@/components/ProofOfLifeCard';
import { BeneficiariesCard } from '@/components/BeneficiariesCard';
import { BitcoinBalanceCard } from '@/components/BitcoinBalanceCard';
import { VaultActivityCard } from '@/components/VaultActivityCard';

export const VaultDetailsPage: React.FC = () => {
  const { vaultId } = useParams<{ vaultId: string }>();
  const { vaults, proofOfLifeData, updateProofOfLife } = useVaults();
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProof, setUpdatingProof] = useState(false);

  useEffect(() => {
    if (vaultId && vaults.length > 0) {
      const foundVault = vaults.find(v => v.vaultId === vaultId);
      setVault(foundVault || null);
      setLoading(false);
    }
  }, [vaultId, vaults]);

  const handleProofOfLifeUpdate = async () => {
    if (!vaultId) return;
    setUpdatingProof(true);
    await updateProofOfLife(vaultId);
    setUpdatingProof(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="text-center py-16">
        <ExclamationTriangleIcon className="h-16 w-16 text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Vault Not Found</h2>
        <p className="text-dark-400 mb-6">The vault you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const proofOfLife = proofOfLifeData[vault.vaultId];
  const privacyLevelNames = {
    1: 'Stealth Mode',
    2: 'Delayed Disclosure',
    3: 'Gradual Education',
    4: 'Full Transparency',
  };

  const statusColors = {
    active: 'text-green-400 bg-green-500/10',
    'inherit-triggered': 'text-red-400 bg-red-500/10',
    pending: 'text-yellow-400 bg-yellow-500/10',
    expired: 'text-red-400 bg-red-500/10',
    'emergency-paused': 'text-orange-400 bg-orange-500/10',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{vault.vaultName}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[vault.status]}`}>
                {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
              </span>
              <span className="text-dark-400">
                Privacy: {privacyLevelNames[vault.privacyLevel]}
              </span>
              <span className="text-dark-400">
                Created: {new Date(vault.createdAt * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <EyeIcon className="h-4 w-4" />
            <span>View Details</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <CogIcon className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proof of Life */}
          <ProofOfLifeCard
            vault={vault}
            proofOfLife={proofOfLife}
            onUpdate={handleProofOfLifeUpdate}
            updating={updatingProof}
          />
          
          {/* Bitcoin Balances */}
          <BitcoinBalanceCard vaultId={vault.vaultId} />
          
          {/* Beneficiaries */}
          <BeneficiariesCard vaultId={vault.vaultId} privacyLevel={vault.privacyLevel} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4">Vault Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-400">Inheritance Delay</span>
                <span>{Math.floor(vault.inheritanceDelay / 144)} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Grace Period</span>
                <span>{Math.floor(vault.gracePeriod / 144)} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Last Activity</span>
                <span>{Math.floor((Date.now() / 1000 - vault.lastActivity) / 86400)} days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Total BTC Value</span>
                <span>{(vault.totalBtcValue / 100000000).toFixed(8)} BTC</span>
              </div>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <VaultActivityCard vaultId={vault.vaultId} />
          
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleProofOfLifeUpdate}
                disabled={updatingProof}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {updatingProof ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ClockIcon className="h-4 w-4" />
                )}
                <span>Update Proof of Life</span>
              </button>
              
              <Link
                to={`/vault/${vault.vaultId}/edit`}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <CogIcon className="h-4 w-4" />
                <span>Edit Vault Settings</span>
              </Link>
              
              <button className="w-full btn-outline flex items-center justify-center space-x-2">
                <EyeIcon className="h-4 w-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
