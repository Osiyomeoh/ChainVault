import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Vault } from '@/types';

interface StatsOverviewProps {
  vaults: Vault[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ vaults }) => {
  const totalVaults = vaults.length;
  const activeVaults = vaults.filter(v => v.status === 'active').length;
  const totalBtcValue = vaults.reduce((sum, v) => sum + v.totalBtcValue, 0) / 100000000;
  const needingAttention = vaults.filter(v => {
    const daysSinceLastActivity = Math.floor((Date.now() / 1000 - v.lastActivity) / 86400);
    const inheritanceDelayDays = Math.floor(v.inheritanceDelay / 144);
    return daysSinceLastActivity > inheritanceDelayDays * 0.8;
  }).length;

  const stats = [
    {
      label: 'Total Vaults',
      value: totalVaults,
      icon: ShieldCheckIcon,
      color: 'text-bitcoin-400',
      bgColor: 'bg-bitcoin-500/10',
    },
    {
      label: 'Active Vaults',
      value: activeVaults,
      icon: ClockIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total BTC Value',
      value: `${totalBtcValue.toFixed(4)} BTC`,
      icon: CurrencyDollarIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Needs Attention',
      value: needingAttention,
      icon: ExclamationTriangleIcon,
      color: needingAttention > 0 ? 'text-yellow-400' : 'text-green-400',
      bgColor: needingAttention > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="card"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-dark-400">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};