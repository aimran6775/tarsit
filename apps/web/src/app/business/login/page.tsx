'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Building2,
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  Shield,
  CheckCircle2,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

// Platform stats - could be fetched from API
const platformStats = [
  { label: 'Active Businesses', value: '2,500+', icon: Building2 },
  { label: 'Monthly Bookings', value: '50K+', icon: Calendar },
  { label: 'Customer Reviews', value: '125K+', icon: Star },
  { label: 'Revenue Generated', value: '$2M+', icon: DollarSign },
];

// Success stories carousel
const successStories = [
  {
    business: 'Bella Salon & Spa',
    quote: 'Bookings increased 300% in the first month. The dashboard makes everything so easy.',
    owner: 'Maria Santos',
    role: 'Owner',
    metric: '+300% bookings',
    avatar: '👩‍💼',
  },
  {
    business: 'Elite Auto Care',
    quote: 'Finally, a platform that understands what business owners need. Game changer!',
    owner: 'James Wilson',
    role: 'Manager',
    metric: '98% satisfaction',
    avatar: '👨‍💼',
  },
  {
    business: 'Golden Gate Cafe',
    quote: 'The analytics alone are worth it. We know exactly what our customers want now.',
    owner: 'Sarah Chen',
    role: 'Owner',
    metric: '$45K/month',
    avatar: '👩‍🍳',
  },
];

// Dashboard preview features
const dashboardFeatures = [
  { icon: BarChart3, label: 'Analytics', value: 'Real-time' },
  { icon: Calendar, label: 'Appointments', value: '24 Today' },
  { icon: MessageSquare, label: 'Messages', value: '12 New' },
  { icon: DollarSign, label: 'Revenue', value: '$3,240' },
];

export default function BusinessLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStory, setCurrentStory] = useState(0);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Auto-rotate success stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Determine if input is email or username
      const isEmail = formData.usernameOrEmail.includes('@');
      const loginData = isEmail
        ? { email: formData.usernameOrEmail, password: formData.password }
        : { username: formData.usernameOrEmail, password: formData.password };

      await login(loginData);
      router.push('/business/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error?.response?.data?.message || error?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Panel - Dashboard Preview */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Header */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">tarsit</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-medium">
                BUSINESS
              </span>
            </Link>

            <h2 className="text-3xl font-bold text-white mb-3">
              Your Dashboard Awaits
            </h2>
            <p className="text-neutral-400 text-lg max-w-md">
              Manage appointments, track revenue, and grow your business with powerful analytics.
            </p>
          </div>

          {/* Dashboard Preview Mock */}
          <div className="my-8">
            <div className="relative">
              {/* Blurred dashboard preview */}
              <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 backdrop-blur-xl">
                {/* Top stats row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {dashboardFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50"
                    >
                      <feature.icon className="h-5 w-5 text-teal-400 mb-2" />
                      <div className="text-lg font-semibold text-white">{feature.value}</div>
                      <div className="text-xs text-neutral-500">{feature.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="h-32 rounded-xl bg-neutral-800/30 border border-neutral-700/30 flex items-end justify-around px-4 pb-4">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      className="w-8 rounded-t-lg bg-gradient-to-t from-teal-500/50 to-teal-400/30"
                    />
                  ))}
                </div>

                {/* Blur overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent rounded-2xl" />
              </div>

              {/* "Sign in to access" badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-500/30 backdrop-blur-sm">
                  <Lock className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-teal-300">Sign in to access your dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {platformStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="h-5 w-5 text-teal-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-neutral-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Success Stories Carousel */}
            <div className="relative h-36 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{successStories[currentStory].avatar}</div>
                      <div className="flex-1">
                        <p className="text-neutral-300 text-sm mb-3 leading-relaxed">
                          &quot;{successStories[currentStory].quote}&quot;
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white text-sm">
                              {successStories[currentStory].owner}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {successStories[currentStory].role}, {successStories[currentStory].business}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-medium">
                            <TrendingUp className="h-3 w-3" />
                            {successStories[currentStory].metric}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Story indicators */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                {successStories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStory(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStory
                        ? 'w-6 bg-teal-400'
                        : 'w-1.5 bg-neutral-600 hover:bg-neutral-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">tarsit</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-medium">
              BUSINESS
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-neutral-400">
              Sign in to manage your business dashboard
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Shield className="h-4 w-4 text-teal-400" />
            <span className="text-xs text-teal-300">Enterprise-grade security • 2FA Available</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username or Email */}
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-neutral-300 mb-2">
                Username or Email
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="you@company.com or username"
                  value={formData.usernameOrEmail}
                  onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                  required
                  className="w-full h-12 pl-12 pr-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-neutral-300">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full h-12 pl-12 pr-12 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Links */}
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/forgot-username"
                className="text-neutral-500 hover:text-teal-400 transition-colors"
              >
                Forgot username?
              </Link>
              <Link
                href="/auth/forgot-password"
                className="text-neutral-500 hover:text-teal-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0a0a] text-neutral-500">or continue with</span>
            </div>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-medium hover:bg-neutral-800 hover:border-neutral-700 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-medium hover:bg-neutral-800 hover:border-neutral-700 transition-all"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-neutral-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/business/register"
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Register your business
              </Link>
            </p>
            
            <p className="text-sm text-neutral-600">
              Looking to discover services?{' '}
              <Link
                href="/auth/login"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Customer login →
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
              <span className="text-xs text-neutral-400 font-medium">Demo Business Accounts</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-400">owner1@example.com</span>
                <span className="text-neutral-500">password123</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-400">owner2@example.com</span>
                <span className="text-neutral-500">password123</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
