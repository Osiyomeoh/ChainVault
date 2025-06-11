import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  UserCircleIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    proofOfLifeReminders: true,
    securityAlerts: true,
    twoFactorAuth: false,
    autoBackup: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-dark-300 mt-2">
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { id: 'profile', name: 'Profile', icon: UserCircleIcon },
              { id: 'security', name: 'Security', icon: ShieldCheckIcon },
              { id: 'notifications', name: 'Notifications', icon: BellIcon },
              { id: 'privacy', name: 'Privacy', icon: KeyIcon },
              { id: 'advanced', name: 'Advanced', icon: CogIcon },
            ].map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-dark-700 rounded-lg transition-colors"
              >
                <item.icon className="h-5 w-5 text-dark-400" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stacks Address</label>
                <input
                  type="text"
                  value={user?.stacksAddress || ''}
                  disabled
                  className="input-field w-full bg-dark-700 text-dark-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input-field w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                {
                  key: 'emailNotifications',
                  title: 'Email Notifications',
                  description: 'Receive important updates via email',
                },
                {
                  key: 'proofOfLifeReminders',
                  title: 'Proof of Life Reminders',
                  description: 'Get reminded before your proof of life expires',
                },
                {
                  key: 'securityAlerts',
                  title: 'Security Alerts',
                  description: 'Immediate alerts for security-related events',
                },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{setting.title}</h3>
                    <p className="text-sm text-dark-400">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange(setting.key, !settings[setting.key as keyof typeof settings])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings[setting.key as keyof typeof settings] ? 'bg-bitcoin-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-6">Security & Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-dark-400">Add an extra layer of security</p>
                </div>
                <button className="btn-outline">
                  {settings.twoFactorAuth ? 'Disable' : 'Enable'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Automatic Backup</h3>
                  <p className="text-sm text-dark-400">Automatically backup encrypted vault data</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoBackup', !settings.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoBackup ? 'bg-bitcoin-500' : 'bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card border-red-500/20"
          >
            <div className="flex items-center space-x-2 mb-6">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Export Vault Data</h3>
                  <p className="text-sm text-dark-400">Download all your vault data for backup</p>
                </div>
                <button className="btn-outline text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-dark-900">
                  Export Data
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-dark-400">Permanently delete your account and all data</p>
                </div>
                <button className="btn-outline text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="btn-primary flex items-center space-x-2 px-6"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};