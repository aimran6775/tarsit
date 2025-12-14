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

            // Login - this will throw an error if credentials are invalid
            await login(loginData);

            // If we get here, login was successful - redirect to dashboard
            // The auth context will have updated the user state
            router.push('/business/dashboard');
        } catch (err: unknown) {
            console.error('Login error:', err);
            // Handle specific error messages from the API
            if (err instanceof Error) {
                if (err.message.includes('Invalid') || err.message.includes('credentials')) {
                    setError('Invalid email/username or password. Please try again.');
                } else if (err.message.includes('not found')) {
                    setError('Account not found. Please check your email/username.');
                } else {
                    setError(err.message || 'An unexpected error occurred. Please try again.');
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md mx-auto w-full"
                >
                    {/* Logo & Header */}
                    <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Tarsit Business
                        </span>
                    </Link>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Welcome back
                    </h1>
                    <p className="text-slate-400 mb-8">
                        Sign in to manage your business and connect with customers
                    </p>

                    {/* Error Alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email or Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={formData.usernameOrEmail}
                                    onChange={(e) =>
                                        setFormData({ ...formData, usernameOrEmail: e.target.value })
                                    }
                                    placeholder="Enter your email or username"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    placeholder="Enter your password"
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In to Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700/50" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-950 text-slate-500">
                                New to Tarsit?
                            </span>
                        </div>
                    </div>

                    {/* Register CTA */}
                    <Link
                        href="/business/register"
                        className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Building2 className="w-5 h-5" />
                        Register Your Business
                    </Link>

                    {/* User Login Link */}
                    <p className="text-center text-slate-500 text-sm mt-6">
                        Looking for customer login?{' '}
                        <Link
                            href="/auth/login"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Sign in as customer
                        </Link>
                    </p>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-slate-800/50">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span>Secure Login</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Verified Platform</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Hero/Stats */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900/20 via-slate-900 to-pink-900/20 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12 w-full">
                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 gap-4 mb-12"
                    >
                        {platformStats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-5"
                            >
                                <stat.icon className="w-8 h-8 text-purple-400 mb-3" />
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-slate-400 text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Success Stories */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-medium">Success Story</span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStory}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-white text-lg mb-4 leading-relaxed">
                                    "{successStories[currentStory].quote}"
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                                            {successStories[currentStory].avatar}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">
                                                {successStories[currentStory].owner}
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                {successStories[currentStory].role},{' '}
                                                {successStories[currentStory].business}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                        {successStories[currentStory].metric}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Story Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {successStories.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStory(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentStory
                                        ? 'bg-purple-500 w-6'
                                        : 'bg-slate-600 hover:bg-slate-500'
                                        }`}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8"
                    >
                        <p className="text-slate-400 text-sm mb-4">
                            Your dashboard awaits:
                        </p>
                        <div className="flex gap-3">
                            {dashboardFeatures.map((feature, index) => (
                                <motion.div
                                    key={feature.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 + index * 0.1 }}
                                    className="flex-1 bg-slate-800/20 border border-slate-700/20 rounded-xl p-3 text-center"
                                >
                                    <feature.icon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                                    <p className="text-white text-xs font-medium">
                                        {feature.value}
                                    </p>
                                    <p className="text-slate-500 text-xs">{feature.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
