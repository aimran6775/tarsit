'use client';

import { cn } from '@/lib/utils';
import { Building2, ImageOff } from 'lucide-react';

interface PlaceholderProps {
    className?: string;
    variant?: 'business' | 'user' | 'generic';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
};

const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
};

// Business photo placeholder with elegant gradient
export function BusinessImagePlaceholder({ className, size = 'md' }: PlaceholderProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center',
                sizeClasses[size],
                className
            )}
        >
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="10" cy="10" r="1" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-purple-500/20 to-transparent" />

            {/* Icon */}
            <Building2 className={cn('text-neutral-600', iconSizes[size])} />
        </div>
    );
}

// User avatar placeholder
export function UserAvatarPlaceholder({ className, size = 'md' }: PlaceholderProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center border border-purple-500/20',
                sizeClasses[size],
                className
            )}
        >
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn('', iconSizes[size])}
            >
                <circle cx="50" cy="35" r="18" stroke="currentColor" strokeWidth="3" className="text-purple-400/50" fill="none" />
                <path
                    d="M20 85C20 65 33 50 50 50C67 50 80 65 80 85"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-purple-400/50"
                    fill="none"
                />
            </svg>
        </div>
    );
}

// Generic image placeholder
export function ImagePlaceholder({ className, size = 'md' }: PlaceholderProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border border-neutral-700/50',
                sizeClasses[size],
                className
            )}
        >
            <ImageOff className={cn('text-neutral-600', iconSizes[size])} />
        </div>
    );
}

// Full-width business card image placeholder
export function BusinessCardPlaceholder({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 via-neutral-850 to-neutral-900',
                className
            )}
        >
            {/* Decorative elements */}
            <div className="absolute inset-0">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />

                {/* Subtle grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="smallGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#smallGrid)" />
                </svg>

                {/* Accent gradient */}
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-purple-500/10 to-transparent" />
            </div>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center backdrop-blur-sm">
                    <Building2 className="h-8 w-8 text-neutral-500" />
                </div>
            </div>
        </div>
    );
}

// Hero background pattern (for sections without images)
export function HeroPattern({ className }: { className?: string }) {
    return (
        <div className={cn('absolute inset-0 overflow-hidden', className)}>
            {/* Gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-neutral-950 to-indigo-900/20" />

            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />

            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#heroGrid)" />
            </svg>

            {/* Floating orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
    );
}

// Decorative dots pattern
export function DotsPattern({ className }: { className?: string }) {
    return (
        <svg
            className={cn('absolute opacity-10', className)}
            width="404"
            height="404"
            fill="none"
            viewBox="0 0 404 404"
        >
            <defs>
                <pattern
                    id="dots-pattern"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                >
                    <circle cx="2" cy="2" r="2" fill="currentColor" className="text-purple-500" />
                </pattern>
            </defs>
            <rect width="404" height="404" fill="url(#dots-pattern)" />
        </svg>
    );
}
