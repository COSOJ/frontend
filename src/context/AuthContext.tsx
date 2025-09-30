import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface User {
  _id: string;
  handle: string;
  email: string;
  roles: Array<'superadmin' | 'admin' | 'user' | 'spectetor'>;
  rating: number;
  ratingHistory: number[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
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
  signup: (email: string, password: string, handle: string) => Promise<boolean>;
  logout: () => void;
  getUserExtendedData: () => UserExtendedData | null;
  isLoggedIn: boolean;
  isNotLoggedIn: boolean;
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

const API_BASE = 'http://localhost:3000';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount, try to refresh token and fetch user info
    const tryRestoreSession = async () => {
      setIsLoading(true);
      let token = localStorage.getItem('authToken');
      let userData = localStorage.getItem('userData');

      // If no token, try to refresh
      if (!token) {
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.accessToken) {
              token = refreshData.accessToken;
              if (token) {
                localStorage.setItem('authToken', token);
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }

      // If we have a token, fetch user info
      if (token) {
        try {
          const meRes = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });
          if (meRes.ok) {
            const user = await meRes.json();
            setUser(user);
            localStorage.setItem('userData', JSON.stringify(user));
          } else {
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    tryRestoreSession();
  }, []);
  // Optionally, expose a method to refresh token manually
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken) {
          localStorage.setItem('authToken', refreshData.accessToken);
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // send cookies for refresh token
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setIsLoading(false);
        return false;
      }
      const data = await response.json();
      if (data.accessToken && data.user) {
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, handle: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, handle }),
      });
      if (!response.ok) {
        setIsLoading(false);
        return false;
      }
      const data = await response.json();
      if (data.accessToken && data.user) {
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
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
    setUser(null);
    // Optionally, call a logout endpoint to clear refresh token cookie
    fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  };

  // Optionally, fetch extended user data from backend if available
  const getUserExtendedData = (): UserExtendedData | null => {
    // Not implemented: should fetch from backend if needed
    return null;
  };

  const isLoggedIn = useMemo(() => {
    return user !== null;
  }, [user]);

  const isNotLoggedIn = useMemo(() => !isLoggedIn, [isLoggedIn]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    getUserExtendedData,
    isLoggedIn,
    isNotLoggedIn,
    // Optionally, you can add refreshToken to context value if needed
    // refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
