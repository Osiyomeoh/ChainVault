import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheckIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { ConnectWallet } from './ConnectWallet';

export const Header: React.FC = () => {
  const { isSignedIn, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-dark-800/95 backdrop-blur-sm border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-8 w-8 text-bitcoin-500" />
              <span className="text-xl font-bold text-gradient">ChainVault</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isSignedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className={`transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-bitcoin-400 font-medium' 
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-vault"
                  className={`transition-colors ${
                    isActive('/create-vault') 
                      ? 'text-bitcoin-400 font-medium' 
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Create Vault
                </Link>
                <Link
                  to="/settings"
                  className={`transition-colors ${
                    isActive('/settings') 
                      ? 'text-bitcoin-400 font-medium' 
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <a href="#features" className="text-dark-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-dark-300 hover:text-white transition-colors">
                  How it Works
                </a>
                <a href="#pricing" className="text-dark-300 hover:text-white transition-colors">
                  Pricing
                </a>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <UserCircleIcon className="h-6 w-6 text-dark-400" />
                  <span className="text-sm text-dark-300 hidden sm:block">
                    {user?.stacksAddress.slice(0, 6)}...{user?.stacksAddress.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn-secondary text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <ConnectWallet />
            )}
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 hover:bg-dark-700 rounded-lg">
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};