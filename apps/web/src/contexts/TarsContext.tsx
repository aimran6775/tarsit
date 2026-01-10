'use client';

import {
  ALL_PERSONAS,
  TarsPersona,
  TarsPersonaConfig,
  generateGreeting,
} from '@/lib/tars/personas';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

type TarsContextMode =
  | 'general'
  | 'help'
  | 'business'
  | 'business-dashboard'
  | 'booking'
  | 'search'
  | 'analytics'
  | 'messages'
  | 'schedule';

interface TarsContextType {
  // State
  isOpen: boolean;
  context: TarsContextMode;
  businessId?: string;
  businessName?: string;
  pageContext?: string;
  initialMessage?: string;

  // Persona System
  persona: TarsPersona;
  personaConfig: TarsPersonaConfig;
  greeting: string;

  // Actions
  openTars: (options?: {
    context?: TarsContextMode;
    businessId?: string;
    businessName?: string;
    pageContext?: string;
    initialMessage?: string;
  }) => void;
  closeTars: () => void;
  toggleTars: () => void;
  setPageContext: (context: string) => void;
  refreshGreeting: () => void;
}

const TarsContext = createContext<TarsContextType | undefined>(undefined);

export function TarsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<TarsContextMode>('general');
  const [businessId, setBusinessId] = useState<string | undefined>();
  const [businessName, setBusinessName] = useState<string | undefined>();
  const [pageContext, setPageContextState] = useState<string | undefined>();
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  // Persona state
  const [persona, setPersona] = useState<TarsPersona>('guest');
  const [greeting, setGreeting] = useState<string>('');

  // Derive persona from auth state
  useEffect(() => {
    const isBusinessDashboard =
      pageContext?.includes('business-dashboard') || pageContext?.includes('business/dashboard');

    const newPersona = isAuthenticated
      ? user?.role === 'BUSINESS_OWNER' || isBusinessDashboard
        ? 'business'
        : 'customer'
      : 'guest';

    setPersona(newPersona);
  }, [isAuthenticated, user?.role, pageContext]);

  // Generate greeting when persona changes or on refresh
  const refreshGreeting = useCallback(() => {
    const config = ALL_PERSONAS[persona];
    const hasVisited = localStorage.getItem(`tars-visited-${persona}`);

    const newGreeting = generateGreeting(config, {
      userName: user?.firstName || user?.username,
      isFirstTime: !hasVisited,
      isReturning: !!hasVisited,
    });

    setGreeting(newGreeting);

    // Mark as visited
    if (!hasVisited) {
      localStorage.setItem(`tars-visited-${persona}`, 'true');
    }
  }, [persona, user]);

  // Refresh greeting when persona changes
  useEffect(() => {
    refreshGreeting();
  }, [persona, refreshGreeting]);

  const openTars = useCallback(
    (options?: {
      context?: TarsContextMode;
      businessId?: string;
      businessName?: string;
      pageContext?: string;
      initialMessage?: string;
    }) => {
      if (options?.context) setContext(options.context);
      if (options?.businessId) setBusinessId(options.businessId);
      if (options?.businessName) setBusinessName(options.businessName);
      if (options?.pageContext) setPageContextState(options.pageContext);
      if (options?.initialMessage) setInitialMessage(options.initialMessage);
      setIsOpen(true);
    },
    []
  );

  const closeTars = useCallback(() => {
    setIsOpen(false);
    setInitialMessage(undefined);
  }, []);

  const toggleTars = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setInitialMessage(undefined);
    }
  }, [isOpen]);

  const setPageContext = useCallback((ctx: string) => {
    setPageContextState(ctx);

    // Update context based on page
    if (ctx.includes('business-dashboard') || ctx.includes('business/dashboard')) {
      // Business owner on dashboard - could be analytics, messages, schedule
      if (ctx.includes('analytics')) {
        setContext('analytics');
      } else if (ctx.includes('messages')) {
        setContext('messages');
      } else if (ctx.includes('schedule') || ctx.includes('appointments')) {
        setContext('schedule');
      } else {
        setContext('business');
      }
    } else if (ctx.includes('booking')) {
      setContext('booking');
    } else if (ctx.includes('search')) {
      setContext('search');
    } else if (ctx.includes('help')) {
      setContext('help');
    } else {
      setContext('general');
    }
  }, []);

  // Get current persona config
  const personaConfig = ALL_PERSONAS[persona];

  return (
    <TarsContext.Provider
      value={{
        isOpen,
        context,
        businessId,
        businessName,
        pageContext,
        initialMessage,
        persona,
        personaConfig,
        greeting,
        openTars,
        closeTars,
        toggleTars,
        setPageContext,
        refreshGreeting,
      }}
    >
      {children}
    </TarsContext.Provider>
  );
}

export function useTars() {
  const context = useContext(TarsContext);
  if (!context) {
    throw new Error('useTars must be used within a TarsProvider');
  }
  return context;
}
