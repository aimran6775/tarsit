'use client';

import { useState, useEffect } from 'react';
import {
    Bot,
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    CheckCircle,
    Search,
    Calendar,
    Heart,
    MessageSquare,
    Star,
    MapPin,
} from 'lucide-react';
import { useTars } from '@/contexts/TarsContext';

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

const CUSTOMER_ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Tarsit!',
        description: "I'm TARS, your AI assistant. Let me show you around!",
        icon: Bot,
        tarsMessage: "Welcome aboard! I'm TARS - your personal guide to Tarsit. With my humor setting at 75%, I promise to make this journey informative AND entertaining. Ready to explore?",
    },
    {
        id: 'search',
        title: 'Find Amazing Businesses',
        description: 'Search for businesses by name, category, or location.',
        icon: Search,
        tarsMessage: "The search is powerful - try searching for 'best pizza near me' or 'hair salon downtown'. I can help you find exactly what you need!",
        action: {
            label: 'Try searching',
            query: 'How do I search for businesses?',
        },
    },
    {
        id: 'booking',
        title: 'Book Appointments',
        description: 'Schedule appointments directly with businesses.',
        icon: Calendar,
        tarsMessage: "Found a place you like? You can book appointments in seconds. Just pick a time that works for you - no phone calls needed!",
        action: {
            label: 'Learn about booking',
            query: 'How do I book an appointment?',
        },
    },
    {
        id: 'favorites',
        title: 'Save Your Favorites',
        description: 'Keep track of businesses you love.',
        icon: Heart,
        tarsMessage: "See that heart icon? Click it to save businesses to your favorites. Your personal collection of the best spots in town!",
        action: {
            label: 'How to save favorites',
            query: 'How do I add favorites?',
        },
    },
    {
        id: 'reviews',
        title: 'Share Your Experience',
        description: 'Help others by leaving reviews.',
        icon: Star,
        tarsMessage: "After your visit, share your experience! Your reviews help other customers and help businesses improve. Everyone wins!",
        action: {
            label: 'Learn about reviews',
            query: 'How do I leave a review?',
        },
    },
    {
        id: 'help',
        title: "I'm Always Here to Help",
        description: 'Click the chat button anytime you need assistance.',
        icon: Sparkles,
        tarsMessage: "That's the tour! Remember, I'm always here in the bottom-right corner. Stuck on something? Just ask me. My honesty is at 95%, so you'll always get the real scoop!",
    },
];

const BUSINESS_ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome, Business Owner!',
        description: "I'm TARS, your AI assistant for managing your business.",
        icon: Bot,
        tarsMessage: "Welcome to your business command center! I'm TARS, and I'll help you make the most of your Tarsit presence. Let's get you set up for success!",
    },
    {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'A complete profile attracts more customers.',
        icon: MapPin,
        tarsMessage: "First impressions matter! Add your business hours, photos, and services. Complete profiles get 3x more views. I can help you with each section!",
        action: {
            label: 'Profile tips',
            query: 'How do I make my business profile stand out?',
        },
    },
    {
        id: 'appointments',
        title: 'Enable Appointments',
        description: 'Let customers book directly with you.',
        icon: Calendar,
        tarsMessage: "Online booking can increase your appointments by 40%! Enable it in Settings, and customers can book while you focus on what you do best.",
        action: {
            label: 'Setup appointments',
            query: 'How do I set up appointments?',
        },
    },
    {
        id: 'messages',
        title: 'Connect with Customers',
        description: 'Respond to messages and build relationships.',
        icon: MessageSquare,
        tarsMessage: "Quick response time = happy customers. Enable messaging and I'll help you stay on top of inquiries. Don't worry, I won't read your messages - honesty setting 95%!",
        action: {
            label: 'Messaging tips',
            query: 'How do I manage customer messages effectively?',
        },
    },
    {
        id: 'reviews',
        title: 'Manage Your Reviews',
        description: 'Respond to reviews and improve your rating.',
        icon: Star,
        tarsMessage: "Reviews are gold! Always respond - even to the tough ones. I can help you craft perfect responses. Your future customers are reading!",
        action: {
            label: 'Review strategies',
            query: 'How should I respond to reviews?',
        },
    },
    {
        id: 'help',
        title: "I'm Your Business Partner",
        description: "Need help anytime? I'm just a click away.",
        icon: Sparkles,
        tarsMessage: "You're all set! I'm here to help with anything - analytics questions, customer issues, or just figuring out that one confusing setting. Let's grow your business together!",
    },
];

interface TarsOnboardingProps {
    type: 'customer' | 'business';
    onComplete?: () => void;
    storageKey?: string;
}

export function TarsOnboarding({ type, onComplete, storageKey }: TarsOnboardingProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState<string[]>([]);
    const { openTars } = useTars();

    const steps = type === 'business' ? BUSINESS_ONBOARDING_STEPS : CUSTOMER_ONBOARDING_STEPS;
    const step = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    // Check if onboarding was already completed
    useEffect(() => {
        const key = storageKey || `tars-onboarding-${type}`;
        const isCompleted = localStorage.getItem(key);
        if (!isCompleted) {
            // Delay showing onboarding for better UX
            const timeout = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [type, storageKey]);

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
        const key = storageKey || `tars-onboarding-${type}`;
        localStorage.setItem(key, 'true');
        setIsVisible(false);
        onComplete?.();
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleAskTars = (query: string) => {
        openTars({
            context: type === 'business' ? 'business' : 'general',
            initialMessage: query,
        });
        handleComplete();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-900 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Header */}
                <div className="p-6 pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
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
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-purple-400 font-medium mb-1">TARS</p>
                                <p className="text-sm text-white/80 leading-relaxed">{step.tarsMessage}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action button */}
                    {step.action && (
                        <button
                            onClick={() => handleAskTars(step.action!.query)}
                            className="mt-4 w-full px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 text-sm transition-colors flex items-center justify-center gap-2"
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
                                className={`w-2 h-2 rounded-full transition-all ${i === currentStep
                                        ? 'bg-purple-500 w-4'
                                        : completed.includes(s.id)
                                            ? 'bg-emerald-500'
                                            : 'bg-white/20'
                                    }`}
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
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
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
    const { openTars } = useTars();

    useEffect(() => {
        // Check if we should show welcome back
        const lastVisit = localStorage.getItem('tars-last-visit');
        const now = Date.now();

        if (lastVisit) {
            const daysSince = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
            if (daysSince > 1) {
                setIsVisible(true);
            }
        }

        localStorage.setItem('tars-last-visit', now.toString());
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 right-6 z-40 animate-fade-in max-w-[280px]">
            <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-xl p-4">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 p-1 text-white/40 hover:text-white rounded"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-white/90 leading-relaxed pr-4">
                            {userName
                                ? `Welcome back, ${userName}! Ready to discover something new?`
                                : "Welcome back! Need help finding something today?"
                            }
                        </p>
                        <button
                            onClick={() => {
                                openTars({ context: 'general' });
                                setIsVisible(false);
                            }}
                            className="mt-2 text-xs text-purple-300 hover:text-white flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" />
                            What's new?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
