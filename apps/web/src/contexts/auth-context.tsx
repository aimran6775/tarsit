'use client';

import {
  authApi,
  BusinessAuthResponse,
  LoginData,
  SignupBusinessData,
  SignupData,
  User,
} from '@/lib/api/auth.api';
import { supabase } from '@/lib/supabase';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        localStorage.setItem('accessToken', session.access_token);
        refreshUser();
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        localStorage.setItem('accessToken', session.access_token);
        if (!user) {
          await refreshUser();
        }
      } else {
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (data: LoginData) => {
    if (!data.email && !data.username) {
      throw new Error('Email or Username is required for login');
    }

    // Try backend login first (supports username & local password)
    try {
      const response = await authApi.login(data);
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
        return;
      }
    } catch (err) {
      // Fallback to Supabase direct login if backend fails (only works for email)
      if (data.email) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
      } else {
        throw err;
      }
    }
  };

  const signup = async (data: SignupData) => {
    const response = await authApi.signup(data);

    if (response.session) {
      const { error } = await supabase.auth.setSession(response.session);
      if (error) throw error;
    } else {
      await login({ email: data.email, password: data.password });
    }
  };

  const signupBusiness = async (data: SignupBusinessData): Promise<BusinessAuthResponse> => {
    const response = await authApi.signupBusiness(data);

    if (response.session) {
      const { error } = await supabase.auth.setSession(response.session);
      if (error) throw error;
    } else {
      await login({ email: data.email, password: data.password });
    }

    return response;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
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
