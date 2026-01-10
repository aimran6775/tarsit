'use client';

import { useState, useEffect, useCallback } from 'react';

interface TarsPreferences {
    humorLevel: number; // 0-100
    responseStyle: 'concise' | 'detailed' | 'friendly';
    proactiveHelp: boolean;
    showOnboarding: boolean;
    rememberedTopics: string[];
}

const DEFAULT_PREFERENCES: TarsPreferences = {
    humorLevel: 75,
    responseStyle: 'friendly',
    proactiveHelp: true,
    showOnboarding: true,
    rememberedTopics: [],
};

const STORAGE_KEY = 'tars-preferences';

export function useTarsPreferences() {
    const [preferences, setPreferences] = useState<TarsPreferences>(DEFAULT_PREFERENCES);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load preferences from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load TARS preferences:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save preferences to localStorage
    const savePreferences = useCallback((updates: Partial<TarsPreferences>) => {
        setPreferences(prev => {
            const newPrefs = { ...prev, ...updates };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
            } catch (error) {
                console.error('Failed to save TARS preferences:', error);
            }
            return newPrefs;
        });
    }, []);

    // Reset to defaults
    const resetPreferences = useCallback(() => {
        setPreferences(DEFAULT_PREFERENCES);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
        } catch (error) {
            console.error('Failed to reset TARS preferences:', error);
        }
    }, []);

    // Add a remembered topic
    const addRememberedTopic = useCallback((topic: string) => {
        setPreferences(prev => {
            const topics = [...new Set([...prev.rememberedTopics, topic])].slice(-10); // Keep last 10
            const newPrefs = { ...prev, rememberedTopics: topics };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
            return newPrefs;
        });
    }, []);

    return {
        preferences,
        isLoaded,
        savePreferences,
        resetPreferences,
        addRememberedTopic,
    };
}

// Hook for TARS conversation history (client-side cache)
interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ConversationCache {
    [sessionId: string]: ConversationMessage[];
}

const CONVERSATION_CACHE_KEY = 'tars-conversations';
const MAX_CACHED_CONVERSATIONS = 5;
const MAX_MESSAGES_PER_CONVERSATION = 50;

export function useTarsConversationCache(sessionId: string) {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);

    // Load cached conversation
    useEffect(() => {
        try {
            const cached = localStorage.getItem(CONVERSATION_CACHE_KEY);
            if (cached) {
                const conversations: ConversationCache = JSON.parse(cached);
                if (conversations[sessionId]) {
                    setMessages(conversations[sessionId].map(m => ({
                        ...m,
                        timestamp: new Date(m.timestamp),
                    })));
                }
            }
        } catch (error) {
            console.error('Failed to load conversation cache:', error);
        }
    }, [sessionId]);

    // Add message to cache
    const addMessage = useCallback((message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
        const newMessage: ConversationMessage = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        };

        setMessages(prev => {
            const updated = [...prev, newMessage].slice(-MAX_MESSAGES_PER_CONVERSATION);

            try {
                const cached = localStorage.getItem(CONVERSATION_CACHE_KEY);
                const conversations: ConversationCache = cached ? JSON.parse(cached) : {};
                conversations[sessionId] = updated;

                // Prune old conversations
                const keys = Object.keys(conversations);
                if (keys.length > MAX_CACHED_CONVERSATIONS) {
                    const oldest = keys.slice(0, keys.length - MAX_CACHED_CONVERSATIONS);
                    oldest.forEach(key => delete conversations[key]);
                }

                localStorage.setItem(CONVERSATION_CACHE_KEY, JSON.stringify(conversations));
            } catch (error) {
                console.error('Failed to cache conversation:', error);
            }

            return updated;
        });

        return newMessage;
    }, [sessionId]);

    // Clear conversation
    const clearConversation = useCallback(() => {
        setMessages([]);
        try {
            const cached = localStorage.getItem(CONVERSATION_CACHE_KEY);
            if (cached) {
                const conversations: ConversationCache = JSON.parse(cached);
                delete conversations[sessionId];
                localStorage.setItem(CONVERSATION_CACHE_KEY, JSON.stringify(conversations));
            }
        } catch (error) {
            console.error('Failed to clear conversation:', error);
        }
    }, [sessionId]);

    return {
        messages,
        addMessage,
        clearConversation,
    };
}

// Hook for tracking TARS interactions for analytics
interface TarsAnalytics {
    totalConversations: number;
    totalMessages: number;
    averageConversationLength: number;
    topTopics: string[];
    lastInteraction: Date | null;
}

export function useTarsAnalytics() {
    const [analytics, setAnalytics] = useState<TarsAnalytics>({
        totalConversations: 0,
        totalMessages: 0,
        averageConversationLength: 0,
        topTopics: [],
        lastInteraction: null,
    });

    useEffect(() => {
        // Load analytics from localStorage
        try {
            const stored = localStorage.getItem('tars-analytics');
            if (stored) {
                const parsed = JSON.parse(stored);
                setAnalytics({
                    ...parsed,
                    lastInteraction: parsed.lastInteraction ? new Date(parsed.lastInteraction) : null,
                });
            }
        } catch (error) {
            console.error('Failed to load TARS analytics:', error);
        }
    }, []);

    const trackInteraction = useCallback((data: { topic?: string; messageCount?: number }) => {
        setAnalytics(prev => {
            const updated: TarsAnalytics = {
                ...prev,
                totalMessages: prev.totalMessages + (data.messageCount || 1),
                lastInteraction: new Date(),
            };

            if (data.topic) {
                const topics = [...prev.topTopics.filter(t => t !== data.topic), data.topic].slice(-5);
                updated.topTopics = topics;
            }

            try {
                localStorage.setItem('tars-analytics', JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to save TARS analytics:', error);
            }

            return updated;
        });
    }, []);

    const trackNewConversation = useCallback(() => {
        setAnalytics(prev => {
            const updated: TarsAnalytics = {
                ...prev,
                totalConversations: prev.totalConversations + 1,
            };

            try {
                localStorage.setItem('tars-analytics', JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to save TARS analytics:', error);
            }

            return updated;
        });
    }, []);

    return {
        analytics,
        trackInteraction,
        trackNewConversation,
    };
}
