import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

interface User {
  stacksAddress: string;
  appPrivateKey: string;
  profile?: any;
}

interface AuthContextType {
  isSignedIn: boolean;
  user: User | null;
  userSession: UserSession;
  signIn: () => void;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userSession] = useState(new UserSession({ appConfig }));
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(() => {
        updateAuthState();
      });
    } else {
      updateAuthState();
    }

    // Add periodic check for auth state changes
    const interval = setInterval(() => {
      const currentSignedIn = userSession.isUserSignedIn();
      if (currentSignedIn !== isSignedIn) {
        console.log('Auth state changed, updating...');
        updateAuthState();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [userSession, isSignedIn]);

  const updateAuthState = () => {
    try {
      const signedIn = userSession.isUserSignedIn();
      console.log('Auth state update - signedIn:', signedIn);
      
      setIsSignedIn(signedIn);
      
      if (signedIn) {
        const userData = userSession.loadUserData();
        console.log('User data loaded:', userData);
        
        const stacksAddress = userData.profile?.stxAddress?.testnet || 
                             userData.profile?.stxAddress?.mainnet || 
                             userData.profile?.stxAddress || '';
        
        const userInfo = {
          stacksAddress,
          appPrivateKey: userData.appPrivateKey || '',
          profile: userData.profile
        };
        
        console.log('Setting user info:', userInfo);
        setUser(userInfo);
      } else {
        console.log('User not signed in, clearing user data');
        setUser(null);
      }
    } catch (error) {
      console.error('Error updating auth state:', error);
      setIsSignedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = () => {
    console.log('Starting sign in process...');
    showConnect({
      appDetails: {
        name: 'ChainVault',
        icon: '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: (payload) => {
        console.log('Sign in finished, payload:', payload);
        // Add a small delay to ensure the session is properly updated
        setTimeout(() => {
          updateAuthState();
        }, 100);
      },
      onCancel: (error) => {
        console.log('Sign in cancelled:', error);
        setLoading(false);
      },
      userSession,
    });
  };

  const signOut = () => {
    userSession.signUserOut();
    setIsSignedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isSignedIn,
      user,
      userSession,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}