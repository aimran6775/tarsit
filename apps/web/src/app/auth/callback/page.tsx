'use client';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Get API base URL - handle both relative and absolute URLs
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl || envUrl === '/api') {
    return '/api';
  }
  // If it's an absolute URL, ensure it ends with /api
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const syncWithBackend = async (session: {
    user: {
      id: string;
      email?: string;
      user_metadata?: { full_name?: string; name?: string; avatar_url?: string };
    };
  }) => {
    const apiBase = getApiBaseUrl();
    const response = await fetch(`${apiBase}/auth/oauth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        supabaseUserId: session.user.id,
        email: session.user.email,
        fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        avatarUrl: session.user.user_metadata?.avatar_url,
        provider: 'google',
      }),
    });

    if (response.ok) {
      const userData = await response.json();
      // Store our backend tokens (use camelCase to match API client)
      if (userData.accessToken) {
        localStorage.setItem('accessToken', userData.accessToken);
      }
      if (userData.refreshToken) {
        localStorage.setItem('refreshToken', userData.refreshToken);
      }
      return true;
    } else {
      const errorText = await response.text();
      console.error('Backend sync failed:', errorText);
      throw new Error('Failed to sync with backend: ' + errorText);
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          return;
        }

        if (code) {
          // Exchange the code for a session
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

          if (sessionError) {
            console.error('Session error:', sessionError);
            setError(sessionError.message);
            return;
          }

          if (data.session) {
            try {
              await syncWithBackend(data.session);

              // Small delay to ensure localStorage is synced before refreshUser
              await new Promise((resolve) => setTimeout(resolve, 100));

              // Refresh user context
              await refreshUser();

              // Redirect to home
              router.push('/');
              return;
            } catch (backendError) {
              console.error('Backend sync error:', backendError);
              setError(
                backendError instanceof Error
                  ? backendError.message
                  : 'Failed to connect to backend'
              );
              return;
            }
          }
        } else {
          // No code, try to get session from URL hash (implicit flow)
          const {
            data: { session },
            error: hashError,
          } = await supabase.auth.getSession();

          if (hashError) {
            setError(hashError.message);
            return;
          }

          if (session) {
            // Also sync with backend for implicit flow
            try {
              await syncWithBackend(session);
              await new Promise((resolve) => setTimeout(resolve, 100));
              await refreshUser();
              router.push('/');
            } catch (backendError) {
              console.error('Backend sync error:', backendError);
              setError(
                backendError instanceof Error
                  ? backendError.message
                  : 'Failed to connect to backend'
              );
            }
          } else {
            setError('No authentication code found');
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <h1 className="text-xl font-semibold text-white mb-2">Completing sign in...</h1>
        <p className="text-gray-400">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}
