'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Sparkles,
  Send,
  User,
  KeyRound,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, call API to send password reset email
      // await api.post('/auth/forgot-password', { identifier });
      
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const isEmail = identifier.includes('@');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)`,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">tarsit</span>
        </Link>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 mb-4">
                  <KeyRound className="h-7 w-7 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-neutral-400">
                  Enter your email or username and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-neutral-300 mb-2">
                    Email or Username
                  </label>
                  <div className="relative group">
                    {isEmail ? (
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-purple-400" />
                    ) : (
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-purple-400" />
                    )}
                    <input
                      id="identifier"
                      type="text"
                      placeholder="you@example.com or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    We&apos;ll send a password reset link to the email associated with this account.
                  </p>
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
                  disabled={isLoading || !identifier}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-400 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <Send className="h-5 w-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Other options */}
              <div className="mt-6 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <p className="text-xs text-neutral-500 mb-3">Other options:</p>
                <div className="space-y-2">
                  <Link
                    href="/auth/forgot-username"
                    className="flex items-center gap-2 text-sm text-neutral-400 hover:text-purple-400 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Forgot username instead?
                  </Link>
                </div>
              </div>

              {/* Back link */}
              <div className="mt-8 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6"
              >
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Check Your Email!
              </h2>
              <p className="text-neutral-400 mb-6">
                We&apos;ve sent a password reset link to the email associated with{' '}
                <span className="text-white font-medium">{identifier}</span>
              </p>

              {/* Email Preview Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-left mb-8"
              >
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">tarsit</div>
                    <div className="text-xs text-neutral-500">noreply@tarsit.com</div>
                  </div>
                </div>
                <div className="text-sm text-neutral-300 mb-4">
                  Reset your password
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  Reset here →
                </div>
                <div className="mt-4 text-xs text-neutral-500">
                  This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore this email.
                </div>
              </motion.div>

              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="block w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-400 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
                >
                  Return to Sign In
                  <ArrowRight className="h-5 w-5" />
                </Link>
                
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Didn&apos;t receive the email? Try again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
