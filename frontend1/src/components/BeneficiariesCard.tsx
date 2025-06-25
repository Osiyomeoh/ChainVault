import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Beneficiary, PrivacyLevel } from '@/types';
import { vaultService } from '@/services/vaultService';
import { LoadingSpinner } from './LoadingSpinner';

interface BeneficiariesCardProps {
  vaultId: string;
  privacyLevel: PrivacyLevel;
}

export const BeneficiariesCard: React.FC<BeneficiariesCardProps> = ({
  vaultId,
  privacyLevel,
}) => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const data = await vaultService.getVaultBeneficiaries(vaultId);
        setBeneficiaries(data);
      } catch (error) {
        console.error('Failed to fetch beneficiaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, [vaultId]);

  const privacyLevelNames = {
    1: 'Stealth Mode',
    2: 'Delayed Disclosure',
    3: 'Gradual Education',
    4: 'Full Transparency',
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <UserGroupIcon className="h-5 w-5" />
            <span>Beneficiaries ({beneficiaries.length})</span>
          </h3>
          <p className="text-sm text-dark-400 mt-1">
            Privacy Level: {privacyLevelNames[privacyLevel]}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary flex items-center space-x-2"
          >
            {showDetails ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          </button>
          
          <button className="btn-outline flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="text-center py-8">
          <UserGroupIcon className="h-12 w-12 text-dark-500 mx-auto mb-3" />
          <p className="text-dark-400 mb-4">No beneficiaries added yet</p>
          <button className="btn-primary">Add First Beneficiary</button>
        </div>
      ) : (
        <div className="space-y-4">
          {beneficiaries.map((beneficiary, index) => (
            <motion.div
              key={beneficiary.beneficiaryIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-dark-600 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium mb-1">
                    Beneficiary #{beneficiary.beneficiaryIndex + 1}
                  </h4>
                  <p className="text-sm text-dark-400">
                    Allocation: {beneficiary.allocationPercentage}%
                  </p>
                  {showDetails && (
                    <div className="mt-3 space-y-2 text-sm">
                      <p>
                        <span className="text-dark-400">Address:</span>{' '}
                        {beneficiary.beneficiaryAddress.slice(0, 8)}...{beneficiary.beneficiaryAddress.slice(-6)}
                      </p>
                      {beneficiary.allocationConditions && (
                        <p>
                          <span className="text-dark-400">Conditions:</span>{' '}
                          {beneficiary.allocationConditions}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {beneficiary.allocationPercentage}%
                  </div>
                  <div className="text-xs text-dark-400">
                    of inheritance
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {privacyLevel === 1 && (
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <EyeSlashIcon className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Stealth Mode Active</span>
          </div>
          <p className="text-xs text-purple-300">
            Beneficiaries will only learn about their inheritance when it's triggered.
            All details remain encrypted until that time.
          </p>
        </div>
      )}
    </motion.div>
  );
};