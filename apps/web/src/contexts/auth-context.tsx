'use client';

import {
    authApi,
    BusinessAuthResponse,
    LoginData,
    SignupBusinessData,
    SignupData,
    User,
} from '@/lib/api/auth.api';
import { isHttpError } from '@/lib/api/client';
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
        if (session.refresh_token) {
          localStorage.setItem('refreshToken', session.refresh_token);
        }
        refreshUser();
      } else {
        // Try to restore session from stored refresh token
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          supabase.auth.refreshSession({ refresh_token: storedRefreshToken }).then(({ data, error }) => {
            if (data.session && !error) {
              localStorage.setItem('accessToken', data.session.access_token);
              if (data.session.refresh_token) {
                localStorage.setItem('refreshToken', data.session.refresh_token);
              }
              refreshUser();
            } else {
              setIsLoading(false);
            }
          });
        } else {
          setIsLoading(false);
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        localStorage.setItem('accessToken', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('refreshToken', session.refresh_token);
        }
        if (!user || event === 'TOKEN_REFRESHED') {
          await refreshUser();
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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
    localStorage.removeItem('refreshToken');
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If 401 (Unauthorized) or 403 (Forbidden), clear the stale session
      // This handles cases where the local DB was wiped but the browser has a token
      if (isHttpError(error, 401) || isHttpError(error, 403)) {
        await logout();
      } else {
        setUser(null);
      }
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
