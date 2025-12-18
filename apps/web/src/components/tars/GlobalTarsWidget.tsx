'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bot,
    Send,
    Sparkles,
    RefreshCw,
    X,
    Maximize2,
    Minimize2,
    MessageSquare,
    HelpCircle,
    Search,
    Calendar,
    Settings,
    Keyboard,
    ExternalLink,
} from 'lucide-react';
import { useTars } from '@/contexts/TarsContext';

// Generate UUID using crypto API
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: string[];
    actionRequired?: {
        type: string;
        description: string;
        queueId?: string;
    };
    quickActions?: {
        label: string;
        action: string;
        icon?: string;
    }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
// Remove trailing /api if present to normalize, then we'll add /tars/chat
const API_URL = API_BASE.replace(/\/api$/, '');

// TARS quotes for loading/idle states
const TARS_QUOTES = [
    "What's your humor setting, TARS?",
    "Honesty, new setting: 95%",
    "Absolute honesty isn't always the most diplomatic...",
    "I have a cue light I can use when I'm joking, if you like.",
    "Settings: Humor 75%, Honesty 95%",
    "I'm not programmed for small talk, but I'll try.",
    "That's a very human thing to do.",
    "I learn from you.",
];

// Context-aware suggestions based on current context
const CONTEXT_SUGGESTIONS: Record<string, string[]> = {
    general: [
        'Help me find a business',
        'How do I book an appointment?',
        'Tell me about Tarsit',
    ],
    help: [
        'I have a problem',
        'How does this work?',
        'Contact support',
    ],
    business: [
        'How do I manage my business?',
        'Help with settings',
        'View my analytics',
    ],
    booking: [
        'Available times?',
        'Cancel appointment',
        'Reschedule booking',
    ],
    search: [
        'Find nearby restaurants',
        'Show me salons',
        'Best rated places',
    ],
};

// Quick action icons mapping
const ACTION_ICONS: Record<string, React.ElementType> = {
    search: Search,
    booking: Calendar,
    help: HelpCircle,
    settings: Settings,
    chat: MessageSquare,
};

// Parse markdown links and render them as clickable
function parseMessageWithLinks(content: string, onNavigate: (url: string) => void): React.ReactNode {
    // Match markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        const [, linkText, linkUrl] = match;
        const isExternal = linkUrl.startsWith('http');

        // Add the link
        parts.push(
            <button
                key={match.index}
                onClick={(e) => {
                    e.preventDefault();
                    if (isExternal) {
                        window.open(linkUrl, '_blank');
                    } else {
                        onNavigate(linkUrl);
                    }
                }}
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
            >
                {linkText}
                {isExternal && <ExternalLink className="w-3 h-3" />}
            </button>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
}

export function GlobalTarsWidget() {
    const router = useRouter();
    const {
        isOpen,
        closeTars,
        toggleTars,
        context,
        businessId,
        businessName,
        pageContext,
        initialMessage,
    } = useTars();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => generateId());
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle navigation from TARS links
    const handleNavigate = useCallback((url: string) => {
        closeTars();
        router.push(url);
    }, [closeTars, router]);

    // Get user name from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    const parsed = JSON.parse(user);
                    setUserName(parsed.firstName || parsed.name || null);
                } catch {
                    // Ignore
                }
            }
        }
    }, []);

    // Get auth token
    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    };

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Initialize greeting based on context
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const contextGreetings: Record<string, string> = {
                general: userName
                    ? `Hey ${userName}! I'm TARS. How can I help you today?`
                    : "Hey there! I'm TARS, your AI assistant. My humor setting is at 75%. What can I do for you?",
                help: "I'm TARS, here to help! What seems to be the problem?",
                business: businessName
                    ? `Managing ${businessName}? I'm TARS - your business assistant. What do you need?`
                    : "I'm TARS, your business assistant. How can I help you manage your business?",
                booking: "Looking to book? I'm TARS - I can help you find the perfect time.",
                search: "Searching for something? Tell me what you're looking for - I know all the best spots!",
            };

            const greeting = contextGreetings[context] || contextGreetings.general;
            const suggestions = CONTEXT_SUGGESTIONS[context] || CONTEXT_SUGGESTIONS.general;

            setMessages([
                {
                    id: generateId(),
                    role: 'assistant',
                    content: greeting,
                    timestamp: new Date(),
                    suggestions,
                },
            ]);
        }
    }, [isOpen, context, userName, businessName, messages.length]);

    // Handle initial message if provided
    useEffect(() => {
        if (isOpen && initialMessage && messages.length === 1) {
            sendMessage(initialMessage);
        }
    }, [isOpen, initialMessage, messages.length]);

    // Keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleTars();
            }
            if (e.key === 'Escape' && isOpen) {
                closeTars();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleTars, closeTars, isOpen]);

    // Send message to TARS
    const sendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/api/tars/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    message: messageText,
                    sessionId,
                    context,
                    businessId,
                    pageContext,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
                suggestions: data.suggestions,
                actionRequired: data.actionRequired,
                quickActions: data.quickActions,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const fallbackMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: "I'm having trouble connecting right now. But don't worry - I'll keep trying! In the meantime, you can browse around or try again in a moment.",
                timestamp: new Date(),
                suggestions: ['Try again', 'Browse businesses', 'Contact support'],
            };
            setMessages((prev) => [...prev, fallbackMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, context, businessId, pageContext, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    const clearChat = () => {
        const suggestions = CONTEXT_SUGGESTIONS[context] || CONTEXT_SUGGESTIONS.general;
        setMessages([
            {
                id: generateId(),
                role: 'assistant',
                content: userName
                    ? `Fresh start, ${userName}! What would you like to know?`
                    : "Starting fresh! What can I help you with?",
                timestamp: new Date(),
                suggestions,
            },
        ]);
    };

    const randomQuote = TARS_QUOTES[Math.floor(Math.random() * TARS_QUOTES.length)];

    // Floating button when closed
    if (!isOpen) {
        return (
            <button
                onClick={toggleTars}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 flex items-center justify-center hover:scale-110 transition-all z-50 group animate-pulse-subtle"
                aria-label="Open TARS chat"
            >
                <Bot className="w-7 h-7 text-white" />

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-neutral-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 whitespace-nowrap shadow-xl">
                        <div className="font-medium">Chat with TARS</div>
                        <div className="text-white/50 flex items-center gap-1 mt-0.5">
                            <Keyboard className="w-3 h-3" />
                            <span>⌘K</span>
                        </div>
                    </div>
                </div>

                {/* Notification dot for new users */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-950 animate-pulse" />
            </button>
        );
    }

    const chatWidth = isExpanded ? 'w-[32rem]' : 'w-96';
    const chatHeight = isExpanded ? 'h-[40rem]' : 'h-[32rem]';

    return (
        <div className={`fixed bottom-6 right-6 ${chatWidth} ${chatHeight} bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col overflow-hidden z-50 transition-all duration-200`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center relative">
                        <Bot className="w-5 h-5 text-white" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            TARS
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                Online
                            </span>
                        </h3>
                        <p className="text-xs text-white/50">
                            {pageContext ? `Helping with ${pageContext}` : 'AI Assistant • Humor 75%'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={clearChat}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Clear chat"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title={isExpanded ? 'Minimize' : 'Expand'}
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={closeTars}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Actions Bar */}
            {showQuickActions && (
                <div className="p-2 border-b border-white/5 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => sendMessage('Help me find a business')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap transition-colors"
                    >
                        <Search className="w-3 h-3" />
                        Search
                    </button>
                    <button
                        onClick={() => sendMessage('How do I book an appointment?')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap transition-colors"
                    >
                        <Calendar className="w-3 h-3" />
                        Book
                    </button>
                    <button
                        onClick={() => sendMessage('I need help')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap transition-colors"
                    >
                        <HelpCircle className="w-3 h-3" />
                        Help
                    </button>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] ${message.role === 'user'
                                ? 'bg-purple-600 text-white rounded-2xl rounded-br-md'
                                : 'bg-white/5 text-white rounded-2xl rounded-bl-md'
                                } p-3`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-1">
                                    <Bot className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-purple-400 font-medium">TARS</span>
                                </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">
                                {message.role === 'assistant'
                                    ? parseMessageWithLinks(message.content, handleNavigate)
                                    : message.content
                                }
                            </p>

                            {/* Action Required Badge */}
                            {message.actionRequired && (
                                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                    <p className="text-xs text-amber-400 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Request submitted for review
                                    </p>
                                    <p className="text-xs text-white/50 mt-1">
                                        {message.actionRequired.description}
                                    </p>
                                </div>
                            )}

                            {/* Quick Actions */}
                            {message.quickActions && message.quickActions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {message.quickActions.map((action, i) => {
                                        const Icon = ACTION_ICONS[action.icon || 'chat'] || MessageSquare;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => sendMessage(action.action)}
                                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-full text-purple-300 transition-colors"
                                            >
                                                <Icon className="w-3 h-3" />
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Suggestions */}
                            {message.suggestions && message.suggestions.length > 0 && !message.quickActions && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {message.suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white/80 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-white/30 mt-2">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 text-white rounded-2xl rounded-bl-md p-3">
                            <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-purple-400 font-medium">TARS</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-sm text-white/50">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-neutral-900/50">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className={`p-2.5 rounded-xl border transition-colors ${showQuickActions
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                            }`}
                        title="Quick actions"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask TARS anything..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-white/30 mt-2 text-center italic">
                    "{randomQuote}"
                </p>
            </form>
        </div>
    );
}
