import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { User, NewUser } from '../lib/schema';

interface AuthContextType {
  user: any; // Auth0 user
  dbUser: User | null; // Database user
  isLoading: boolean;
  error?: string;
  loginWithRedirect: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, error, isLoading: auth0Loading } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync user with database
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          const response = await fetch('/api/user/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              auth0Id: user.sub,
              email: user.email,
              name: user.name,
              avatar: user.picture,
            }),
          });

          if (response.ok) {
            const userData = await response.json();
            setDbUser(userData);
          }
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      } else {
        setDbUser(null);
      }
      setIsLoading(false);
    };

    if (!auth0Loading) {
      syncUser();
    }
  }, [user, auth0Loading]);

  const loginWithRedirect = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <AuthContext.Provider value={{
      user,
      dbUser,
      isLoading: isLoading || auth0Loading,
      error,
      loginWithRedirect,
      logout
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