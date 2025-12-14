'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Shield,
  Loader2,
  Store,
  AtSign,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useCategories } from '@/hooks';
import { toast } from 'sonner';

// Step definitions
const steps = [
  { id: 1, title: 'Account', description: 'Create your account', icon: User },
  { id: 2, title: 'Business', description: 'Business details', icon: Store },
  { id: 3, title: 'Location', description: 'Where to find you', icon: MapPin },
  { id: 4, title: 'Complete', description: 'Review & launch', icon: Sparkles },
];

// Category icons mapping
const categoryIcons: Record<string, string> = {
  'restaurants': '🍽️',
  'beauty-spas': '💅',
  'home-services': '🏠',
  'auto-services': '🚗',
  'health-medical': '🏥',
  'professional-services': '💼',
  'shopping': '🛍️',
  'entertainment': '🎭',
  'fitness': '💪',
  'education': '📚',
};

interface FormData {
  // Account
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Business
  businessName: string;
  categoryId: string;
  description: string;
  phone: string;
  businessEmail: string;
  website: string;
  // Location
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function BusinessRegisterPage() {
  const router = useRouter();
  const { signupBusiness } = useAuth();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    categoryId: '',
    description: '',
    phone: '',
    businessEmail: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check username availability (debounced)
  useEffect(() => {
    if (formData.username.length >= 3) {
      setCheckingUsername(true);
      const timer = setTimeout(async () => {
        // Mock check - in real app, call API
        const taken = ['admin', 'tarsit', 'business', 'user'].includes(formData.username.toLowerCase());
        setUsernameAvailable(!taken);
        setCheckingUsername(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      if (usernameAvailable === false) newErrors.username = 'Username is already taken';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step === 2) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.categoryId) newErrors.categoryId = 'Please select a category';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required';
    }

    if (step === 3) {
      if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Use the combined signup-business endpoint
      const response = await signupBusiness({
        // User data
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        // Business data
        business: {
          name: formData.businessName,
          description: formData.description,
          categoryId: formData.categoryId,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || undefined,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country || 'USA',
          phone: formData.phone,
          email: formData.businessEmail || undefined,
          website: formData.website || undefined,
          priceRange: 'MODERATE',
        },
      });

      // Show success toast
      toast.success('Business registered successfully!', {
        description: `Welcome to Tarsit, ${response.business.name}!`,
      });

      // Redirect to dashboard with welcome flag
      router.push('/business/dashboard?welcome=true');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed';
      setError(errorMessage);
      toast.error('Registration failed', { description: errorMessage });
      // Go back to first step if account error, otherwise stay
      if (errorMessage.includes('Email') || errorMessage.includes('Username') || errorMessage.includes('Phone')) {
        setCurrentStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  First Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    className={`w-full h-12 pl-12 pr-4 bg-neutral-900/50 border ${errors.firstName ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Last Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Smith"
                    className={`w-full h-12 pl-12 pr-4 bg-neutral-900/50 border ${errors.lastName ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                  />
                </div>
                {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Username
              </label>
              <div className="relative group">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="johnsmith"
                  className={`w-full h-12 pl-12 pr-12 bg-neutral-900/50 border ${errors.username ? 'border-red-500' : usernameAvailable === true ? 'border-green-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checkingUsername && <Loader2 className="h-5 w-5 text-neutral-500 animate-spin" />}
                  {!checkingUsername && usernameAvailable === true && <Check className="h-5 w-5 text-green-400" />}
                  {!checkingUsername && usernameAvailable === false && <span className="text-xs text-red-400">Taken</span>}
                </div>
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
              {usernameAvailable === true && !errors.username && (
                <p className="mt-1 text-xs text-green-400">Username is available!</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@company.com"
                  className={`w-full h-12 pl-12 pr-4 bg-neutral-900/50 border ${errors.email ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-12 pr-12 bg-neutral-900/50 border ${errors.password ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-12 pr-12 bg-neutral-900/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Business Name
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="Acme Services Inc."
                  className={`w-full h-12 pl-12 pr-4 bg-neutral-900/50 border ${errors.businessName ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
              </div>
              {errors.businessName && <p className="mt-1 text-xs text-red-400">{errors.businessName}</p>}
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Category
              </label>
              {categoriesLoading ? (
                <div className="flex items-center gap-2 text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading categories...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleChange('categoryId', category.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        formData.categoryId === category.id
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                          : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-xl">{categoryIcons[category.slug] || '📁'}</span>
                      <span className="text-sm font-medium truncate">{category.name}</span>
                      {formData.categoryId === category.id && (
                        <Check className="h-4 w-4 ml-auto text-teal-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              {errors.categoryId && <p className="mt-1 text-xs text-red-400">{errors.categoryId}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell customers about your business..."
                rows={4}
                className={`w-full px-4 py-3 bg-neutral-900/50 border ${errors.description ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none`}
              />
              <div className="flex justify-between mt-1">
                {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
                <p className="text-xs text-neutral-500 ml-auto">{formData.description.length}/2000</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Phone
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className={`w-full h-12 pl-12 pr-4 bg-neutral-900/50 border ${errors.phone ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Business Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                  <input
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleChange('businessEmail', e.target.value)}
                    placeholder="hello@business.com"
                    className={`w-full h-12 pl-12 pr-4 bg-neutral-900/50 border ${errors.businessEmail ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                  />
                </div>
                {errors.businessEmail && <p className="mt-1 text-xs text-red-400">{errors.businessEmail}</p>}
              </div>
            </div>

            {/* Website (Optional) */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Website <span className="text-neutral-500 text-xs">(optional)</span>
              </label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="w-full h-12 pl-12 pr-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-teal-300 mb-1">Business Location</h3>
                  <p className="text-xs text-neutral-400">This address will be shown to customers so they can find you.</p>
                </div>
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Street Address
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  placeholder="123 Main Street"
                  className={`w-full h-12 pl-12 pr-4 bg-neutral-900/50 border ${errors.addressLine1 ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
              </div>
              {errors.addressLine1 && <p className="mt-1 text-xs text-red-400">{errors.addressLine1}</p>}
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Suite, Unit, etc. <span className="text-neutral-500 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                placeholder="Suite 100"
                className="w-full h-12 px-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="San Francisco"
                  className={`w-full h-12 px-4 bg-neutral-900/50 border ${errors.city ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
                {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                  placeholder="CA"
                  maxLength={2}
                  className={`w-full h-12 px-4 bg-neutral-900/50 border ${errors.state ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
                {errors.state && <p className="mt-1 text-xs text-red-400">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  placeholder="94102"
                  maxLength={10}
                  className={`w-full h-12 px-4 bg-neutral-900/50 border ${errors.zipCode ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
                {errors.zipCode && <p className="mt-1 text-xs text-red-400">{errors.zipCode}</p>}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Country</label>
              <select
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full h-12 px-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
              >
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="GBR">United Kingdom</option>
                <option value="AUS">Australia</option>
              </select>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Success Preview */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Almost there!</h3>
              <p className="text-neutral-400 text-sm">Review your information before launching</p>
            </div>

            {/* Review Cards */}
            <div className="space-y-4">
              {/* Account Info */}
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Account</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Name</span>
                    <span className="text-white">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Username</span>
                    <span className="text-white">@{formData.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="text-white">{formData.email}</span>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Business</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Business Name</span>
                    <span className="text-white">{formData.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Category</span>
                    <span className="text-white">
                      {categories.find(c => c.id === formData.categoryId)?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Phone</span>
                    <span className="text-white">{formData.phone}</span>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Location</span>
                </div>
                <div className="text-sm text-white">
                  {formData.addressLine1}
                  {formData.addressLine2 && `, ${formData.addressLine2}`}
                  <br />
                  {formData.city}, {formData.state} {formData.zipCode}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-teal-400 mt-0.5 shrink-0" />
                <p className="text-xs text-neutral-300">
                  By registering, you agree to our{' '}
                  <Link href="/terms" className="text-teal-400 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-teal-400 hover:underline">Privacy Policy</Link>.
                  Your business listing will be reviewed before going live.
                </p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Panel - Progress & Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background gradient */}
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
            <Link href="/" className="inline-flex items-center gap-2 mb-12">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">tarsit</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-medium">
                BUSINESS
              </span>
            </Link>

            <h2 className="text-3xl font-bold text-white mb-3">
              Register Your Business
            </h2>
            <p className="text-neutral-400 text-lg max-w-md">
              Join thousands of successful businesses on Tarsit. Get discovered by local customers today.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  currentStep > step.id
                    ? 'bg-teal-500 text-white'
                    : currentStep === step.id
                    ? 'bg-teal-500/20 border border-teal-500 text-teal-400'
                    : 'bg-neutral-800/50 text-neutral-500'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className={`text-sm font-medium transition-colors ${
                    currentStep >= step.id ? 'text-white' : 'text-neutral-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-neutral-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`ml-4 flex-1 h-px transition-colors ${
                    currentStep > step.id ? 'bg-teal-500' : 'bg-neutral-800'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '📈', label: '2,500+ Businesses' },
              { icon: '⭐', label: '125K+ Reviews' },
              { icon: '💰', label: '$2M+ Revenue' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xs text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
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
          </Link>

          {/* Mobile Step Indicator */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep > step.id
                    ? 'bg-teal-500 text-white'
                    : currentStep === step.id
                    ? 'bg-teal-500/20 border border-teal-500 text-teal-400'
                    : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                {step.id < steps.length && (
                  <div className={`w-8 h-0.5 ${
                    currentStep > step.id ? 'bg-teal-500' : 'bg-neutral-800'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-neutral-400 text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <motion.button
                type="button"
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 h-12 border border-neutral-700 text-neutral-300 rounded-xl font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </motion.button>
            )}
            
            <motion.button
              type="button"
              onClick={currentStep === 4 ? handleSubmit : handleNext}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : currentStep === 4 ? (
                <>
                  <Sparkles className="h-5 w-5" />
                  Launch Business
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link href="/business/login" className="text-teal-400 hover:text-teal-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
