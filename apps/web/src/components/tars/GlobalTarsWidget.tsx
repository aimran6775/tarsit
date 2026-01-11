'use client';

import { useTars } from '@/contexts/TarsContext';
import { useAuth } from '@/contexts/auth-context';
import { TarsPersona } from '@/lib/tars/personas';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    CalendarDays,
    Clock,
    Compass,
    ExternalLink,
    Grid3X3,
    Heart,
    HelpCircle,
    Keyboard,
    Maximize2,
    MessageSquare,
    Minimize2,
    RefreshCw,
    Search,
    Send,
    Settings,
    Sparkles,
    Terminal,
    UserPlus,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
// Normalize: remove trailing /api or /api/ to get base URL, then we'll add /api/tars/chat
const API_URL = API_BASE.replace(/\/api\/?$/, '');

// TARS quotes per persona
const TARS_QUOTES: Record<TarsPersona, string[]> = {
  guest: [
    'Discovering local gems since... well, recently!',
    'Ready to find your next favorite spot?',
    'Think of me as your local business GPS.',
    'Every great discovery starts with a search.',
    'The best places are just a conversation away.',
  ],
  customer: [
    "What's your humor setting, TARS?",
    'Honesty, new setting: 95%',
    "I have a cue light I can use when I'm joking, if you like.",
    'Settings: Humor 75%, Honesty 95%',
    'I learn from you.',
  ],
  business: [
    "Let's turn data into action.",
    'Every insight is an opportunity.',
    'Business intelligence, minus the buzzwords.',
    'Numbers tell stories. Let me translate.',
    'Optimizing your success, one insight at a time.',
  ],
};

// Persona-specific icons
const PERSONA_ICONS = {
  guest: Compass,
  customer: Sparkles,
  business: Terminal,
};

// Quick action icons mapping
const ACTION_ICONS: Record<string, React.ElementType> = {
  search: Search,
  Search: Search,
  booking: Calendar,
  Calendar: Calendar,
  CalendarDays: CalendarDays,
  help: HelpCircle,
  HelpCircle: HelpCircle,
  settings: Settings,
  Settings: Settings,
  chat: MessageSquare,
  MessageSquare: MessageSquare,
  Heart: Heart,
  Clock: Clock,
  BarChart3: BarChart3,
  Grid3X3: Grid3X3,
  UserPlus: UserPlus,
};

// Parse markdown links and render them as clickable
function parseMessageWithLinks(
  content: string,
  onNavigate: (url: string) => void,
  accentColor: string
): React.ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const [, linkText, linkUrl] = match;
    const isExternal = linkUrl.startsWith('http');

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
        className="inline-flex items-center gap-1 underline underline-offset-2 transition-colors hover:opacity-80"
        style={{ color: accentColor }}
      >
        {linkText}
        {isExternal && <ExternalLink className="w-3 h-3" />}
      </button>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

export function GlobalTarsWidget() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    isOpen,
    closeTars,
    toggleTars,
    context,
    businessId,
    pageContext,
    initialMessage,
    persona,
    personaConfig,
    greeting,
    refreshGreeting,
  } = useTars();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateId());
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get persona icon
  const PersonaIcon = PERSONA_ICONS[persona];
  const colors = personaConfig.colors;

  // Handle navigation from TARS links
  const handleNavigate = useCallback(
    (url: string) => {
      closeTars();
      router.push(url);
    },
    [closeTars, router]
  );

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

  // Initialize greeting based on persona
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: greeting,
          timestamp: new Date(),
          suggestions: personaConfig.suggestions,
        },
      ]);
    }
  }, [isOpen, greeting, personaConfig.suggestions, messages.length]);

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
  const sendMessage = useCallback(
    async (messageText: string) => {
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
            persona, // Include persona in request
            userName: user?.firstName || user?.username,
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
          content:
            personaConfig.id === 'business'
              ? 'Connection issue. Please retry or contact support if this persists.'
              : "I'm having trouble connecting right now. But don't worry - I'll keep trying! In the meantime, you can browse around or try again in a moment.",
          timestamp: new Date(),
          suggestions: personaConfig.suggestions.slice(0, 3),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, context, businessId, pageContext, isLoading, persona, user, personaConfig]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    refreshGreeting();
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content:
          personaConfig.id === 'business'
            ? 'Fresh start. What do you need?'
            : user?.firstName
              ? `Fresh start, ${user.firstName}! What would you like to know?`
              : 'Starting fresh! What can I help you with?',
        timestamp: new Date(),
        suggestions: personaConfig.suggestions,
      },
    ]);
  };

  const quotes = TARS_QUOTES[persona];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Floating button when closed
  if (!isOpen) {
    return (
      <motion.button
        drag
        dragConstraints={{ top: -200, bottom: 100, left: -200, right: 50 }}
        dragElastic={0.1}
        whileDrag={{ scale: 1.1 }}
        onClick={toggleTars}
        className={cn(
          'fixed bottom-20 right-6 md:bottom-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center',
          'hover:scale-110 transition-all z-50 group cursor-grab active:cursor-grabbing'
        )}
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          boxShadow: `0 10px 40px ${colors.primary}40`,
        }}
        aria-label="Open TARS chat"
      >
        <PersonaIcon className="w-7 h-7 text-white" />

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-neutral-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 whitespace-nowrap shadow-xl">
            <div className="font-medium">Chat with TARS</div>
            <div className="text-white/50 text-[10px] mt-0.5">{personaConfig.tagline}</div>
            <div className="text-white/50 flex items-center gap-1 mt-0.5">
              <Keyboard className="w-3 h-3" />
              <span>⌘K</span>
            </div>
          </div>
        </div>

        {/* Status dot */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-950 animate-pulse" />
      </motion.button>
    );
  }

  const chatWidth = isExpanded ? 'w-[32rem]' : 'w-96';
  const chatHeight = isExpanded ? 'h-[40rem]' : 'h-[32rem]';

  return (
    <div
      className={`fixed bottom-20 right-6 md:bottom-6 ${chatWidth} ${chatHeight} bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col overflow-hidden z-50 transition-all duration-200`}
    >
      {/* Header - Persona-styled */}
      <div
        className="flex items-center justify-between p-4 border-b border-white/10"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            }}
          >
            <PersonaIcon className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              TARS
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${colors.primary}30`,
                  color: colors.secondary,
                }}
              >
                {persona === 'guest' ? 'Guide' : persona === 'customer' ? 'Concierge' : 'Co-Pilot'}
              </span>
            </h3>
            <p className="text-xs text-white/50">{personaConfig.tagline}</p>
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

      {/* Quick Actions Bar - Persona-specific */}
      {showQuickActions && (
        <div className="p-2 border-b border-white/5 flex gap-2 overflow-x-auto">
          {personaConfig.quickActions.slice(0, 4).map((action, i) => {
            const Icon = ACTION_ICONS[action.icon] || MessageSquare;
            return (
              <button
                key={i}
                onClick={() => sendMessage(action.label)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap transition-colors"
              >
                <Icon className="w-3 h-3" />
                {action.label}
              </button>
            );
          })}
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
              className={cn(
                'max-w-[85%] p-3',
                message.role === 'user'
                  ? 'bg-neutral-800 text-white rounded-2xl rounded-br-md'
                  : 'bg-white/5 text-white rounded-2xl rounded-bl-md'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <PersonaIcon className="w-4 h-4" style={{ color: colors.primary }} />
                  <span className="text-xs font-medium" style={{ color: colors.primary }}>
                    TARS
                  </span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">
                {message.role === 'assistant'
                  ? parseMessageWithLinks(message.content, handleNavigate, colors.primary)
                  : message.content}
              </p>

              {/* Action Required Badge */}
              {message.actionRequired && (
                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Request submitted for review
                  </p>
                  <p className="text-xs text-white/50 mt-1">{message.actionRequired.description}</p>
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
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
                        style={{
                          backgroundColor: `${colors.primary}20`,
                          color: colors.secondary,
                        }}
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
                <PersonaIcon className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-xs font-medium" style={{ color: colors.primary }}>
                  TARS
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: colors.primary, animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: colors.primary, animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: colors.primary, animationDelay: '300ms' }}
                  />
                </div>
                <span className="text-sm text-white/50">
                  {persona === 'business' ? 'Processing...' : 'Thinking...'}
                </span>
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
            className={cn(
              'p-2.5 rounded-xl border transition-colors',
              showQuickActions
                ? 'border-opacity-50'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
            )}
            style={
              showQuickActions
                ? {
                    backgroundColor: `${colors.primary}20`,
                    borderColor: `${colors.primary}50`,
                    color: colors.primary,
                  }
                : undefined
            }
            title="Quick actions"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              persona === 'business' ? 'Ask about your business...' : 'Ask TARS anything...'
            }
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none disabled:opacity-50"
            style={{
              borderColor: input ? `${colors.primary}50` : undefined,
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-white/30 mt-2 text-center italic">"{randomQuote}"</p>
      </form>
    </div>
  );
}
