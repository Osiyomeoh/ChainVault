import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { User, NetworkConfig } from '@/types';

interface AuthContextType {
  user: User | null;
  userSession: UserSession;
  network: StacksTestnet | StacksMainnet;
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const userSession = new UserSession({ appConfig });
  const network = import.meta.env.VITE_STACKS_NETWORK === 'mainnet' 
    ? new StacksMainnet() 
    : new StacksTestnet();

  const isSignedIn = userSession.isUserSignedIn();

  useEffect(() => {
    const initAuth = async () => {
      if (userSession.isSignInPending()) {
        try {
          const userData = await userSession.handlePendingSignIn();
          const userProfile = userData.profile;
          
          const user: User = {
            id: userData.identityAddress,
            stacksAddress: userData.identityAddress,
            email: userProfile?.email,
            createdAt: new Date().toISOString(),
            isVerified: true,
          };
          
          setUser(user);
        } catch (error) {
          console.error('Sign in error:', error);
        }
      } else if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        const userProfile = userData.profile;
        
        const user: User = {
          id: userData.identityAddress,
          stacksAddress: userData.identityAddress,
          email: userProfile?.email,
          createdAt: new Date().toISOString(),
          isVerified: true,
        };
        
        setUser(user);
      }
      
      setLoading(false);
    };

    initAuth();
  }, [userSession]);

  const signIn = () => {
    showConnect({
      appDetails: {
        name: 'ChainVault',
        icon: '/chainvault-logo.svg',
      },
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  };

  const signOut = () => {
    userSession.signUserOut();
    setUser(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{
      user,
      userSession,
      network,
      isSignedIn,
      signIn,
      signOut,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};