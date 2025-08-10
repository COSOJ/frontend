import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserExtendedData {
  role: 'admin' | 'user';
  permissions: string[];
  lastLogin: string;
  department: string;
  avatar: string | null;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  getUserExtendedData: () => UserExtendedData | null;
  isLoggedIn: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication token on mount
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fake admin login validation
      if (email === 'admin@adminmail.com' && password === 'admin12345admin') {
        const adminUser: User = {
          id: 'admin-001',
          email: 'admin@adminmail.com',
          name: 'Administrator',
        };
        
        // Store auth data with admin token
        localStorage.setItem('authToken', 'admin-jwt-token-12345');
        localStorage.setItem('userData', JSON.stringify(adminUser));
        
        // Store additional admin mock data
        const adminMockData = {
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'manage_users'],
          lastLogin: new Date().toISOString(),
          department: 'IT Administration',
          avatar: null,
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: true,
          },
        };
        localStorage.setItem('adminData', JSON.stringify(adminMockData));
        
        setUser(adminUser);
        setIsLoading(false);
        return true;
      } else {
        // Invalid credentials
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Prevent signup with admin email
      if (email === 'admin@adminmail.com') {
        setIsLoading(false);
        return false; // This email is reserved
      }
      
      // Mock validation for regular users
      if (email && password.length >= 6 && name) {
        const mockUser: User = {
          id: Date.now().toString(),
          email,
          name,
        };
        
        // Store auth data for regular user
        localStorage.setItem('authToken', 'user-jwt-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(mockUser));
        
        // Store regular user mock data
        const userMockData = {
          role: 'user',
          permissions: ['read'],
          lastLogin: new Date().toISOString(),
          department: 'General',
          avatar: null,
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: true,
          },
        };
        localStorage.setItem('userData_extended', JSON.stringify(userMockData));
        
        setUser(mockUser);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('adminData');
    localStorage.removeItem('userData_extended');
    setUser(null);
  };

  const getUserExtendedData = (): UserExtendedData | null => {
    if (!user) return null;
    
    try {
      // Check if user is admin
      if (user.email === 'admin@adminmail.com') {
        const adminData = localStorage.getItem('adminData');
        return adminData ? JSON.parse(adminData) : null;
      } else {
        const userData = localStorage.getItem('userData_extended');
        return userData ? JSON.parse(userData) : null;
      }
    } catch (error) {
      console.error('Error parsing extended user data:', error);
      return null;
    }
  };

  const isLoggedIn = () => {
    return !!localStorage.getItem('authToken') && !!localStorage.getItem('userData');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    getUserExtendedData,
    isLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
