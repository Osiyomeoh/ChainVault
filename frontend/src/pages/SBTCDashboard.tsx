import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useSBTCVaults } from '../contexts/SBTCVaultContext';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { SBTCVault } from '../types';

// Dashboard Section Components
import { OverviewSection } from '../components/dashboard/OverviewSection';
import { VaultsSection } from '../components/dashboard/VaultsSection';
import { BeneficiariesSection } from '../components/dashboard/BeneficiariesSection';
import { TimelineSection } from '../components/dashboard/TimelineSection';
import { TransactionsSection } from '../components/dashboard/TransactionsSection';
import { DocumentsSection } from '../components/dashboard/DocumentsSection';

const LoadingSpinner = ({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-bitcoin-500 ${sizeClasses[size]} ${className}`} />
  );
};

export function SBTCDashboard() {
  const { isSignedIn, user } = useAuth();
  const { activeSection } = useDashboard();
  const {
    vaults,
    stats,
    loading,
  } = useSBTCVaults();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your vaults...</p>
        </div>
      </div>
    );
  }

  // Show empty state for new users
  if (!vaults || vaults.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-bitcoin-100 dark:bg-bitcoin-900 mb-6">
              <ShieldCheckIcon className="h-12 w-12 text-bitcoin-600 dark:text-bitcoin-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to ChainVault
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              You haven't created any inheritance vaults yet. Start securing your family's Bitcoin future by creating your first vault.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-vault"
                className="inline-flex items-center justify-center px-6 py-3 bg-bitcoin-600 hover:bg-bitcoin-700 text-white font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Vault
              </Link>
              <button
                onClick={() => window.open('https://docs.chainvault.io', '_blank')}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
              >
                Learn More
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-dark-700">
                <div className="text-2xl font-bold text-bitcoin-600 dark:text-bitcoin-400">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vaults Created</div>
              </div>
              <div className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-dark-700">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">0.0000</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">sBTC Locked</div>
              </div>
              <div className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-dark-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">∞</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Security Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection vaults={vaults} stats={stats} />;
      case 'vaults':
        return <VaultsSection vaults={vaults} />;
      case 'beneficiaries':
        return <BeneficiariesSection vaults={vaults} />;
      case 'timeline':
        return <TimelineSection vaults={vaults} />;
      case 'transactions':
        return <TransactionsSection vaults={vaults} />;
      case 'documents':
        return <DocumentsSection vaults={vaults} />;
      default:
        return <OverviewSection vaults={vaults} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {activeSection === 'overview' && 'Dashboard Overview'}
            {activeSection === 'vaults' && 'My Vaults'}
            {activeSection === 'beneficiaries' && 'Beneficiaries'}
            {activeSection === 'timeline' && 'Inheritance Timeline'}
            {activeSection === 'transactions' && 'Transaction History'}
            {activeSection === 'documents' && 'Documents & Metadata'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {activeSection === 'overview' && 'Monitor your inheritance vaults and overall portfolio'}
            {activeSection === 'vaults' && 'Manage your sBTC inheritance vaults'}
            {activeSection === 'beneficiaries' && 'View and manage inheritance recipients'}
            {activeSection === 'timeline' && 'Track inheritance deadlines and proof of life'}
            {activeSection === 'transactions' && 'Monitor sBTC movements and distributions'}
            {activeSection === 'documents' && 'Access vault documents and metadata'}
          </p>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}