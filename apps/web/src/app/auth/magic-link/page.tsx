'use client';

import { authApi } from '@/lib/api/auth.api';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function MagicLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const redirect = searchParams.get('redirect');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyMagicLink() {
      if (!token) {
        setStatus('error');
        setError('No magic link token provided');
        return;
      }

      try {
        const response = await authApi.verifyMagicLink(token);
        
        // Store tokens - this is what the app uses for auth
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // Store user data so AuthContext picks it up on redirect
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        setStatus('success');

        // Force a full page reload to ensure AuthContext re-initializes with new tokens
        setTimeout(() => {
          window.location.href = redirect || '/';
        }, 1500);
      } catch (err: unknown) {
        setStatus('error');
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError(error?.response?.data?.message || error?.message || 'Invalid or expired magic link');
      }
    }

    verifyMagicLink();
  }, [token, redirect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 shadow-2xl">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verifying Magic Link</h1>
              <p className="text-gray-300">Please wait while we sign you in...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back! 🎉</h1>
              <p className="text-gray-300">You&apos;ve been signed in successfully.</p>
              <p className="text-gray-400 text-sm mt-2">Redirecting you now...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Link Expired or Invalid</h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try Logging In Again
                </Link>
                <Link
                  href="/auth/login?tab=magic"
                  className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Request New Magic Link
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      }
    >
      <MagicLinkContent />
    </Suspense>
  );
}
