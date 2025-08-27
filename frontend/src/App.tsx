import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { SBTCVaultProvider } from './contexts/SBTCVaultContext';

// Layout Components
import { Layout } from './components/Layout';

// Page Components
import { LandingPage } from './pages/LandingPage';
import { LaunchAppPage } from './pages/LaunchAppPage';
import { SBTCDashboard } from './pages/SBTCDashboard';
import { CreateVaultPage } from './pages/CreateVaultPage';
import { VaultDetailsPage } from './pages/VaultDetailsPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <Navigate to="/launch-app" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <SBTCVaultProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/launch-app" element={<LaunchAppPage />} />
                
                {/* Protected Routes - Require Wallet Connection */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Navigate to="/sbtc-dashboard" replace />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/sbtc-dashboard" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SBTCDashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/create-vault" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CreateVaultPage />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/vault/:vaultId" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <VaultDetailsPage />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback Routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </SBTCVaultProvider>
      </DashboardProvider>
    </AuthProvider>
  );
}

export default App;