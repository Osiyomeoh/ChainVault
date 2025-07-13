import { motion } from 'framer-motion';
import {
  ClockIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface VaultActivityCardProps {
  vaultId: string;
}

export const VaultActivityCard = ({ vaultId: _vaultId }: VaultActivityCardProps) => {
  // Mock activity data - in real app, this would be fetched from API
  const activities = [
    {
      id: '1',
      type: 'proof-of-life',
      description: 'Proof of life updated',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: ClockIcon,
      color: 'text-green-400',
    },
    {
      id: '2',
      type: 'vault-created',
      description: 'Vault created',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: ShieldCheckIcon,
      color: 'text-bitcoin-400',
    },
    {
      id: '3',
      type: 'beneficiary-added',
      description: 'Beneficiary added',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: UserPlusIcon,
      color: 'text-blue-400',
    },
    {
      id: '4',
      type: 'balance-updated',
      description: 'Bitcoin balance refreshed',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      icon: CurrencyDollarIcon,
      color: 'text-purple-400',
    },
  ];

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
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 p-2 hover:bg-dark-700/50 rounded-lg transition-colors"
          >
            <activity.icon className={`h-4 w-4 ${activity.color}`} />
            <div className="flex-1">
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-dark-400">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};