'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TarsContextType {
    isOpen: boolean;
    context: 'general' | 'help' | 'business' | 'booking' | 'search';
    businessId?: string;
    businessName?: string;
    pageContext?: string;
    openTars: (options?: {
        context?: 'general' | 'help' | 'business' | 'booking' | 'search';
        businessId?: string;
        businessName?: string;
        pageContext?: string;
        initialMessage?: string;
    }) => void;
    closeTars: () => void;
    toggleTars: () => void;
    setPageContext: (context: string) => void;
    initialMessage?: string;
}

const TarsContext = createContext<TarsContextType | undefined>(undefined);

export function TarsProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [context, setContext] = useState<'general' | 'help' | 'business' | 'booking' | 'search'>('general');
    const [businessId, setBusinessId] = useState<string | undefined>();
    const [businessName, setBusinessName] = useState<string | undefined>();
    const [pageContext, setPageContextState] = useState<string | undefined>();
    const [initialMessage, setInitialMessage] = useState<string | undefined>();

    const openTars = useCallback((options?: {
        context?: 'general' | 'help' | 'business' | 'booking' | 'search';
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
    }, []);

    const closeTars = useCallback(() => {
        setIsOpen(false);
        setInitialMessage(undefined);
    }, []);

    const toggleTars = useCallback(() => {
        setIsOpen(prev => !prev);
        if (isOpen) {
            setInitialMessage(undefined);
        }
    }, [isOpen]);

    const setPageContext = useCallback((ctx: string) => {
        setPageContextState(ctx);
        // Update context based on page
        if (ctx.includes('business')) {
            setContext('business');
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

    return (
        <TarsContext.Provider value={{
            isOpen,
            context,
            businessId,
            businessName,
            pageContext,
            openTars,
            closeTars,
            toggleTars,
            setPageContext,
            initialMessage,
        }}>
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
