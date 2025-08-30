import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  HomeIcon,
  PlusIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function Sidebar({ isOpen, onClose, onOpen }: SidebarProps) {
  const { isSignedIn, user } = useAuth();
  const { activeSection, setActiveSection } = useDashboard();
  const { t } = useLanguage();
  const location = useLocation();
  
  // Touch gesture handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && isOpen) {
      onClose();
    } else if (isRightSwipe && !isOpen) {
      onOpen();
    }
  };

  console.log('Sidebar render:', { isSignedIn, isOpen, location: location.pathname });

  const navigation = [
    { 
      name: t('dashboard'), 
      href: '/sbtc-dashboard', 
      icon: HomeIcon,
      section: 'dashboard'
    },
    { 
      name: t('createVault'), 
      href: '/create-vault', 
      icon: PlusIcon,
      section: 'create'
    },
    { 
      name: t('settings'), 
      href: '/settings', 
      icon: CogIcon,
      section: 'settings'
    },
  ];

  const dashboardSections = [
    {
      name: t('overview'),
      icon: ChartBarIcon,
      section: 'overview',
      description: t('monitorVaults')
    },
    {
      name: t('vaults'),
      icon: ShieldCheckIcon,
      section: 'vaults',
      description: t('manageVaults')
    },
    {
      name: t('beneficiaries'),
      icon: UserGroupIcon,
      section: 'beneficiaries',
      description: t('viewBeneficiaries')
    },
    {
      name: t('timeline'),
      icon: ClockIcon,
      section: 'timeline',
      description: t('trackTimeline')
    },
    {
      name: t('transactions'),
      icon: CurrencyDollarIcon,
      section: 'transactions',
      description: t('monitorTransactions')
    },
    {
      name: t('documents'),
      icon: DocumentTextIcon,
      section: 'documents',
      description: t('accessDocuments')
    }
  ];

  const isActivePage = (href: string) => {
    return location.pathname === href;
  };

  const isActiveSection = (section: string) => {
    return activeSection === section;
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      {/* Floating Mobile Menu Button */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 sm:p-3 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-72 sm:w-80 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 lg:block fixed inset-y-0 left-0 z-50 lg:static transition-transform duration-300 ease-in-out`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Mobile Menu */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-dark-700">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-bitcoin-600 p-1.5 sm:p-2 rounded-lg">
                <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">ChainVault</span>
                <span className="ml-1 sm:ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  sBTC
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-2">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                Navigation
              </h3>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActivePage(item.href)
                      ? 'bg-bitcoin-100 dark:bg-bitcoin-900 text-bitcoin-700 dark:text-bitcoin-300'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                  onClick={() => onClose()}
                >
                  <item.icon className="mr-2 sm:mr-3 h-5 w-5" />
                  <span className="text-sm sm:text-base">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Dashboard Sections */}
            {location.pathname === '/sbtc-dashboard' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                  Dashboard Sections
                </h3>
                <div className="space-y-1">
                  {dashboardSections.map((section) => (
                    <button
                      key={section.section}
                      onClick={() => setActiveSection(section.section)}
                      className={`w-full flex items-start px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                        isActiveSection(section.section)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      <section.icon className="mr-2 sm:mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm sm:text-base">{section.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {section.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Info */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-bitcoin-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {user?.address ? user.address.slice(2, 4).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
