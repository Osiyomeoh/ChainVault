import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { SBTCVault } from '../../types';

interface DocumentsSectionProps {
  vaults: SBTCVault[];
}

export function DocumentsSection({ vaults }: DocumentsSectionProps) {
  return (
    <div className="text-center py-12">
      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Documents & Metadata</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Access vault documents and encrypted metadata
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        Coming soon - This section will show all vault documents
      </p>
    </div>
  );
}
