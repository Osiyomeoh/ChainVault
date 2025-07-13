import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { VaultProvider } from '@/contexts/VaultContext';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CreateVaultPage } from '@/pages/CreateVaultPage';
import { VaultDetailsPage } from '@/pages/VaultDetailsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <AuthProvider>
        <VaultProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-vault"
                  element={
                    <ProtectedRoute>
                      <CreateVaultPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vault/:vaultId"
                  element={
                    <ProtectedRoute>
                      <VaultDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </Router>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#f97316',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </VaultProvider>
      </AuthProvider>
    </div>
  );
}

export default App;