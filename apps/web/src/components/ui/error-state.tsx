'use client';

import Link from 'next/link';
import { RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { ErrorIllustration } from '@/components/illustrations';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    showHomeLink?: boolean;
    showBackLink?: boolean;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'An unexpected error occurred. Please try again.',
    onRetry,
    showHomeLink = true,
    showBackLink = false,
    className,
}: ErrorStateProps) {
    return (
        <div className={cn(
            'text-center py-16 px-4',
            className
        )}>
            <ErrorIllustration className="w-48 h-36 mx-auto mb-6" />

            <h3 className="text-xl font-semibold text-white mb-2">
                {title}
            </h3>

            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                )}

                {showBackLink && (
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                )}

                {showHomeLink && (
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Link>
                )}
            </div>
        </div>
    );
}
