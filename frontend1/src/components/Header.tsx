import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ConnectWallet } from './ConnectWallet';

export const Header = () => {
  const { isSignedIn, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="bg-dark-800 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-8 w-8 text-bitcoin-500" />
              <span className="text-xl font-bold text-gradient">ChainVault</span>
            </Link>
            
            {isSignedIn && (
              <nav className="hidden md:flex space-x-6 ml-8">
                <Link
                  to="/dashboard"
                  className="text-dark-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-vault"
                  className="text-dark-300 hover:text-white transition-colors"
                >
                  Create Vault
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <UserCircleIcon className="h-6 w-6 text-dark-400" />
                  <span className="text-sm text-dark-300">
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
          </div>
        </div>
      </div>
    </header>
  );
};