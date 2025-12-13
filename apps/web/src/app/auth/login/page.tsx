'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { AuthLayout, AuthInput, AuthButton, SocialAuthButtons } from '@/components/auth/shared';
import { CustomerLoginVisual } from '@/components/auth/customer/CustomerLoginVisual';

export default function CustomerLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginData = loginMethod === 'email' 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, password: formData.password };
      
      await login(loginData);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error?.response?.data?.message || error?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      theme="customer" 
      visualContent={<CustomerLoginVisual />}
      visualPosition="right"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back
        </h1>
        <p className="text-neutral-400">
          Sign in to continue discovering local services
        </p>
      </div>

      {/* Login method toggle */}
      <div className="flex gap-2 p-1 bg-neutral-900 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            loginMethod === 'email'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('username')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            loginMethod === 'username'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Username
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {loginMethod === 'email' ? (
          <AuthInput
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            theme="customer"
          />
        ) : (
          <AuthInput
            label="Username"
            type="text"
            icon={User}
            placeholder="your_username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            theme="customer"
          />
        )}

        <div>
          <AuthInput
            label="Password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            showPasswordToggle
            theme="customer"
          />
          <div className="flex justify-between mt-2">
            <Link 
              href="/auth/forgot-username" 
              className="text-sm text-neutral-500 hover:text-purple-400 transition-colors"
            >
              Forgot username?
            </Link>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-neutral-500 hover:text-purple-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <AuthButton
          type="submit"
          theme="customer"
          isLoading={isLoading}
          icon={ArrowRight}
          className="w-full"
        >
          Sign in
        </AuthButton>
      </form>

      {/* Social auth */}
      <div className="mt-6">
        <SocialAuthButtons theme="customer" />
      </div>

      {/* Footer links */}
      <div className="mt-8 space-y-4">
        <p className="text-center text-sm text-neutral-500">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign up free
          </Link>
        </p>
        
        <div className="pt-4 border-t border-neutral-800">
          <p className="text-center text-sm text-neutral-600">
            Are you a business owner?{' '}
            <Link href="/business/login" className="text-teal-400 hover:text-teal-300 transition-colors">
              Business login →
            </Link>
          </p>
        </div>
      </div>

      {/* Demo credentials */}
      <div className="mt-6 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
        <p className="text-xs text-neutral-500 mb-2">Demo account:</p>
        <p className="text-xs text-neutral-400">
          <span className="text-neutral-300">customer1@example.com</span> / password123
        </p>
      </div>
    </AuthLayout>
  );
}
