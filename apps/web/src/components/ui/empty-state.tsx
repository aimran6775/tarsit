'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    EmptySearchIllustration,
    EmptyFavoritesIllustration,
    EmptyAppointmentsIllustration,
    EmptyMessagesIllustration
} from '@/components/illustrations';

type EmptyStateType = 'search' | 'favorites' | 'appointments' | 'messages' | 'generic';

interface EmptyStateProps {
    type?: EmptyStateType;
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
    illustration?: React.ReactNode;
}

const illustrationMap = {
    search: EmptySearchIllustration,
    favorites: EmptyFavoritesIllustration,
    appointments: EmptyAppointmentsIllustration,
    messages: EmptyMessagesIllustration,
    generic: EmptySearchIllustration,
};

export function EmptyState({
    type = 'generic',
    title,
    message,
    actionLabel,
    actionHref,
    onAction,
    className,
    illustration,
}: EmptyStateProps) {
    const Illustration = illustrationMap[type];

    return (
        <div className={cn(
            'text-center py-16 px-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10',
            className
        )}>
            {illustration || <Illustration className="w-48 h-36 mx-auto mb-6" />}

            <h3 className="text-lg font-semibold text-white mb-2">
                {title}
            </h3>

            <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
                {message}
            </p>

            {(actionLabel && (actionHref || onAction)) && (
                onAction ? (
                    <button
                        onClick={onAction}
                        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
                    >
                        {actionLabel}
                    </button>
                ) : (
                    <Link
                        href={actionHref!}
                        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
                    >
                        {actionLabel}
                    </Link>
                )
            )}
        </div>
    );
}
