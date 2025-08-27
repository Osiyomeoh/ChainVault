import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [language, setLanguage] = useState('en');

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark mode to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6"
            >
              <div className="flex items-center mb-4">
                <SunIcon className="h-6 w-6 text-yellow-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin-500 focus:ring-offset-2 ${
                      darkMode ? 'bg-bitcoin-600' : 'bg-gray-200 dark:bg-dark-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6"
            >
              <div className="flex items-center mb-4">
                <BellIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive updates about your vaults
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin-500 focus:ring-offset-2 ${
                      notifications ? 'bg-bitcoin-600' : 'bg-gray-200 dark:bg-dark-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6"
            >
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auto-Lock</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically lock vaults after inactivity
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoLock(!autoLock)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin-500 focus:ring-offset-2 ${
                      autoLock ? 'bg-bitcoin-600' : 'bg-gray-200 dark:bg-dark-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoLock ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Language */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6"
            >
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="h-6 w-6 text-purple-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Language</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-bitcoin-500 focus:border-bitcoin-500 dark:bg-dark-700 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6"
            >
              <div className="flex items-center mb-4">
                <UserCircleIcon className="h-6 w-6 text-gray-500 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-bitcoin-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.stacksAddress ? user.stacksAddress.slice(2, 4).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.stacksAddress ? formatAddress(user.stacksAddress) : 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Connected Wallet</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6"
            >
              <div className="flex items-center mb-4">
                <CogIcon className="h-6 w-6 text-gray-500 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors">
                  Export Vault Data
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors">
                  Backup Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors">
                  View Activity Log
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
