'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useTars } from '@/contexts/TarsContext';

interface TriggerCondition {
    type: 'idle' | 'scroll-stuck' | 'form-abandon' | 'error-page' | 'rage-click' | 'search-empty' | 'booking-stuck';
    threshold: number; // milliseconds or count
    message: string;
    context?: 'general' | 'help' | 'business' | 'booking' | 'search';
}

// Define trigger conditions
const TRIGGER_CONDITIONS: TriggerCondition[] = [
    {
        type: 'idle',
        threshold: 30000, // 30 seconds of inactivity
        message: "Looks like you might need some help. I'm TARS - want me to assist you?",
        context: 'general',
    },
    {
        type: 'scroll-stuck',
        threshold: 15000, // 15 seconds on same scroll position
        message: "Having trouble finding what you're looking for? Let me help!",
        context: 'search',
    },
    {
        type: 'rage-click',
        threshold: 5, // 5 rapid clicks
        message: "I noticed you're clicking quite a bit. Is something not working? I can help troubleshoot.",
        context: 'help',
    },
    {
        type: 'search-empty',
        threshold: 3, // 3 empty searches
        message: "Having trouble finding results? Tell me what you're looking for - I might have some suggestions!",
        context: 'search',
    },
    {
        type: 'booking-stuck',
        threshold: 45000, // 45 seconds on booking page
        message: "Need help completing your booking? I can walk you through the process!",
        context: 'booking',
    },
];

interface UseTarsTriggersOptions {
    enabled?: boolean;
    pageContext?: string;
    businessId?: string;
    businessName?: string;
}

export function useTarsTriggers(options: UseTarsTriggersOptions = {}) {
    const { enabled = true, pageContext, businessId, businessName } = options;
    const { openTars, isOpen } = useTars();

    const [hasTriggered, setHasTriggered] = useState(false);
    const lastActivityRef = useRef(Date.now());
    const clickTimestampsRef = useRef<number[]>([]);
    const emptySearchCountRef = useRef(0);
    const bookingStartRef = useRef<number | null>(null);

    // Reset trigger state when chat opens
    useEffect(() => {
        if (isOpen) {
            setHasTriggered(true);
        }
    }, [isOpen]);

    // Track user activity
    const trackActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
    }, []);

    // Track clicks for rage detection
    const trackClick = useCallback(() => {
        const now = Date.now();
        clickTimestampsRef.current.push(now);

        // Keep only clicks from last 2 seconds
        clickTimestampsRef.current = clickTimestampsRef.current.filter(
            ts => now - ts < 2000
        );

        // Check for rage clicks (5+ clicks in 2 seconds)
        if (clickTimestampsRef.current.length >= 5 && !hasTriggered && !isOpen && enabled) {
            const trigger = TRIGGER_CONDITIONS.find(t => t.type === 'rage-click');
            if (trigger) {
                openTars({
                    context: trigger.context || 'help',
                    initialMessage: trigger.message,
                    pageContext,
                    businessId,
                    businessName,
                });
                setHasTriggered(true);
                clickTimestampsRef.current = [];
            }
        }
    }, [hasTriggered, isOpen, enabled, openTars, pageContext, businessId, businessName]);

    // Track empty search results
    const trackEmptySearch = useCallback(() => {
        emptySearchCountRef.current++;

        const trigger = TRIGGER_CONDITIONS.find(t => t.type === 'search-empty');
        if (
            trigger &&
            emptySearchCountRef.current >= trigger.threshold &&
            !hasTriggered &&
            !isOpen &&
            enabled
        ) {
            openTars({
                context: 'search',
                initialMessage: trigger.message,
                pageContext,
                businessId,
                businessName,
            });
            setHasTriggered(true);
            emptySearchCountRef.current = 0;
        }
    }, [hasTriggered, isOpen, enabled, openTars, pageContext, businessId, businessName]);

    // Track booking page time
    const startBookingTracking = useCallback(() => {
        bookingStartRef.current = Date.now();
    }, []);

    const stopBookingTracking = useCallback(() => {
        bookingStartRef.current = null;
    }, []);

    // Set up event listeners
    useEffect(() => {
        if (!enabled) return;

        // Activity tracking
        const activityEvents = ['mousemove', 'keydown', 'touchstart', 'scroll'];
        activityEvents.forEach(event => {
            window.addEventListener(event, trackActivity);
        });

        // Click tracking
        window.addEventListener('click', trackClick);

        // Idle detection interval
        const idleInterval = setInterval(() => {
            if (hasTriggered || isOpen) return;

            const idleTime = Date.now() - lastActivityRef.current;
            const idleTrigger = TRIGGER_CONDITIONS.find(t => t.type === 'idle');

            if (idleTrigger && idleTime >= idleTrigger.threshold) {
                openTars({
                    context: idleTrigger.context || 'general',
                    initialMessage: idleTrigger.message,
                    pageContext,
                    businessId,
                    businessName,
                });
                setHasTriggered(true);
            }
        }, 5000); // Check every 5 seconds

        // Booking page tracking
        const bookingInterval = setInterval(() => {
            if (hasTriggered || isOpen || !bookingStartRef.current) return;

            const bookingTime = Date.now() - bookingStartRef.current;
            const bookingTrigger = TRIGGER_CONDITIONS.find(t => t.type === 'booking-stuck');

            if (bookingTrigger && bookingTime >= bookingTrigger.threshold) {
                openTars({
                    context: 'booking',
                    initialMessage: bookingTrigger.message,
                    pageContext,
                    businessId,
                    businessName,
                });
                setHasTriggered(true);
                bookingStartRef.current = null;
            }
        }, 10000); // Check every 10 seconds

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, trackActivity);
            });
            window.removeEventListener('click', trackClick);
            clearInterval(idleInterval);
            clearInterval(bookingInterval);
        };
    }, [
        enabled,
        hasTriggered,
        isOpen,
        trackActivity,
        trackClick,
        openTars,
        pageContext,
        businessId,
        businessName,
    ]);

    // Reset triggers when page changes
    useEffect(() => {
        setHasTriggered(false);
        emptySearchCountRef.current = 0;
        clickTimestampsRef.current = [];
        bookingStartRef.current = null;
    }, [pageContext]);

    return {
        trackEmptySearch,
        startBookingTracking,
        stopBookingTracking,
        resetTriggers: () => setHasTriggered(false),
    };
}

// Component version for pages that need auto-triggers
export function TarsContextualTrigger({
    enabled = true,
    pageContext,
    businessId,
    businessName,
}: UseTarsTriggersOptions) {
    useTarsTriggers({ enabled, pageContext, businessId, businessName });
    return null;
}
