import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface User {
  id: string;
  auth0Id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  language: string;
}

interface AuthContextType {
  user: any; // Auth0 user
  dbUser: User | null; // Database user
  isLoading: boolean;
  error?: string;
  loginWithRedirect: (options?: any) => void;
  logout: (options?: any) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, error, isLoading: auth0Loading, loginWithRedirect, logout: auth0Logout, isAuthenticated } = useAuth0();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync user with database (temporarily disabled for demo)
  useEffect(() => {
    const syncUserData = async () => {
      if (user) {
        try {
          // Temporary: Create mock user for demo without DB sync
          const mockDbUser = {
            id: '1',
            auth0Id: user.sub || '',
            email: user.email || '',
            name: user.name || 'User',
            avatar: user.picture,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            language: 'en'
          };
          setDbUser(mockDbUser);
          console.log('Demo mode: Using mock user data');
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      } else {
        setDbUser(null);
      }
      setIsLoading(false);
    };

    if (!auth0Loading) {
      syncUserData();
    }
  }, [user, auth0Loading]);

  const logout = (options?: any) => {
    auth0Logout({
      logoutParams: {
        returnTo: `${window.location.origin}/login`
      },
      ...options
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      dbUser,
      isLoading: isLoading || auth0Loading,
      error: error?.message,
      loginWithRedirect,
      logout,
      isAuthenticated
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