import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <div className="flex">
        {isSignedIn && <Sidebar />}
        <main className={`flex-1 ${isSignedIn ? 'ml-64' : ''}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};