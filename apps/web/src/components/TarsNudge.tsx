'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, X, Sparkles } from 'lucide-react';
import { useTars } from '@/contexts/TarsContext';

interface TarsNudgeProps {
    message: string;
    trigger?: 'hover' | 'delay' | 'click' | 'visible';
    delay?: number; // ms
    position?: 'top' | 'bottom' | 'left' | 'right';
    context?: 'general' | 'help' | 'business' | 'booking' | 'search';
    initialMessage?: string;
    children: React.ReactNode;
    showOnce?: boolean;
    storageKey?: string;
}

export function TarsNudge({
    message,
    trigger = 'hover',
    delay = 3000,
    position = 'top',
    context = 'general',
    initialMessage,
    children,
    showOnce = false,
    storageKey,
}: TarsNudgeProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const { openTars } = useTars();
    const timeoutRef = useRef<NodeJS.Timeout>();
    const elementRef = useRef<HTMLDivElement>(null);

    // Check if already shown (for showOnce option)
    useEffect(() => {
        if (showOnce && storageKey) {
            const shown = localStorage.getItem(`tars-nudge-${storageKey}`);
            if (shown) {
                setDismissed(true);
            }
        }
    }, [showOnce, storageKey]);

    // Handle delay trigger
    useEffect(() => {
        if (trigger === 'delay' && !dismissed) {
            timeoutRef.current = setTimeout(() => {
                setIsVisible(true);
            }, delay);

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }
    }, [trigger, delay, dismissed]);

    // Handle visibility trigger (Intersection Observer)
    useEffect(() => {
        if (trigger !== 'visible' || dismissed) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    timeoutRef.current = setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                } else {
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }
                }
            },
            { threshold: 0.5 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            observer.disconnect();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [trigger, delay, dismissed]);

    const handleMouseEnter = () => {
        if (trigger === 'hover' && !dismissed) {
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (trigger === 'hover') {
            setIsVisible(false);
        }
    };

    const handleClick = () => {
        if (trigger === 'click' && !dismissed) {
            setIsVisible(!isVisible);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setDismissed(true);
        if (showOnce && storageKey) {
            localStorage.setItem(`tars-nudge-${storageKey}`, 'true');
        }
    };

    const handleAskTars = () => {
        openTars({
            context,
            initialMessage: initialMessage || message,
        });
        handleDismiss();
    };

    // Position classes
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
        bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
        left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45',
        right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45',
    };

    return (
        <div
            ref={elementRef}
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {children}

            {isVisible && !dismissed && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}
                >
                    <div className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl border border-purple-500/30 shadow-xl shadow-purple-500/10 p-3 min-w-[200px] max-w-[280px]">
                        {/* Arrow */}
                        <div
                            className={`absolute w-3 h-3 bg-purple-900 border-purple-500/30 ${arrowClasses[position]}`}
                            style={{
                                borderWidth: position === 'top' || position === 'left' ? '0 1px 1px 0' : '1px 0 0 1px',
                            }}
                        />

                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDismiss();
                            }}
                            className="absolute top-1 right-1 p-1 text-white/40 hover:text-white rounded transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>

                        {/* Content */}
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-white/90 leading-relaxed pr-4">{message}</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAskTars();
                                    }}
                                    className="mt-2 text-xs text-purple-300 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Ask TARS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Floating TARS hint that appears after delay
export function TarsFloatingHint({
    message,
    delay = 5000,
    position = 'bottom-right',
    onDismiss,
}: {
    message: string;
    delay?: number;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    onDismiss?: () => void;
}) {
    const [isVisible, setIsVisible] = useState(false);
    const { openTars, isOpen } = useTars();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(false);
            return;
        }

        const timeout = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay, isOpen]);

    if (!isVisible || isOpen) return null;

    const positionClasses = {
        'bottom-right': 'bottom-24 right-6',
        'bottom-left': 'bottom-24 left-6',
        'top-right': 'top-24 right-6',
        'top-left': 'top-24 left-6',
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-40 animate-fade-in`}>
            <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-500/20 p-4 max-w-[300px]">
                <button
                    onClick={() => {
                        setIsVisible(false);
                        onDismiss?.();
                    }}
                    className="absolute top-2 right-2 p-1 text-white/40 hover:text-white rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-white/90 leading-relaxed pr-4">{message}</p>
                        <button
                            onClick={() => {
                                openTars({ initialMessage: message });
                                setIsVisible(false);
                            }}
                            className="mt-3 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            <Sparkles className="w-3 h-3" />
                            Chat with TARS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
