'use client';

import { cn } from '@/lib/utils';

// Elegant auth page visual for the left panel
export function AuthVisual({ variant = 'customer' }: { variant?: 'customer' | 'business' }) {
    const isCustomer = variant === 'customer';

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-neutral-900" />

            {/* Gradient overlays */}
            <div className={cn(
                'absolute inset-0',
                isCustomer
                    ? 'bg-gradient-to-br from-purple-900/40 via-transparent to-indigo-900/40'
                    : 'bg-gradient-to-br from-emerald-900/40 via-transparent to-teal-900/40'
            )} />

            {/* Radial glow */}
            <div className={cn(
                'absolute inset-0',
                isCustomer
                    ? 'bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.25),transparent_50%)]'
                    : 'bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.25),transparent_50%)]'
            )} />

            {/* Floating orbs */}
            <div className={cn(
                'absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl',
                isCustomer ? 'bg-purple-500/15' : 'bg-emerald-500/15'
            )} />
            <div className={cn(
                'absolute top-1/4 left-1/4 w-48 h-48 rounded-full blur-3xl',
                isCustomer ? 'bg-indigo-500/15' : 'bg-teal-500/15'
            )} />

            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="authGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#authGrid)" />
            </svg>

            {/* Main illustration */}
            <div className="relative z-10 max-w-md p-8">
                {isCustomer ? (
                    <CustomerAuthIllustration />
                ) : (
                    <BusinessAuthIllustration />
                )}
            </div>
        </div>
    );
}

// Customer-focused illustration
function CustomerAuthIllustration() {
    return (
        <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
        >
            {/* Central card/window */}
            <rect x="100" y="80" width="200" height="240" rx="16" fill="#171717" stroke="url(#custGradient)" strokeWidth="2" />

            {/* Card header */}
            <rect x="100" y="80" width="200" height="50" rx="16" fill="url(#custGradient)" opacity="0.15" />
            <circle cx="125" cy="105" r="6" fill="#ef4444" opacity="0.8" />
            <circle cx="145" cy="105" r="6" fill="#fbbf24" opacity="0.8" />
            <circle cx="165" cy="105" r="6" fill="#10b981" opacity="0.8" />

            {/* Search bar */}
            <rect x="120" y="150" width="160" height="36" rx="18" fill="#262626" stroke="#404040" strokeWidth="1" />
            <circle cx="145" cy="168" r="8" stroke="#6b7280" strokeWidth="2" fill="none" />
            <line x1="151" y1="174" x2="157" y2="180" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
            <rect x="165" y="164" width="80" height="8" rx="4" fill="#404040" />

            {/* Results cards */}
            <rect x="120" y="200" width="160" height="50" rx="8" fill="#1f1f1f" stroke="#333" strokeWidth="1" />
            <circle cx="145" cy="225" r="15" fill="url(#custGradient)" opacity="0.3" />
            <rect x="170" y="215" width="60" height="8" rx="4" fill="#404040" />
            <rect x="170" y="228" width="40" height="6" rx="3" fill="#333" />
            <path d="M255 218L258 224H264L259 228L261 234L255 230L249 234L251 228L246 224H252L255 218Z" fill="#fbbf24" />

            <rect x="120" y="260" width="160" height="50" rx="8" fill="#1f1f1f" stroke="#333" strokeWidth="1" />
            <circle cx="145" cy="285" r="15" fill="url(#custGradient)" opacity="0.2" />
            <rect x="170" y="275" width="70" height="8" rx="4" fill="#404040" />
            <rect x="170" y="288" width="50" height="6" rx="3" fill="#333" />
            <path d="M255 278L258 284H264L259 288L261 294L255 290L249 294L251 288L246 284H252L255 278Z" fill="#fbbf24" />

            {/* Floating elements */}
            <g transform="translate(320, 100)">
                <circle r="30" fill="#171717" stroke="url(#custGradient)" strokeWidth="2" />
                <path d="M-8 0L-2 8L12 -6" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>

            <g transform="translate(60, 200)">
                <circle r="25" fill="#171717" stroke="url(#custGradient)" strokeWidth="2" />
                <path d="M0 -8L4 0H12L5 5L7 13L0 9L-7 13L-5 5L-12 0H-4L0 -8Z" fill="#fbbf24" />
            </g>

            <g transform="translate(340, 280)">
                <circle r="20" fill="#171717" stroke="url(#custGradient)" strokeWidth="2" />
                <circle cx="0" cy="-3" r="6" stroke="#a855f7" strokeWidth="2" fill="none" />
                <path d="M-8 12C-8 4 -4 0 0 0C4 0 8 4 8 12" stroke="#a855f7" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>

            {/* Decorative dots */}
            <circle cx="80" cy="120" r="4" fill="#a855f7" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="330" cy="340" r="3" fill="#6366f1" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="70" cy="300" r="2" fill="#8b5cf6" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
            </circle>

            <defs>
                <linearGradient id="custGradient" x1="100" y1="80" x2="300" y2="320">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Business-focused illustration
function BusinessAuthIllustration() {
    return (
        <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
        >
            {/* Dashboard mockup */}
            <rect x="80" y="60" width="240" height="280" rx="16" fill="#171717" stroke="url(#bizAuthGradient)" strokeWidth="2" />

            {/* Header */}
            <rect x="80" y="60" width="240" height="45" rx="16" fill="url(#bizAuthGradient)" opacity="0.15" />
            <rect x="100" y="75" width="60" height="15" rx="4" fill="url(#bizAuthGradient)" opacity="0.3" />

            {/* Stats row */}
            <rect x="100" y="125" width="65" height="55" rx="8" fill="#1f1f1f" stroke="#333" strokeWidth="1" />
            <rect x="110" y="140" width="25" height="8" rx="4" fill="url(#bizAuthGradient)" opacity="0.5" />
            <text x="110" y="168" fontSize="14" fontWeight="bold" fill="white" fontFamily="system-ui">247</text>

            <rect x="175" y="125" width="65" height="55" rx="8" fill="#1f1f1f" stroke="#333" strokeWidth="1" />
            <rect x="185" y="140" width="30" height="8" rx="4" fill="#10b981" opacity="0.5" />
            <text x="185" y="168" fontSize="14" fontWeight="bold" fill="white" fontFamily="system-ui">4.8</text>
            <path d="M215 162L217 166H221L218 169L219 173L215 171L211 173L212 169L209 166H213L215 162Z" fill="#fbbf24" transform="scale(0.7) translate(90, 75)" />

            <rect x="250" y="125" width="55" height="55" rx="8" fill="#1f1f1f" stroke="#333" strokeWidth="1" />
            <rect x="260" y="140" width="20" height="8" rx="4" fill="#3b82f6" opacity="0.5" />
            <text x="260" y="168" fontSize="14" fontWeight="bold" fill="white" fontFamily="system-ui">89</text>

            {/* Chart area */}
            <rect x="100" y="195" width="200" height="80" rx="8" fill="#1f1f1f" stroke="#333" strokeWidth="1" />

            {/* Chart bars */}
            <rect x="120" y="250" width="20" height="15" rx="2" fill="url(#bizAuthGradient)" opacity="0.6" />
            <rect x="150" y="235" width="20" height="30" rx="2" fill="url(#bizAuthGradient)" opacity="0.7" />
            <rect x="180" y="220" width="20" height="45" rx="2" fill="url(#bizAuthGradient)" opacity="0.8" />
            <rect x="210" y="230" width="20" height="35" rx="2" fill="url(#bizAuthGradient)" opacity="0.75" />
            <rect x="240" y="210" width="20" height="55" rx="2" fill="url(#bizAuthGradient)" />
            <rect x="270" y="225" width="20" height="40" rx="2" fill="url(#bizAuthGradient)" opacity="0.85" />

            {/* Recent activity */}
            <rect x="100" y="290" width="200" height="35" rx="8" fill="#1f1f1f" stroke="#333" strokeWidth="1" />
            <circle cx="120" cy="307" r="8" fill="url(#bizAuthGradient)" opacity="0.3" />
            <rect x="135" y="302" width="80" height="6" rx="3" fill="#404040" />
            <rect x="135" y="312" width="50" height="4" rx="2" fill="#333" />

            {/* Floating elements */}
            <g transform="translate(50, 140)">
                <circle r="28" fill="#171717" stroke="url(#bizAuthGradient)" strokeWidth="2" />
                <rect x="-12" y="-8" width="24" height="20" rx="3" stroke="#10b981" strokeWidth="2" fill="none" />
                <circle cx="0" cy="-12" r="4" fill="#10b981" />
            </g>

            <g transform="translate(350, 180)">
                <circle r="24" fill="#171717" stroke="url(#bizAuthGradient)" strokeWidth="2" />
                <path d="M-6 -4L-6 6L6 1L-6 -4Z" fill="#10b981" />
            </g>

            <g transform="translate(60, 320)">
                <circle r="20" fill="#171717" stroke="url(#bizAuthGradient)" strokeWidth="2" />
                <text x="-6" y="5" fontSize="14" fontWeight="bold" fill="#10b981" fontFamily="system-ui">$</text>
            </g>

            {/* Decorative elements */}
            <circle cx="340" cy="80" r="4" fill="#10b981" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="45" cy="250" r="3" fill="#34d399" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="360" cy="300" r="2" fill="#10b981" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
            </circle>

            <defs>
                <linearGradient id="bizAuthGradient" x1="80" y1="60" x2="320" y2="340">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#059669" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export { CustomerAuthIllustration, BusinessAuthIllustration };
