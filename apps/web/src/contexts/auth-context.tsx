'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, User, LoginData, SignupData, SignupBusinessData, BusinessAuthResponse } from '@/lib/api/auth.api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  signupBusiness: (data: SignupBusinessData) => Promise<BusinessAuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        // Fetch current user (apiClient will automatically use the token from localStorage)
        const currentUser = await authApi.me();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    const response = await authApi.login(data);
    
    // Store tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    // Update state
    setUser(response.user);
  };

  const signup = async (data: SignupData) => {
    const response = await authApi.signup(data);
    
    // Store tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    // Update state
    setUser(response.user);
  };

  const signupBusiness = async (data: SignupBusinessData): Promise<BusinessAuthResponse> => {
    const response = await authApi.signupBusiness(data);
    
    // Store tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    // Update state
    setUser(response.user);
    
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear state and storage regardless of API response
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    signupBusiness,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
