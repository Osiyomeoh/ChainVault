import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  PlusIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useVaults } from '@/contexts/VaultContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Create Vault', href: '/create-vault', icon: PlusIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { vaults } = useVaults();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-700 pt-16">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-bitcoin-500/10 text-bitcoin-400 border-r-2 border-bitcoin-500'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-bitcoin-400' : 'text-dark-400 group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-dark-700">
          <div className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-3">
            Your Vaults ({vaults.length})
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {vaults.slice(0, 5).map((vault) => (
              <Link
                key={vault.id}
                to={`/vault/${vault.vaultId}`}
                className="block px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors truncate"
              >
                {vault.vaultName}
              </Link>
            ))}
            {vaults.length > 5 && (
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-xs text-dark-400 hover:text-dark-300 transition-colors"
              >
                View all {vaults.length} vaults →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};