'use client';

import { useTars } from '@/contexts/TarsContext';
import { ALL_PERSONAS, TarsPersona } from '@/lib/tars/personas';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Star,
  Terminal,
  UserPlus,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { TarsAvatar } from './TarsAvatar';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tarsMessage: string;
  action?: {
    label: string;
    query: string;
  };
}

// Guest Onboarding - focused on discovery and signup conversion
const GUEST_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Tarsit! 🎉',
    description: "I'm TARS, your AI-powered guide to local businesses.",
    icon: Compass,
    tarsMessage:
      "Hey there! I'm TARS - your friendly neighborhood AI assistant. Think of me as your personal concierge for finding amazing local businesses. Let me show you around!",
  },
  {
    id: 'discover',
    title: 'Discover Amazing Places',
    description: 'Find restaurants, salons, gyms, and more near you.',
    icon: Search,
    tarsMessage:
      "Looking for the best coffee spot? A trusted mechanic? Just ask me! I can search by what you need, where you are, or even your mood. Try: 'best brunch spot downtown' 🍳",
    action: {
      label: 'Try a search',
      query: 'What are the best-rated restaurants near me?',
    },
  },
  {
    id: 'explore',
    title: 'Explore Categories',
    description: 'Browse by category to discover new favorites.',
    icon: MapPin,
    tarsMessage:
      "Not sure what you're looking for? Browse our categories! Food, Beauty, Fitness, Health, Services - there's something for everyone. I'll help you find hidden gems!",
    action: {
      label: 'Browse categories',
      query: 'Show me popular categories',
    },
  },
  {
    id: 'signup',
    title: 'Get More with an Account',
    description: 'Sign up free to book, save favorites, and get personalized recommendations.',
    icon: UserPlus,
    tarsMessage:
      "Here's the deal: with a free account, you can book appointments instantly, save your favorites, and I'll remember your preferences to give you better recommendations. It takes 30 seconds! 🚀",
    action: {
      label: 'Why sign up?',
      query: 'What benefits do I get by creating an account?',
    },
  },
  {
    id: 'help',
    title: "I'm Always Here",
    description: 'Click the TARS button anytime for help.',
    icon: Sparkles,
    tarsMessage:
      "That's the quick tour! You can chat with me anytime - I'm that blue button in the corner. Ask me anything about businesses, get recommendations, or just say hi. I don't bite! 😄",
  },
];

// Customer Onboarding - focused on booking and engagement
const CUSTOMER_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Tarsit!',
    description: "I'm TARS, your personal concierge. Nice to meet you!",
    icon: Sparkles,
    tarsMessage:
      "Welcome aboard! I'm TARS - your personal guide to Tarsit. With my humor setting at 75%, I promise to make finding great businesses both efficient AND entertaining. Ready to explore?",
  },
  {
    id: 'search',
    title: 'Find What You Need',
    description: 'Personalized search based on your preferences.',
    icon: Search,
    tarsMessage:
      "Now that we're acquainted, I can give you personalized recommendations! The search is powerful - try 'best pizza near me' or ask me directly. I'll learn your tastes over time!",
    action: {
      label: 'Try searching',
      query: 'What restaurants would you recommend based on popular choices?',
    },
  },
  {
    id: 'booking',
    title: 'Book Instantly',
    description: 'Schedule appointments directly - no calls needed.',
    icon: Calendar,
    tarsMessage:
      "Found a place you like? Book in seconds! Pick your service, choose a time, and done. I'll send you reminders so you never miss an appointment. Your calendar synced? Even better!",
    action: {
      label: 'How to book',
      query: 'How do I book an appointment?',
    },
  },
  {
    id: 'favorites',
    title: 'Build Your Collection',
    description: 'Save favorites and get updates.',
    icon: Heart,
    tarsMessage:
      "See that heart icon? Tap it to save businesses to your favorites. I'll notify you of special deals and remind you when it's been a while since your last visit!",
    action: {
      label: 'About favorites',
      query: 'How do favorites work?',
    },
  },
  {
    id: 'reviews',
    title: 'Share Your Voice',
    description: 'Your reviews help the community.',
    icon: Star,
    tarsMessage:
      "After your visit, share your experience! Your reviews help others make great choices, and businesses really appreciate the feedback. You're building the community! 🌟",
    action: {
      label: 'About reviews',
      query: 'How do I leave a helpful review?',
    },
  },
  {
    id: 'help',
    title: "I'm Your Guide",
    description: 'Chat with me anytime - I learn and remember.',
    icon: Sparkles,
    tarsMessage:
      "That's the tour! I'm always in the corner, ready to help. The more we chat, the better I understand your preferences. Need restaurant recs for date night? Gym near your office? Just ask! 💬",
  },
];

// Business Onboarding - focused on efficiency and growth
const BUSINESS_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard',
    description: "I'm TARS, your AI business co-pilot.",
    icon: Terminal,
    tarsMessage:
      "Welcome to your command center. I'm TARS, and I'm here to help you grow your business on Tarsit. Let's get you set up for success - efficiency is my specialty.",
  },
  {
    id: 'profile',
    title: 'Optimize Your Profile',
    description: 'Complete profiles get 3x more visibility.',
    icon: MapPin,
    tarsMessage:
      'First things first: your profile. Complete profiles rank higher and convert better. Add quality photos, detailed services, and accurate hours. I can guide you through each section.',
    action: {
      label: 'Profile optimization tips',
      query: 'What makes a great business profile?',
    },
  },
  {
    id: 'appointments',
    title: 'Enable Online Booking',
    description: 'Increase appointments by 40% with online booking.',
    icon: Calendar,
    tarsMessage:
      "Online booking is a game-changer. Set your availability, define your services, and let customers book 24/7. I'll help you manage your schedule efficiently.",
    action: {
      label: 'Setup booking',
      query: 'How do I set up my booking system?',
    },
  },
  {
    id: 'messages',
    title: 'Customer Communication',
    description: 'Fast responses lead to more bookings.',
    icon: MessageSquare,
    tarsMessage:
      "Quick response time correlates directly with conversion. Enable messaging, and I'll help you manage inquiries efficiently. I can even help draft responses.",
    action: {
      label: 'Communication tips',
      query: 'How can I manage customer messages effectively?',
    },
  },
  {
    id: 'analytics',
    title: 'Track Your Growth',
    description: 'Data-driven insights for your business.',
    icon: BarChart3,
    tarsMessage:
      "Your analytics dashboard shows views, bookings, and trends. I can help you interpret the data and identify opportunities. Ask me 'how am I doing?' anytime.",
    action: {
      label: 'Understanding analytics',
      query: 'What metrics should I focus on?',
    },
  },
  {
    id: 'reviews',
    title: 'Reputation Management',
    description: 'Reviews drive 90% of purchase decisions.',
    icon: Star,
    tarsMessage:
      'Reviews are your online reputation. Always respond professionally - even to negative ones. I can help you craft perfect responses that show you care.',
    action: {
      label: 'Review strategies',
      query: 'How should I respond to different types of reviews?',
    },
  },
  {
    id: 'help',
    title: 'Your Operations Partner',
    description: "I'm here to help you succeed.",
    icon: Settings,
    tarsMessage:
      "That's the overview. I'm always in the corner, ready to assist with analytics, scheduling, customer service, or any operational challenge. Let's grow your business together.",
  },
];

interface TarsOnboardingProps {
  type?: TarsPersona;
  onComplete?: () => void;
  storageKey?: string;
}

export function TarsOnboarding({ type, onComplete, storageKey }: TarsOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const { openTars, persona } = useTars();

  // Use provided type or auto-detect from context
  const activePersona = type || persona;
  const personaConfig = ALL_PERSONAS[activePersona];

  // Get steps based on persona
  const steps =
    activePersona === 'business'
      ? BUSINESS_ONBOARDING_STEPS
      : activePersona === 'customer'
        ? CUSTOMER_ONBOARDING_STEPS
        : GUEST_ONBOARDING_STEPS;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Check if onboarding was already completed
  useEffect(() => {
    const key = storageKey || `tars-onboarding-${activePersona}`;
    const isCompleted = localStorage.getItem(key);
    if (!isCompleted) {
      // Delay showing onboarding for better UX
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [activePersona, storageKey]);

  const handleNext = () => {
    setCompleted([...completed, step.id]);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const key = storageKey || `tars-onboarding-${activePersona}`;
    localStorage.setItem(key, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleAskTars = (query: string) => {
    openTars({
      context: activePersona === 'business' ? 'business-dashboard' : 'general',
      initialMessage: query,
    });
    handleComplete();
  };

  if (!isVisible) return null;

  // Compute dynamic styles based on persona
  const gradientClass = `bg-gradient-to-r ${personaConfig.colors.gradient}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className={cn('h-full transition-all duration-300', gradientClass)}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br',
                  personaConfig.colors.gradient
                )}
              >
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/50">
                  Step {currentStep + 1} of {steps.length}
                </p>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Skip tour
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-white/70 mb-6">{step.description}</p>

          {/* TARS Message */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex gap-3">
              <TarsAvatar persona={activePersona} size="sm" />
              <div>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: personaConfig.colors.primary }}
                >
                  TARS
                </p>
                <p className="text-sm text-white/80 leading-relaxed">{step.tarsMessage}</p>
              </div>
            </div>
          </div>

          {/* Action button */}
          {step.action && (
            <button
              onClick={() => handleAskTars(step.action!.query)}
              className="mt-4 w-full px-4 py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: `${personaConfig.colors.primary}15`,
                borderColor: `${personaConfig.colors.primary}40`,
                borderWidth: '1px',
                color: personaConfig.colors.primary,
              }}
            >
              <Sparkles className="w-4 h-4" />
              {step.action.label}
            </button>
          )}
        </div>

        {/* Step indicators */}
        <div className="px-6 pb-4">
          <div className="flex justify-center gap-1.5">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === currentStep ? 'w-4' : '',
                  completed.includes(s.id) ? 'bg-emerald-500' : 'bg-white/20'
                )}
                style={i === currentStep ? { backgroundColor: personaConfig.colors.primary } : {}}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            className={cn(
              'px-6 py-2 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 bg-gradient-to-r',
              personaConfig.colors.gradient
            )}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Welcome back message for returning users
export function TarsWelcomeBack({ userName }: { userName?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const { openTars, persona, personaConfig } = useTars();

  useEffect(() => {
    // Check if we should show welcome back
    const lastVisit = localStorage.getItem(`tars-last-visit-${persona}`);
    const now = Date.now();

    if (lastVisit) {
      const daysSince = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
      if (daysSince > 1) {
        setIsVisible(true);
      }
    }

    localStorage.setItem(`tars-last-visit-${persona}`, now.toString());
  }, [persona]);

  if (!isVisible) return null;

  // Persona-specific welcome messages
  const welcomeMessages = {
    guest: 'Welcome back! Looking for something new today?',
    customer: userName
      ? `Welcome back, ${userName}! Ready to discover something new?`
      : 'Welcome back! What can I help you find today?',
    business: userName
      ? `Welcome back, ${userName}! Let's check on your business.`
      : 'Welcome back! Ready to review your dashboard?',
  };

  const actionLabels = {
    guest: "What's trending?",
    customer: "What's new for me?",
    business: "Today's summary",
  };

  return (
    <div className="fixed bottom-24 right-6 z-40 animate-fade-in max-w-[280px]">
      <div
        className="backdrop-blur-sm rounded-2xl shadow-xl p-4"
        style={{
          background: `linear-gradient(135deg, ${personaConfig.colors.primary}E6 0%, ${personaConfig.colors.accent}E6 100%)`,
          borderColor: `${personaConfig.colors.primary}50`,
          borderWidth: '1px',
        }}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 text-white/40 hover:text-white rounded"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3">
          <TarsAvatar persona={persona} size="sm" />
          <div>
            <p className="text-sm text-white/90 leading-relaxed pr-4">{welcomeMessages[persona]}</p>
            <button
              onClick={() => {
                openTars({ context: 'general' });
                setIsVisible(false);
              }}
              className="mt-2 text-xs text-white/70 hover:text-white flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {actionLabels[persona]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
