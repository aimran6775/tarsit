'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({
        email: loginMethod === 'email' ? formData.email : undefined,
        username: loginMethod === 'username' ? formData.username : undefined,
        password: formData.password,
      });
      router.push('/');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string; response?: { data?: { message?: string } } };
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-white font-semibold text-xl">Tarsit</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">Sign in to continue discovering local businesses</p>
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex p-1 bg-white/5 rounded-xl">
              <button type="button" onClick={() => setLoginMethod('email')} className={loginMethod === 'email' ? 'flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-purple-500 text-white' : 'flex-1 py-2 px-4 rounded-lg text-sm font-medium text-gray-400 hover:text-white'}>Email</button>
              <button type="button" onClick={() => setLoginMethod('username')} className={loginMethod === 'username' ? 'flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-purple-500 text-white' : 'flex-1 py-2 px-4 rounded-lg text-sm font-medium text-gray-400 hover:text-white'}>Username</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{loginMethod === 'email' ? 'Email' : 'Username'}</label>
              <div className="relative">
                {loginMethod === 'email' ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" /> : <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />}
                <input type={loginMethod === 'email' ? 'email' : 'text'} value={loginMethod === 'email' ? formData.email : formData.username} onChange={(e) => setFormData({ ...formData, [loginMethod === 'email' ? 'email' : 'username']: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50" placeholder={loginMethod === 'email' ? 'you@example.com' : 'johndoe'} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>
            <div className="flex justify-end"><Link href="/auth/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">Forgot password?</Link></div>
            <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">{isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : 'Sign In'}</button>
          </form>
          <p className="mt-8 text-center text-gray-400">Do not have an account? <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium">Sign up</Link></p>
          <div className="mt-6 pt-6 border-t border-white/10"><p className="text-center text-gray-500 text-sm">Own a business? <Link href="/auth/business/login" className="text-purple-400 hover:text-purple-300">Business Portal</Link></p></div>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-black" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-purple-500/25"><Sparkles className="w-10 h-10 text-white" /></div>
          <h2 className="text-3xl font-bold text-white mb-4">Discover Local Gems</h2>
          <p className="text-gray-300 text-lg mb-12 max-w-md">Find the best local businesses and connect with your community.</p>
          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"><div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Shield className="w-5 h-5 text-purple-400" /></div><div className="text-left"><h3 className="text-white font-medium">Verified Reviews</h3><p className="text-gray-400 text-sm">Authentic feedback from real customers</p></div></div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"><div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Zap className="w-5 h-5 text-indigo-400" /></div><div className="text-left"><h3 className="text-white font-medium">Quick Booking</h3><p className="text-gray-400 text-sm">Schedule appointments instantly</p></div></div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"><div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><User className="w-5 h-5 text-purple-400" /></div><div className="text-left"><h3 className="text-white font-medium">Save Favorites</h3><p className="text-gray-400 text-sm">Keep track of places you love</p></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
