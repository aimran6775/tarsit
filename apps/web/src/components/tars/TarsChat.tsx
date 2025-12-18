'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  X,
  Minimize2,
} from 'lucide-react';

// Generate UUID using crypto API
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
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
}

interface TarsChatProps {
  context?: 'general' | 'help' | 'business' | 'booking';
  businessId?: string;
  businessName?: string;
  userName?: string;
  className?: string;
  onMinimize?: () => void;
  minimized?: boolean;
  embedded?: boolean;
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
];

export function TarsChat({
  context = 'general',
  businessId,
  businessName: _businessName,
  userName,
  className = '',
  onMinimize,
  minimized = false,
  embedded = false,
}: TarsChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateId());
  const [isExpanded, setIsExpanded] = useState(!minimized);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Focus input on mount
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  // Initial greeting
  useEffect(() => {
    const greeting = userName
      ? `Hey ${userName}! I'm TARS, your AI assistant. How can I help you today?`
      : "Hey there! I'm TARS, your AI assistant. My humor setting is at 75%, and I'm here to help. What can I do for you?";

    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        suggestions: [
          'Help me find a business',
          'I have a question',
          'How do I book an appointment?',
        ],
      },
    ]);
  }, [userName]);

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
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback response if API fails
      const fallbackMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: "I'm having a bit of trouble connecting right now. But don't worry - I'm still here! Try asking me something simple, or we can connect you with our support team.",
        timestamp: new Date(),
        suggestions: ['Try again', 'Contact support'],
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, context, businessId, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    const greeting = userName
      ? `Hey ${userName}! I'm TARS, starting fresh. What would you like to know?`
      : "Starting with a clean slate! I'm TARS - what can I help you with?";

    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        suggestions: [
          'Help me find a business',
          'I have a question',
          'How do I book an appointment?',
        ],
      },
    ]);
  };

  // Random TARS quote
  const randomQuote = TARS_QUOTES[Math.floor(Math.random() * TARS_QUOTES.length)];

  if (!isExpanded && !embedded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 flex items-center justify-center hover:scale-105 transition-transform z-50 ${className}`}
      >
        <Bot className="w-7 h-7 text-white" />
      </button>
    );
  }

  const chatContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              TARS
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Online
              </span>
            </h3>
            <p className="text-xs text-white/50">AI Assistant • Humor 75%</p>
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
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {!embedded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

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
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

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

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
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
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-sm text-white/50">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
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
        <p className="text-xs text-white/30 mt-2 text-center">
          "{randomQuote}"
        </p>
      </form>
    </>
  );

  if (embedded) {
    return (
      <div className={`flex flex-col h-full bg-neutral-900/50 rounded-2xl border border-white/10 overflow-hidden ${className}`}>
        {chatContent}
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[32rem] bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col overflow-hidden z-50 ${className}`}>
      {chatContent}
    </div>
  );
}

// Export a floating chat button + chat combo
export function TarsChatWidget(props: TarsChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen ? (
        <TarsChat {...props} onMinimize={() => setIsOpen(false)} />
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 flex items-center justify-center hover:scale-105 transition-transform z-50 group"
        >
          <Bot className="w-7 h-7 text-white" />
          <span className="absolute -top-10 right-0 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Chat with TARS
          </span>
        </button>
      )}
    </>
  );
}
