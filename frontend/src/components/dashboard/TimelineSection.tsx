import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { SBTCVault } from '../../types';

interface TimelineSectionProps {
  vaults: SBTCVault[];
}

export function TimelineSection({ vaults }: TimelineSectionProps) {
  return (
    <div className="text-center py-12">
      <ClockIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Inheritance Timeline</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Track inheritance deadlines and proof of life requirements
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        Coming soon - This section will show timeline for all vaults
      </p>
    </div>
  );
}
