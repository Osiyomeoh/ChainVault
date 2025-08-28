import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateVaultForm } from '../components/CreateVaultForm';
import { toast } from 'react-hot-toast';

export function CreateVaultPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);

  const handleVaultCreated = (vaultId: string) => {
    toast.success(`Vault "${vaultId}" created successfully! Redirecting to dashboard...`);
    
    // Force a page refresh to ensure the new vault data is loaded
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000); // Give user 2 seconds to see the success message
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Vault Creation Complete!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Your sBTC inheritance vault has been created successfully.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-bitcoin-600 hover:bg-bitcoin-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-bitcoin-500 transition-colors"
            >
              Create Another Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create sBTC Inheritance Vault
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Set up a programmable Bitcoin inheritance vault using sBTC on Stacks
          </p>
        </div>

        <CreateVaultForm
          onSuccess={handleVaultCreated}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}