import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'proof-of-life' | 'vault-created' | 'beneficiary-added' | 'settings-updated';
  description: string;
  timestamp: Date;
  vaultName?: string;
}

export const RecentActivity: React.FC = () => {
  // Mock data - in real app, this would come from API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'proof-of-life',
      description: 'Proof of life updated',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      vaultName: 'Family Bitcoin Legacy',
    },
    {
      id: '2',
      type: 'vault-created',
      description: 'New vault created',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      vaultName: 'Emergency Fund',
    },
    {
      id: '3',
      type: 'beneficiary-added',
      description: 'Beneficiary added',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      vaultName: 'Family Bitcoin Legacy',
    },
    {
      id: '4',
      type: 'settings-updated',
      description: 'Privacy settings updated',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'proof-of-life':
        return ClockIcon;
      case 'vault-created':
        return ShieldCheckIcon;
      case 'beneficiary-added':
        return UserPlusIcon;
      case 'settings-updated':
        return CogIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'proof-of-life':
        return 'text-green-400 bg-green-500/10';
      case 'vault-created':
        return 'text-bitcoin-400 bg-bitcoin-500/10';
      case 'beneficiary-added':
        return 'text-blue-400 bg-blue-500/10';
      case 'settings-updated':
        return 'text-purple-400 bg-purple-500/10';
      default:
        return 'text-dark-400 bg-dark-500/10';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClasses = getActivityColor(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 hover:bg-dark-700/50 rounded-lg transition-colors"
            >
              <div className={`p-2 rounded-lg ${colorClasses}`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                {activity.vaultName && (
                  <p className="text-xs text-dark-400">{activity.vaultName}</p>
                )}
              </div>
              
              <span className="text-xs text-dark-400">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};