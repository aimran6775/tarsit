'use client';

import { useState, useEffect } from 'react';

interface RotatingTextProps {
    words: string[];
    className?: string;
    interval?: number;
}

export function RotatingText({ words, className = '', interval = 2500 }: RotatingTextProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const timer = setInterval(() => {
            setIsAnimating(true);

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % words.length);
                setIsAnimating(false);
            }, 300);
        }, interval);

        return () => clearInterval(timer);
    }, [words.length, interval, mounted]);

    // Show first word immediately on server/before mount
    if (!mounted) {
        return (
            <span className={`inline-block relative ${className}`}>
                <span className="inline-block">{words[0]}</span>
            </span>
        );
    }

    return (
        <span
            className={`inline-block relative ${className}`}
            style={{ textShadow: '0 0 30px rgba(168, 85, 247, 0.5), 0 2px 10px rgba(0, 0, 0, 0.5)' }}
        >
            <span
                className={`inline-block transition-all duration-300 ease-out ${isAnimating
                    ? 'opacity-0 translate-y-4 scale-95'
                    : 'opacity-100 translate-y-0 scale-100'
                    }`}
            >
                {words[currentIndex]}
            </span>
        </span>
    );
}
