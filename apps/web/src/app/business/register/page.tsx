'use client';

import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { useAuth } from '@/contexts/auth-context';
import { useRegion } from '@/contexts/region-context';
import { useCategories } from '@/hooks';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    AtSign,
    BarChart3,
    Building2,
    Calendar,
    Check,
    Eye,
    EyeOff,
    Globe,
    ImagePlus,
    Loader2,
    Lock,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Search,
    Shield,
    Smartphone,
    Sparkles,
    Star,
    Store,
    User,
    X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Confetti celebration function
const fireConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Confetti from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
    });
  }, 250);
};

// Step definitions
const steps = [
  { id: 1, title: 'Account', description: 'Create your account', icon: User },
  { id: 2, title: 'Business', description: 'Business details', icon: Store },
  { id: 3, title: 'Location', description: 'Where to find you', icon: MapPin },
  { id: 4, title: 'Complete', description: 'Review & launch', icon: Sparkles },
];

// Category icons mapping
const categoryIcons: Record<string, string> = {
  restaurants: '🍽️',
  'beauty-spas': '💅',
  'home-services': '🏠',
  'auto-services': '🚗',
  'health-medical': '🏥',
  'professional-services': '💼',
  shopping: '🛍️',
  entertainment: '🎭',
  fitness: '💪',
  education: '📚',
};

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-teal-500' };
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-500' };
};

// Phone number formatter
const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
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
  // Region
  regionId: string;
}

export default function BusinessRegisterPage() {
  const router = useRouter();
  const { signupBusiness } = useAuth();
  const { region: userRegion, regions: availableRegions } = useRegion();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  // Logo upload (for future implementation - logo is uploaded separately after registration)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');

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
    regionId: '',
  });

  // Initialize regionId from detected user region
  useEffect(() => {
    if (userRegion && !formData.regionId) {
      setFormData(prev => ({ ...prev, regionId: userRegion.id }));
    }
  }, [userRegion, formData.regionId]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check username availability (debounced)
  useEffect(() => {
    if (formData.username.length >= 3) {
      setCheckingUsername(true);
      const timer = setTimeout(async () => {
        // Mock check - in real app, call API
        const taken = ['admin', 'tarsit', 'business', 'user'].includes(
          formData.username.toLowerCase()
        );
        setUsernameAvailable(!taken);
        setCheckingUsername(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image too large', { description: 'Please select an image under 5MB' });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Filter categories by search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (formData.username.length < 3)
        newErrors.username = 'Username must be at least 3 characters';
      if (usernameAvailable === false) newErrors.username = 'Username is already taken';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8)
        newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step === 2) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.categoryId) newErrors.categoryId = 'Please select a category';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.length < 20)
        newErrors.description = 'Description must be at least 20 characters';
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
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
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
          regionId: formData.regionId || undefined,
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

      // 🎉 Fire confetti celebration!
      fireConfetti();

      // Wait a moment for celebration before redirecting
      setTimeout(() => {
        router.push('/business/dashboard?welcome=true');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Registration failed';
      setError(errorMessage);
      toast.error('Registration failed', { description: errorMessage });
      // Go back to first step if account error, otherwise stay
      if (
        errorMessage.includes('Email') ||
        errorMessage.includes('Username') ||
        errorMessage.includes('Phone')
      ) {
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
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Last Name</label>
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
              <label className="block text-sm font-medium text-neutral-300 mb-2">Username</label>
              <div className="relative group">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleChange(
                      'username',
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                    )
                  }
                  placeholder="johnsmith"
                  className={`w-full h-12 pl-12 pr-12 bg-neutral-900/50 border ${errors.username ? 'border-red-500' : usernameAvailable === true ? 'border-green-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checkingUsername && (
                    <Loader2 className="h-5 w-5 text-neutral-500 animate-spin" />
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check className="h-5 w-5 text-green-400" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <span className="text-xs text-red-400">Taken</span>
                  )}
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
              <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
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
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-full rounded-full transition-all duration-300 ${
                            level <= calculatePasswordStrength(formData.password).score
                              ? calculatePasswordStrength(formData.password).color
                              : 'bg-neutral-800'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${
                      calculatePasswordStrength(formData.password).score <= 2 ? 'text-red-400' :
                      calculatePasswordStrength(formData.password).score <= 3 ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}>
                      {calculatePasswordStrength(formData.password).label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Use 8+ characters with uppercase, lowercase, numbers & symbols
                  </p>
                </div>
              )}
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
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
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
            {/* Business Name + Logo Row */}
            <div className="flex gap-4">
              {/* Logo Upload */}
              <div className="shrink-0">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Logo</label>
                <div className="relative">
                  {logoPreview ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-teal-500">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-700 hover:border-teal-500 bg-neutral-900/50 flex flex-col items-center justify-center cursor-pointer transition-all group">
                      <ImagePlus className="h-6 w-6 text-neutral-500 group-hover:text-teal-400 transition-colors" />
                      <span className="text-[10px] text-neutral-500 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Business Name */}
              <div className="flex-1">
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
                {errors.businessName && (
                  <p className="mt-1 text-xs text-red-400">{errors.businessName}</p>
                )}
              </div>
            </div>

            {/* Category Selection - Improved with Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Category</label>
              {categoriesLoading ? (
                <div className="flex items-center gap-2 text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading categories...
                </div>
              ) : (
                <>
                  {/* Category Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full h-10 pl-10 pr-4 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                    {filteredCategories.map((category) => (
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
                  {filteredCategories.length === 0 && (
                    <p className="text-sm text-neutral-500 text-center py-4">No categories found</p>
                  )}
                </>
              )}
              {errors.categoryId && (
                <p className="mt-1 text-xs text-red-400">{errors.categoryId}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell customers about your business..."
                rows={4}
                className={`w-full px-4 py-3 bg-neutral-900/50 border ${errors.description ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none`}
              />
              <div className="flex justify-between mt-1">
                {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
                <p className="text-xs text-neutral-500 ml-auto">
                  {formData.description.length}/2000
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                    maxLength={14}
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
                {errors.businessEmail && (
                  <p className="mt-1 text-xs text-red-400">{errors.businessEmail}</p>
                )}
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
                  <p className="text-xs text-neutral-400">
                    This address will be shown to customers so they can find you.
                  </p>
                </div>
              </div>
            </div>

            {/* Street Address with Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Street Address
              </label>
              <AddressAutocomplete
                value={formData.addressLine1}
                onChange={(value) => handleChange('addressLine1', value)}
                onAddressSelect={(address) => {
                  handleChange('addressLine1', address.addressLine1);
                  if (address.addressLine2) handleChange('addressLine2', address.addressLine2);
                  handleChange('city', address.city);
                  handleChange('state', address.state);
                  handleChange('zipCode', address.zipCode);
                  handleChange('country', address.country === 'United States' ? 'USA' : address.country);
                }}
                placeholder="Start typing your address..."
                error={errors.addressLine1}
              />
              <p className="mt-1 text-xs text-neutral-500">
                💡 Start typing and select from suggestions to auto-fill
              </p>
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
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Spain">Spain</option>
                <option value="Pakistan">Pakistan</option>
                <option value="India">India</option>
              </select>
            </div>

            {/* Business Region */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-teal-400" />
                  Business Region
                </span>
              </label>
              <p className="text-xs text-neutral-500 mb-2">This determines where your business appears in search results</p>
              <select
                value={formData.regionId}
                onChange={(e) => handleChange('regionId', e.target.value)}
                className={`w-full h-12 px-4 bg-neutral-900/50 border ${errors.regionId ? 'border-red-500' : 'border-neutral-800'} rounded-xl text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
              >
                <option value="">Select a region</option>
                {availableRegions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.flag} {region.name}
                  </option>
                ))}
              </select>
              {errors.regionId && <p className="mt-1 text-xs text-red-400">{errors.regionId}</p>}
              {formData.regionId && (
                <p className="mt-2 text-xs text-teal-400">
                  ✓ Your business will appear in {availableRegions.find(r => r.id === formData.regionId)?.name || 'selected region'} searches
                </p>
              )}
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
                    <span className="text-white">
                      {formData.firstName} {formData.lastName}
                    </span>
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
                      {categories.find((c) => c.id === formData.categoryId)?.name || '-'}
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
                  <Link href="/terms" className="text-teal-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-teal-400 hover:underline">
                    Privacy Policy
                  </Link>
                  . Your presence will be reviewed before going live.
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
      <div className="hidden lg:flex lg:w-[500px] xl:w-[560px] relative overflow-hidden flex-shrink-0 border-r border-neutral-800/50">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-emerald-900/20 to-transparent" />
        
        {/* Subtle animated orb */}
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-teal-500/10 to-emerald-500/5 rounded-full blur-3xl" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12 w-full">
          {/* Header */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all group-hover:scale-105">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">tarsit</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 font-bold tracking-wider">
                  BUSINESS
                </span>
              </div>
            </Link>
          </div>

          {/* Main Content - Centered */}
          <div className="flex-1 flex flex-col justify-center py-8">
            {/* Hero Text */}
            <div className="mb-12">
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-5">
                Grow your
                <span className="block mt-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  business online
                </span>
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-sm">
                Join thousands of local businesses getting discovered every day on Tarsit.
              </p>
            </div>

            {/* Progress Steps - Clean Vertical */}
            <div className="relative pl-1">
              {/* Progress line background */}
              <div className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-neutral-800 rounded-full" />
              {/* Progress line fill */}
              <motion.div 
                className="absolute left-[15px] top-3 w-[2px] bg-gradient-to-b from-teal-400 to-emerald-500 rounded-full"
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(((currentStep - 1) / (steps.length - 1)) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              
              <div className="space-y-5">
                {steps.map((step) => {
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;
                  const isPending = currentStep < step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center gap-4 relative">
                      {/* Step Circle */}
                      <motion.div
                        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-br from-teal-400 to-emerald-500 shadow-md shadow-teal-500/30'
                            : isCurrent
                              ? 'bg-teal-500/20 ring-2 ring-teal-500 ring-offset-2 ring-offset-[#0a0a0a]'
                              : 'bg-neutral-800 border border-neutral-700'
                        }`}
                        animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <step.icon className={`h-4 w-4 ${isCurrent ? 'text-teal-400' : 'text-neutral-500'}`} />
                        )}
                      </motion.div>
                      
                      {/* Step Text */}
                      <div className={`transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                        <div className={`text-sm font-semibold ${isCurrent ? 'text-white' : isCompleted ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-neutral-500">{step.description}</div>
                      </div>
                      
                      {/* Current indicator */}
                      {isCurrent && (
                        <div className="ml-auto flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                          </span>
                          <span className="text-xs text-teal-400 font-medium">Current</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { Icon: Calendar, label: 'Bookings' },
                { Icon: MessageSquare, label: 'Messages' },
                { Icon: BarChart3, label: 'Analytics' },
                { Icon: Star, label: 'Reviews' },
                { Icon: Search, label: 'SEO' },
                { Icon: Smartphone, label: 'Mobile App' },
              ].map((feature) => (
                <div 
                  key={feature.label} 
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/50 hover:border-neutral-700/50 transition-colors"
                >
                  <feature.Icon className="h-4 w-4 text-teal-400" />
                  <span className="text-xs text-neutral-300 font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-neutral-800/50">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span>SSL Secured</span>
              </div>
              <div className="h-3 w-px bg-neutral-800" />
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>256-bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">tarsit</span>
            <span className="text-xs px-2 py-1 rounded-full bg-teal-500/20 text-teal-300 font-medium border border-teal-500/30">
              BUSINESS
            </span>
          </Link>

          {/* Mobile Step Indicator */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-400">Step {currentStep} of {steps.length}</span>
              <span className="text-sm font-medium text-teal-400">{Math.round((currentStep / steps.length) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Step Title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return <StepIcon className="h-4 w-4 text-teal-400" />;
              })()}
              <span className="text-xs font-medium text-teal-400">Step {currentStep}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{steps[currentStep - 1].title}</h1>
            <p className="text-neutral-400">{steps[currentStep - 1].description}</p>
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
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-4 mt-10">
            {currentStep > 1 && (
              <motion.button
                type="button"
                onClick={handleBack}
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 h-14 border border-neutral-700 text-neutral-300 rounded-2xl font-semibold hover:bg-neutral-800/50 hover:border-neutral-600 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </motion.button>
            )}

            <motion.button
              type="button"
              onClick={currentStep === 4 ? handleSubmit : handleNext}
              disabled={isLoading}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 h-14 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 ${
                currentStep === 4
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : currentStep === 4 ? (
                <>
                  <Sparkles className="h-5 w-5" />
                  Launch My Business
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
          <div className="mt-10 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link
                href="/business/login"
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Mobile Trust Badge */}
          <div className="lg:hidden flex items-center justify-center gap-6 mt-8 pt-6 border-t border-neutral-800/50">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>Encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
