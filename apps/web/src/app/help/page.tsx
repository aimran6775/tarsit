'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    ChevronRight,
    ChevronDown,
    MessageCircle,
    Calendar,
    Shield,
    Building2,
    Mail,
    ArrowLeft,
    Bot,
    Sparkles,
    Zap,
    BookOpen,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { useTars } from '@/contexts/TarsContext';

const faqs = [
    {
        category: 'Getting Started',
        icon: Zap,
        color: 'from-emerald-500 to-teal-600',
        description: 'New to Tarsit? Start here',
        questions: [
            {
                q: 'How do I create an account?',
                a: 'Click "Sign up" in the top right corner and fill in your details. You can sign up with your email address. Once registered, you can start discovering businesses and booking appointments.',
            },
            {
                q: 'Is Tarsit free to use?',
                a: 'Yes! Tarsit is completely free for customers. You can browse businesses, read reviews, save favorites, and book appointments without any charges.',
            },
            {
                q: 'How do I find businesses near me?',
                a: 'Use the search bar on the homepage to search by service type or business name. You can also filter by location, category, and ratings to find the perfect match.',
            },
        ],
    },
    {
        category: 'Appointments',
        icon: Calendar,
        color: 'from-blue-500 to-indigo-600',
        description: 'Everything about booking',
        questions: [
            {
                q: 'How do I book an appointment?',
                a: 'Find a business you like, click on their profile, and look for the "Book Appointment" button. Select your preferred service, date, and time slot, then confirm your booking.',
            },
            {
                q: 'Can I cancel or reschedule my appointment?',
                a: 'Yes, you can manage your appointments from your Dashboard. Go to the Appointments tab and click on the appointment you want to modify. Cancellation policies may vary by business.',
            },
            {
                q: 'Will I get a reminder before my appointment?',
                a: "Yes! You'll receive email reminders before your appointment. You can customize your notification preferences in Settings.",
            },
        ],
    },
    {
        category: 'Messaging',
        icon: MessageCircle,
        color: 'from-purple-500 to-violet-600',
        description: 'Chat with businesses',
        questions: [
            {
                q: 'How do I contact a business?',
                a: 'Visit the business profile and click "Message" to start a conversation. You can ask questions, request quotes, or discuss your needs directly with the business owner.',
            },
            {
                q: 'Are my messages private?',
                a: 'Yes, all messages are private between you and the business. We use encryption to keep your conversations secure.',
            },
        ],
    },
    {
        category: 'Account & Security',
        icon: Shield,
        color: 'from-red-500 to-rose-600',
        description: 'Keep your account safe',
        questions: [
            {
                q: 'How do I change my password?',
                a: 'Go to Settings > Password from your account menu. Enter your current password and set a new one. Make sure to use a strong password with a mix of letters, numbers, and symbols.',
            },
            {
                q: 'How do I delete my account?',
                a: 'You can delete your account from Settings > Delete Account. Please note this action is permanent and cannot be undone. All your data will be permanently removed.',
            },
            {
                q: 'Is my personal information safe?',
                a: 'We take security seriously. Your data is encrypted and we never share your personal information with third parties without your consent.',
            },
        ],
    },
    {
        category: 'For Businesses',
        icon: Building2,
        color: 'from-amber-500 to-orange-600',
        description: 'List and manage your business',
        questions: [
            {
                q: 'How can I list my business on Tarsit?',
                a: 'Click "List your business" in the menu to get started. Fill in your business details, add photos and services, and your listing will be live after verification.',
            },
            {
                q: 'Is there a fee for businesses?',
                a: 'Basic listings are free! We also offer premium features for businesses that want additional visibility and tools.',
            },
        ],
    },
];

// Popular questions users ask
const POPULAR_QUESTIONS = [
    'How do I cancel an appointment?',
    'How do I leave a review?',
    'Is my payment information secure?',
    'How do I contact a business?',
    'How do I update my email?',
    "What if a business doesn't show up?",
];

// Quick Actions
const QUICK_ACTIONS = [
    {
        label: 'Book an appointment',
        icon: Calendar,
        action: 'booking',
        color: 'bg-blue-500/10 text-blue-400',
    },
    {
        label: 'Find a business',
        icon: Search,
        action: 'search',
        color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
        label: 'View my bookings',
        icon: Clock,
        action: 'bookings',
        color: 'bg-purple-500/10 text-purple-400',
    },
    {
        label: 'Contact support',
        icon: MessageCircle,
        action: 'contact',
        color: 'bg-amber-500/10 text-amber-400',
    },
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>('Getting Started');
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
    const { openTars } = useTars();

    // Filter FAQs based on search
    const filteredFaqs = searchQuery
        ? faqs
            .map((category) => ({
                ...category,
                questions: category.questions.filter(
                    (q) =>
                        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        q.a.toLowerCase().includes(searchQuery.toLowerCase())
                ),
            }))
            .filter((category) => category.questions.length > 0)
        : faqs;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            openTars({
                context: 'help',
                initialMessage: searchQuery,
            });
        }
    };

    const handleQuickQuestion = (question: string) => {
        openTars({
            context: 'help',
            initialMessage: question,
        });
    };

    const handleQuickAction = (action: string) => {
        const actionMessages: Record<string, string> = {
            booking: 'I want to book an appointment',
            search: 'Help me find a business',
            bookings: 'Show me my upcoming bookings',
            contact: 'I need to speak to a human support agent',
        };
        openTars({
            context: 'help',
            initialMessage: actionMessages[action] || 'I need help',
        });
    };

    return (
        <div className="min-h-screen bg-neutral-950">
            {/* Hero Section with TARS Integration */}
            <section className="relative py-20 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />

                <div className="relative container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        {/* Back link */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to home
                        </Link>

                        {/* TARS Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6 ml-4">
                            <Bot className="w-4 h-4" />
                            <span>AI-Powered Help Center</span>
                            <Sparkles className="w-4 h-4" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            How can we help you?
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            Get instant answers from TARS, our AI assistant, or browse through our help articles.
                        </p>
                    </div>

                    {/* Main Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Describe your issue or ask a question..."
                                className="w-full px-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-lg"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <Bot className="w-4 h-4" />
                                Ask TARS
                            </button>
                        </div>
                    </form>

                    {/* Popular Questions */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                        {POPULAR_QUESTIONS.map((question, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickQuestion(question)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white/70 hover:text-white transition-colors"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="py-12 border-y border-white/5">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {QUICK_ACTIONS.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickAction(action.action)}
                                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors group"
                            >
                                <div
                                    className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}
                                >
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                                    {action.label}
                                </span>
                                <ChevronRight className="w-4 h-4 text-white/30 inline ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* TARS Feature Banner */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="relative bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-3xl p-8 md:p-12 border border-purple-500/20 overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full" />

                        <div className="relative flex flex-col md:flex-row items-center gap-8">
                            {/* TARS Icon */}
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-12 h-12 text-white" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    Meet TARS - Your AI Assistant
                                </h2>
                                <p className="text-white/60 mb-4 max-w-xl">
                                    TARS is our AI assistant inspired by the movie Interstellar. With 75% humor and 95%
                                    honesty, TARS can help you with anything - from finding businesses to managing your
                                    bookings.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                    <button
                                        onClick={() => openTars({ context: 'help' })}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Chat with TARS
                                    </button>
                                    <div className="flex items-center gap-4 text-sm text-white/50">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                            24/7 Available
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                            Instant Responses
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Help Categories with TARS Integration */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse Help Topics</h2>

                    <div className="space-y-4">
                        {filteredFaqs.map((category) => (
                            <div
                                key={category.category}
                                id={category.category.toLowerCase().replace(/\s+/g, '-')}
                                className="bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                {/* Category Header */}
                                <button
                                    onClick={() =>
                                        setExpandedCategory(
                                            expandedCategory === category.category ? null : category.category
                                        )
                                    }
                                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                                    >
                                        <category.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                                        <p className="text-sm text-white/50">{category.description}</p>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-white/50 transition-transform ${expandedCategory === category.category ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {/* Questions */}
                                {expandedCategory === category.category && (
                                    <div className="border-t border-white/10">
                                        {category.questions.map((item, index) => (
                                            <div key={index} className="border-b border-white/5 last:border-0">
                                                <button
                                                    onClick={() =>
                                                        setExpandedQuestion(expandedQuestion === item.q ? null : item.q)
                                                    }
                                                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                                                >
                                                    <ChevronRight
                                                        className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${expandedQuestion === item.q ? 'rotate-90' : ''
                                                            }`}
                                                    />
                                                    <span className="text-white">{item.q}</span>
                                                </button>
                                                {expandedQuestion === item.q && (
                                                    <div className="px-4 pb-4 pl-11">
                                                        <p className="text-white/60 text-sm leading-relaxed mb-3">{item.a}</p>
                                                        <button
                                                            onClick={() => handleQuickQuestion(item.q)}
                                                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                        >
                                                            <Bot className="w-4 h-4" />
                                                            Ask TARS more about this
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Ask TARS about this category */}
                                        <div className="p-4 bg-purple-500/5">
                                            <button
                                                onClick={() =>
                                                    handleQuickQuestion(`Tell me more about ${category.category.toLowerCase()}`)
                                                }
                                                className="w-full px-4 py-2 border border-purple-500/30 hover:bg-purple-500/10 rounded-lg text-sm text-purple-400 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Bot className="w-4 h-4" />
                                                Ask TARS about {category.category.toLowerCase()}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 border-t border-white/5">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-white mb-2">Still Need Help?</h2>
                        <p className="text-white/60">TARS couldn't solve your problem? We're here to help.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Chat with TARS */}
                        <button
                            onClick={() =>
                                openTars({ context: 'help', initialMessage: 'I need more help with something' })
                            }
                            className="p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-colors group text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-semibold text-white mb-1">Chat with TARS</h3>
                            <p className="text-sm text-white/50">Get instant AI assistance</p>
                        </button>

                        {/* Email Support */}
                        <a
                            href="mailto:support@tarsit.com"
                            className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors group text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-7 h-7 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-white mb-1">Email Us</h3>
                            <p className="text-sm text-white/50">support@tarsit.com</p>
                        </a>

                        {/* Help Guides */}
                        <Link
                            href="/guides"
                            className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors group text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-white mb-1">Help Guides</h3>
                            <p className="text-sm text-white/50">Detailed tutorials & guides</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
