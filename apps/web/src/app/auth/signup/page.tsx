'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Sparkles, MessageCircle, Calendar, Heart } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error?.response?.data?.message || error?.message || 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
  ];

  const benefits = [
    { icon: Sparkles, text: 'Personalized recommendations', color: 'text-purple-400 bg-purple-500/20' },
    { icon: MessageCircle, text: 'Real-time chat with businesses', color: 'text-indigo-400 bg-indigo-500/20' },
    { icon: Calendar, text: 'Easy appointment booking', color: 'text-cyan-400 bg-cyan-500/20' },
    { icon: Heart, text: 'Save your favorites', color: 'text-rose-400 bg-rose-500/20' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-indigo-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.2),transparent_50%)]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-md text-white relative z-10">
          {/* Decorative element */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free to join
            </div>
          </div>
          
          <h2 className="text-3xl font-semibold mb-4 leading-tight">
            Your local services,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">simplified.</span>
          </h2>
          
          <p className="text-white/50 mb-10 leading-relaxed">
            Join thousands of users who discover and connect with 
            local businesses every day.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${benefit.color}`}>
                  <benefit.icon className="h-5 w-5" />
                </div>
                <span className="text-sm text-white/70">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="grid grid-cols-3 gap-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl font-semibold text-white">2.5k+</div>
                <div className="text-xs text-white/40">Businesses</div>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="text-2xl font-semibold text-white">50k+</div>
                <div className="text-xs text-white/40">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-white">4.9</div>
                <div className="text-xs text-white/40">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_50%)]" />
        
        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <Link href="/" className="inline-block mb-10">
            <span className="text-xl font-semibold tracking-tight text-white">tarsit</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">
              Create your account
            </h1>
            <p className="text-white/50 text-sm">
              Start discovering local services today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white/70 mb-2">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white/70 mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full h-11 pl-8 pr-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-white/40">Letters, numbers, and underscores only</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-11 px-4 pr-11 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1.5">
                  {passwordRequirements.map((req) => (
                    <div key={req.text} className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${req.met ? 'bg-emerald-400' : 'bg-white/20'}`} />
                      <span className={`text-xs ${req.met ? 'text-emerald-400' : 'text-white/40'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-white/40 leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-white/60 hover:text-purple-400 transition-colors">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-white/60 hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
            </p>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-neutral-950 px-4 text-xs text-white/30 uppercase tracking-wider">or</span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full h-11 bg-white/5 border border-white/10 rounded-lg font-medium text-sm text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-950 transition-all flex items-center justify-center gap-3"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Sign in link */}
          <p className="mt-8 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>

          {/* Business link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              Business owner?{' '}
              <Link href="/business/register" className="text-white/60 hover:text-purple-400 transition-colors">
                Register here →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
