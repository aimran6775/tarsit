'use client';

import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api/auth.api';
import { signInWithGoogle } from '@/lib/oauth';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, Shield, Sparkles, User, Wand2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'magic' ? 'magic' : 'password';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'magic'>(initialTab);
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Redirect happens automatically via Supabase
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message || 'Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Handle magic link request
    if (authMethod === 'magic') {
      try {
        await authApi.requestMagicLink(formData.email);
        setMagicLinkSent(true);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError(error?.response?.data?.message || error?.message || 'Failed to send magic link');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Handle password login
    try {
      await login({
        email: loginMethod === 'email' ? formData.email : undefined,
        username: loginMethod === 'username' ? formData.username : undefined,
        password: formData.password,
      });
      router.push('/');
    } catch (err: unknown) {
      const error = err as {
        code?: string;
        message?: string;
        response?: { data?: { message?: string } };
      };
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Form Section - Full width on mobile */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-block mb-6 sm:mb-8 hover:opacity-80 transition-opacity">
            <span className="text-white font-semibold text-xl sm:text-2xl tracking-tight">
              tarsit
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Sign in to continue discovering local businesses
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Auth Method Toggle - Password vs Magic Link */}
            <div className="flex p-1 bg-white/5 rounded-xl mb-2">
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setMagicLinkSent(false); setError(''); }}
                className={`flex-1 py-2.5 sm:py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  authMethod === 'password'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white active:bg-white/10'
                }`}
              >
                <Lock className="w-4 h-4" />
                Password
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('magic'); setMagicLinkSent(false); setError(''); }}
                className={`flex-1 py-2.5 sm:py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  authMethod === 'magic'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white active:bg-white/10'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                Magic Link
              </button>
            </div>

            {/* Magic Link Success Message */}
            {magicLinkSent && authMethod === 'magic' && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium">Check your email!</p>
                  <p className="text-green-400/80 text-sm mt-1">
                    We sent a magic link to <strong>{formData.email}</strong>. Click it to sign in instantly.
                  </p>
                </div>
              </div>
            )}

            {authMethod === 'password' && (
              <>
                {/* Login Method Toggle - Email vs Username */}
                <div className="flex p-1 bg-white/5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2.5 sm:py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      loginMethod === 'email'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white active:bg-white/10'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('username')}
                    className={`flex-1 py-2.5 sm:py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      loginMethod === 'username'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white active:bg-white/10'
                    }`}
                  >
                    Username
                  </button>
                </div>

                {/* Email/Username Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {loginMethod === 'email' ? 'Email' : 'Username'}
                  </label>
                  <div className="relative">
                    {loginMethod === 'email' ? (
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    ) : (
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    )}
                    <input
                      type={loginMethod === 'email' ? 'email' : 'text'}
                      value={loginMethod === 'email' ? formData.email : formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [loginMethod === 'email' ? 'email' : 'username']: e.target.value,
                        })
                      }
                      className="w-full h-12 sm:h-auto pl-12 pr-4 py-3 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base sm:text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      placeholder={loginMethod === 'email' ? 'you@example.com' : 'johndoe'}
                      required
                      autoComplete={loginMethod === 'email' ? 'email' : 'username'}
                      enterKeyHint="next"
                    />
                  </div>
                </div>
              </>
            )}

            {authMethod === 'magic' && !magicLinkSent && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 sm:h-auto pl-12 pr-4 py-3 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base sm:text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    enterKeyHint="done"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  We&apos;ll email you a magic link for password-free sign in
                </p>
              </div>
            )}

            {/* Password Input - Only for password auth method */}
            {authMethod === 'password' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-12 sm:h-auto pl-12 pr-12 py-3 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base sm:text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    enterKeyHint="done"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-300 active:bg-white/10 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password - Only for password auth */}
            {authMethod === 'password' && (
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300 py-1"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit Button - Hide if magic link already sent */}
            {!(authMethod === 'magic' && magicLinkSent) && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 sm:h-auto py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 active:from-purple-700 active:to-indigo-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {authMethod === 'magic' ? 'Sending...' : 'Signing in...'}
                  </>
                ) : authMethod === 'magic' ? (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Send Magic Link
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            )}

            {/* Send Another Magic Link */}
            {authMethod === 'magic' && magicLinkSent && (
              <button
                type="button"
                onClick={() => setMagicLinkSent(false)}
                className="w-full py-3 px-4 bg-white/5 text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                Send to a different email
              </button>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-500">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-12 sm:h-auto py-3 px-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 active:bg-white/15 disabled:opacity-50 flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 sm:mt-8 text-center text-gray-400 text-sm sm:text-base">
            Do not have an account?{' '}
            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </Link>
          </p>

          {/* Business Portal Link */}
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/10">
            <p className="text-center text-gray-500 text-sm">
              Own a business?{' '}
              <Link href="/business/login" className="text-purple-400 hover:text-purple-300">
                Business Portal
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Side Panel - Hidden on mobile */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-black" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-purple-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Discover Local Gems</h2>
          <p className="text-gray-300 text-lg mb-12 max-w-md">
            Find the best local businesses and connect with your community.
          </p>
          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Verified Reviews</h3>
                <p className="text-gray-400 text-sm">Authentic feedback from real customers</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Quick Booking</h3>
                <p className="text-gray-400 text-sm">Schedule appointments instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Save Favorites</h3>
                <p className="text-gray-400 text-sm">Keep track of places you love</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
