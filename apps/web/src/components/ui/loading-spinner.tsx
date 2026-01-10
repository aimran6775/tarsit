'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    label?: string;
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    const borderSizes = {
        sm: 'border-2',
        md: 'border-3',
        lg: 'border-4',
    };

    return (
        <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
            <div className="relative">
                <div className={cn(
                    'rounded-full border-white/10',
                    sizeClasses[size],
                    borderSizes[size]
                )} />
                <div className={cn(
                    'absolute top-0 left-0 rounded-full border-purple-500 border-t-transparent animate-spin',
                    sizeClasses[size],
                    borderSizes[size]
                )} />
            </div>
            {label && (
                <p className="text-white/50 text-sm animate-pulse">{label}</p>
            )}
        </div>
    );
}

// Full page loading state
export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-50">
            <div className="text-center">
                <LoadingSpinner size="lg" label={message} />
            </div>
        </div>
    );
}

// Inline skeleton loader
export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn(
            'animate-pulse bg-white/10 rounded',
            className
        )} />
    );
}

// Card skeleton
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn(
            'p-6 rounded-2xl bg-white/5 border border-white/10',
            className
        )}>
            <Skeleton className="h-32 w-full rounded-xl mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    );
}
