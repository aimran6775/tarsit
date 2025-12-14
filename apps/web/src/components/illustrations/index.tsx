'use client';

import { cn } from '@/lib/utils';

interface IllustrationProps {
    className?: string;
    width?: number;
    height?: number;
}

// Empty Search Results - Elegant minimal illustration
export function EmptySearchIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background circle */}
            <circle cx="100" cy="100" r="80" fill="url(#emptySearchGradient)" opacity="0.1" />

            {/* Magnifying glass */}
            <circle cx="85" cy="85" r="35" stroke="url(#purpleGradient)" strokeWidth="4" fill="none" />
            <line x1="110" y1="110" x2="140" y2="140" stroke="url(#purpleGradient)" strokeWidth="4" strokeLinecap="round" />

            {/* X mark inside */}
            <path d="M75 75L95 95M95 75L75 95" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />

            {/* Decorative dots */}
            <circle cx="150" cy="60" r="4" fill="#a855f7" opacity="0.5" />
            <circle cx="45" cy="140" r="3" fill="#6366f1" opacity="0.4" />
            <circle cx="160" cy="130" r="2" fill="#a855f7" opacity="0.3" />

            <defs>
                <linearGradient id="emptySearchGradient" x1="20" y1="20" x2="180" y2="180">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="purpleGradient" x1="60" y1="60" x2="140" y2="140">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// No Favorites - Heart outline illustration
export function EmptyFavoritesIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background glow */}
            <circle cx="100" cy="100" r="70" fill="url(#favGradient)" opacity="0.08" />

            {/* Heart shape */}
            <path
                d="M100 160C100 160 40 120 40 80C40 55 60 40 85 40C95 40 100 50 100 50C100 50 105 40 115 40C140 40 160 55 160 80C160 120 100 160 100 160Z"
                stroke="url(#heartGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Plus sign */}
            <line x1="90" y1="90" x2="110" y2="90" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="80" x2="100" y2="100" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />

            {/* Decorative elements */}
            <circle cx="155" cy="55" r="3" fill="#ec4899" opacity="0.5" />
            <circle cx="50" cy="130" r="2" fill="#f472b6" opacity="0.4" />

            <defs>
                <linearGradient id="favGradient" x1="30" y1="30" x2="170" y2="170">
                    <stop stopColor="#ec4899" />
                    <stop offset="1" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="heartGradient" x1="40" y1="40" x2="160" y2="160">
                    <stop stopColor="#ec4899" />
                    <stop offset="1" stopColor="#f472b6" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// No Appointments - Calendar illustration
export function EmptyAppointmentsIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background */}
            <rect x="40" y="50" width="120" height="110" rx="12" fill="url(#calBg)" opacity="0.1" />

            {/* Calendar body */}
            <rect x="40" y="50" width="120" height="110" rx="12" stroke="url(#calGradient)" strokeWidth="3" fill="none" />

            {/* Calendar header */}
            <rect x="40" y="50" width="120" height="30" rx="12" fill="url(#calGradient)" opacity="0.2" />
            <line x1="40" y1="80" x2="160" y2="80" stroke="url(#calGradient)" strokeWidth="2" opacity="0.3" />

            {/* Calendar rings */}
            <rect x="65" y="40" width="8" height="20" rx="4" fill="url(#calGradient)" />
            <rect x="127" y="40" width="8" height="20" rx="4" fill="url(#calGradient)" />

            {/* Grid dots */}
            <circle cx="70" cy="100" r="4" fill="#6b7280" opacity="0.3" />
            <circle cx="100" cy="100" r="4" fill="#6b7280" opacity="0.3" />
            <circle cx="130" cy="100" r="4" fill="#6b7280" opacity="0.3" />
            <circle cx="70" cy="125" r="4" fill="#6b7280" opacity="0.3" />
            <circle cx="100" cy="125" r="4" fill="#10b981" />
            <circle cx="130" cy="125" r="4" fill="#6b7280" opacity="0.3" />

            {/* Clock icon */}
            <circle cx="155" cy="145" r="20" stroke="#10b981" strokeWidth="2" fill="#0a0a0a" />
            <line x1="155" y1="145" x2="155" y2="135" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <line x1="155" y1="145" x2="163" y2="150" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

            <defs>
                <linearGradient id="calBg" x1="40" y1="50" x2="160" y2="160">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="calGradient" x1="40" y1="40" x2="160" y2="160">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// No Messages - Chat bubble illustration
export function EmptyMessagesIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background glow */}
            <ellipse cx="100" cy="95" rx="75" ry="60" fill="url(#msgBg)" opacity="0.08" />

            {/* Main chat bubble */}
            <path
                d="M45 60C45 49 54 40 65 40H135C146 40 155 49 155 60V110C155 121 146 130 135 130H85L60 155V130H65C54 130 45 121 45 110V60Z"
                stroke="url(#msgGradient)"
                strokeWidth="3"
                fill="none"
            />

            {/* Message lines */}
            <line x1="65" y1="70" x2="135" y2="70" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <line x1="65" y1="85" x2="120" y2="85" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
            <line x1="65" y1="100" x2="100" y2="100" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" opacity="0.2" />

            {/* Small bubble */}
            <circle cx="160" cy="55" r="15" stroke="url(#msgGradient)" strokeWidth="2" fill="none" opacity="0.5" />
            <circle cx="175" cy="75" r="8" stroke="url(#msgGradient)" strokeWidth="2" fill="none" opacity="0.3" />

            <defs>
                <linearGradient id="msgBg" x1="25" y1="35" x2="175" y2="165">
                    <stop stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="msgGradient" x1="45" y1="40" x2="155" y2="155">
                    <stop stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Error State - Warning illustration
export function ErrorIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background glow */}
            <circle cx="100" cy="100" r="70" fill="url(#errorBg)" opacity="0.1" />

            {/* Triangle */}
            <path
                d="M100 35L170 155H30L100 35Z"
                stroke="url(#errorGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinejoin="round"
            />

            {/* Exclamation mark */}
            <line x1="100" y1="75" x2="100" y2="110" stroke="url(#errorGradient)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="100" cy="130" r="4" fill="url(#errorGradient)" />

            {/* Decorative sparks */}
            <line x1="45" y1="60" x2="55" y2="70" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <line x1="155" y1="60" x2="145" y2="70" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

            <defs>
                <linearGradient id="errorBg" x1="30" y1="30" x2="170" y2="170">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="errorGradient" x1="30" y1="35" x2="170" y2="155">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#f97316" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// 404 Not Found - Lost illustration
export function NotFoundIllustration({ className, width = 280, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 280 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background elements */}
            <circle cx="140" cy="100" r="80" fill="url(#notFoundBg)" opacity="0.05" />

            {/* 404 Text */}
            <text x="140" y="115" textAnchor="middle" fontSize="72" fontWeight="bold" fill="url(#notFoundGradient)" fontFamily="system-ui">
                404
            </text>

            {/* Decorative lines */}
            <line x1="40" y1="140" x2="80" y2="140" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            <line x1="200" y1="140" x2="240" y2="140" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

            {/* Floating dots */}
            <circle cx="60" cy="60" r="4" fill="#a855f7" opacity="0.5">
                <animate attributeName="cy" values="60;55;60" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="220" cy="70" r="3" fill="#6366f1" opacity="0.4">
                <animate attributeName="cy" values="70;65;70" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="45" cy="130" r="2" fill="#8b5cf6" opacity="0.3">
                <animate attributeName="cy" values="130;125;130" dur="1.8s" repeatCount="indefinite" />
            </circle>

            {/* Question marks */}
            <text x="55" y="95" fontSize="24" fill="#6b7280" opacity="0.3">?</text>
            <text x="215" y="85" fontSize="20" fill="#6b7280" opacity="0.2">?</text>

            <defs>
                <linearGradient id="notFoundBg" x1="60" y1="20" x2="220" y2="180">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="notFoundGradient" x1="60" y1="60" x2="220" y2="140">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Success/Completed - Checkmark illustration
export function SuccessIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background circle */}
            <circle cx="100" cy="100" r="70" fill="url(#successBg)" opacity="0.15" />

            {/* Outer circle */}
            <circle cx="100" cy="100" r="60" stroke="url(#successGradient)" strokeWidth="4" fill="none" />

            {/* Check mark */}
            <path
                d="M70 100L90 120L130 80"
                stroke="url(#successGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Celebration sparkles */}
            <circle cx="155" cy="55" r="4" fill="#10b981" opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="60" r="3" fill="#34d399" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="140" r="3" fill="#10b981" opacity="0.4">
                <animate attributeName="opacity" values="0.4;0.7;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="45" cy="135" r="2" fill="#34d399" opacity="0.3" />

            <defs>
                <linearGradient id="successBg" x1="30" y1="30" x2="170" y2="170">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="successGradient" x1="40" y1="40" x2="160" y2="160">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#34d399" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Business/Store illustration
export function BusinessIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background */}
            <rect x="35" y="70" width="130" height="90" rx="8" fill="url(#bizBg)" opacity="0.1" />

            {/* Building */}
            <rect x="35" y="70" width="130" height="90" rx="8" stroke="url(#bizGradient)" strokeWidth="3" fill="none" />

            {/* Roof/Awning */}
            <path d="M30 75L100 40L170 75" stroke="url(#bizGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M30 75L100 50L170 75" fill="url(#bizGradient)" opacity="0.2" />

            {/* Door */}
            <rect x="85" y="115" width="30" height="45" rx="4" stroke="url(#bizGradient)" strokeWidth="2" fill="none" />
            <circle cx="108" cy="140" r="3" fill="url(#bizGradient)" />

            {/* Windows */}
            <rect x="50" y="90" width="25" height="20" rx="3" stroke="url(#bizGradient)" strokeWidth="2" fill="none" opacity="0.7" />
            <rect x="125" y="90" width="25" height="20" rx="3" stroke="url(#bizGradient)" strokeWidth="2" fill="none" opacity="0.7" />

            {/* Star badge */}
            <circle cx="160" cy="55" r="18" fill="#0a0a0a" stroke="url(#bizGradient)" strokeWidth="2" />
            <path d="M160 45L163 53H171L165 58L167 66L160 62L153 66L155 58L149 53H157L160 45Z" fill="#fbbf24" />

            <defs>
                <linearGradient id="bizBg" x1="35" y1="40" x2="165" y2="160">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="bizGradient" x1="30" y1="40" x2="170" y2="160">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Location/Map illustration
export function LocationIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background map area */}
            <rect x="30" y="40" width="140" height="120" rx="12" fill="url(#locBg)" opacity="0.08" />
            <rect x="30" y="40" width="140" height="120" rx="12" stroke="url(#locGradient)" strokeWidth="2" fill="none" opacity="0.3" />

            {/* Map grid lines */}
            <line x1="30" y1="80" x2="170" y2="80" stroke="#6b7280" strokeWidth="1" opacity="0.1" />
            <line x1="30" y1="120" x2="170" y2="120" stroke="#6b7280" strokeWidth="1" opacity="0.1" />
            <line x1="70" y1="40" x2="70" y2="160" stroke="#6b7280" strokeWidth="1" opacity="0.1" />
            <line x1="130" y1="40" x2="130" y2="160" stroke="#6b7280" strokeWidth="1" opacity="0.1" />

            {/* Location pin */}
            <path
                d="M100 45C82 45 67 60 67 78C67 105 100 135 100 135C100 135 133 105 133 78C133 60 118 45 100 45Z"
                fill="url(#locGradient)"
                opacity="0.9"
            />
            <circle cx="100" cy="78" r="12" fill="#0a0a0a" />

            {/* Ripple effect */}
            <circle cx="100" cy="160" rx="25" ry="8" fill="url(#locGradient)" opacity="0.2" />
            <circle cx="100" cy="160" rx="15" ry="5" fill="url(#locGradient)" opacity="0.3" />

            <defs>
                <linearGradient id="locBg" x1="30" y1="40" x2="170" y2="160">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="locGradient" x1="67" y1="45" x2="133" y2="135">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#f97316" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// User/Profile illustration
export function UserIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background circle */}
            <circle cx="100" cy="100" r="75" fill="url(#userBg)" opacity="0.08" />

            {/* Outer ring */}
            <circle cx="100" cy="100" r="70" stroke="url(#userGradient)" strokeWidth="3" fill="none" opacity="0.3" />

            {/* Head */}
            <circle cx="100" cy="75" r="28" stroke="url(#userGradient)" strokeWidth="3" fill="none" />

            {/* Body */}
            <path
                d="M55 155C55 130 75 110 100 110C125 110 145 130 145 155"
                stroke="url(#userGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />

            {/* Decorative elements */}
            <circle cx="155" cy="55" r="4" fill="#06b6d4" opacity="0.5" />
            <circle cx="45" cy="60" r="3" fill="#0891b2" opacity="0.4" />
            <circle cx="160" cy="145" r="2" fill="#06b6d4" opacity="0.3" />

            <defs>
                <linearGradient id="userBg" x1="25" y1="25" x2="175" y2="175">
                    <stop stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#0891b2" />
                </linearGradient>
                <linearGradient id="userGradient" x1="30" y1="30" x2="170" y2="170">
                    <stop stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#0891b2" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Booking/Schedule illustration  
export function BookingIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Clipboard background */}
            <rect x="45" y="30" width="110" height="145" rx="10" fill="url(#bookBg)" opacity="0.1" />
            <rect x="45" y="30" width="110" height="145" rx="10" stroke="url(#bookGradient)" strokeWidth="3" fill="none" />

            {/* Clipboard top */}
            <rect x="75" y="20" width="50" height="20" rx="5" fill="url(#bookGradient)" />

            {/* Checkboxes */}
            <rect x="60" y="60" width="18" height="18" rx="4" stroke="url(#bookGradient)" strokeWidth="2" fill="none" />
            <path d="M64 69L68 73L76 65" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="88" y1="69" x2="135" y2="69" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

            <rect x="60" y="95" width="18" height="18" rx="4" stroke="url(#bookGradient)" strokeWidth="2" fill="none" />
            <path d="M64 104L68 108L76 100" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="88" y1="104" x2="125" y2="104" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

            <rect x="60" y="130" width="18" height="18" rx="4" stroke="url(#bookGradient)" strokeWidth="2" fill="none" />
            <line x1="88" y1="139" x2="115" y2="139" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

            {/* Decorative */}
            <circle cx="160" cy="45" r="3" fill="#10b981" opacity="0.5" />
            <circle cx="40" cy="90" r="2" fill="#34d399" opacity="0.4" />

            <defs>
                <linearGradient id="bookBg" x1="45" y1="20" x2="155" y2="175">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="bookGradient" x1="45" y1="20" x2="155" y2="175">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#34d399" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Reviews/Stars illustration
export function ReviewsIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background */}
            <circle cx="100" cy="100" r="70" fill="url(#revBg)" opacity="0.08" />

            {/* Large star */}
            <path
                d="M100 40L115 75H155L122 98L135 135L100 112L65 135L78 98L45 75H85L100 40Z"
                fill="url(#revGradient)"
                opacity="0.9"
            />

            {/* Smaller stars */}
            <path
                d="M160 55L165 65H175L167 72L170 82L160 76L150 82L153 72L145 65H155L160 55Z"
                fill="#fbbf24"
                opacity="0.7"
            />
            <path
                d="M45 120L48 127H56L50 132L52 139L45 135L38 139L40 132L34 127H42L45 120Z"
                fill="#fbbf24"
                opacity="0.5"
            />
            <path
                d="M155 130L157 135H162L158 138L159 143L155 140L151 143L152 138L148 135H153L155 130Z"
                fill="#fbbf24"
                opacity="0.4"
            />

            {/* Sparkles */}
            <circle cx="175" cy="90" r="2" fill="#fbbf24" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="30" cy="80" r="2" fill="#f59e0b" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
            </circle>

            <defs>
                <linearGradient id="revBg" x1="30" y1="30" x2="170" y2="170">
                    <stop stopColor="#fbbf24" />
                    <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="revGradient" x1="45" y1="40" x2="155" y2="135">
                    <stop stopColor="#fbbf24" />
                    <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Connection/Network illustration (for features)
export function ConnectionIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background */}
            <circle cx="100" cy="100" r="75" fill="url(#connBg)" opacity="0.05" />

            {/* Connection lines */}
            <line x1="100" y1="100" x2="55" y2="60" stroke="url(#connGradient)" strokeWidth="2" opacity="0.5" />
            <line x1="100" y1="100" x2="145" y2="60" stroke="url(#connGradient)" strokeWidth="2" opacity="0.5" />
            <line x1="100" y1="100" x2="55" y2="140" stroke="url(#connGradient)" strokeWidth="2" opacity="0.5" />
            <line x1="100" y1="100" x2="145" y2="140" stroke="url(#connGradient)" strokeWidth="2" opacity="0.5" />

            {/* Center node */}
            <circle cx="100" cy="100" r="20" fill="url(#connGradient)" />
            <circle cx="100" cy="100" r="8" fill="#0a0a0a" />

            {/* Outer nodes */}
            <circle cx="55" cy="60" r="15" stroke="url(#connGradient)" strokeWidth="2" fill="#0a0a0a" />
            <circle cx="55" cy="60" r="6" fill="url(#connGradient)" opacity="0.7" />

            <circle cx="145" cy="60" r="15" stroke="url(#connGradient)" strokeWidth="2" fill="#0a0a0a" />
            <circle cx="145" cy="60" r="6" fill="url(#connGradient)" opacity="0.7" />

            <circle cx="55" cy="140" r="15" stroke="url(#connGradient)" strokeWidth="2" fill="#0a0a0a" />
            <circle cx="55" cy="140" r="6" fill="url(#connGradient)" opacity="0.7" />

            <circle cx="145" cy="140" r="15" stroke="url(#connGradient)" strokeWidth="2" fill="#0a0a0a" />
            <circle cx="145" cy="140" r="6" fill="url(#connGradient)" opacity="0.7" />

            {/* Pulse animation on center */}
            <circle cx="100" cy="100" r="25" stroke="url(#connGradient)" strokeWidth="1" fill="none" opacity="0.3">
                <animate attributeName="r" values="20;35;20" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
            </circle>

            <defs>
                <linearGradient id="connBg" x1="25" y1="25" x2="175" y2="175">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="connGradient" x1="40" y1="45" x2="160" y2="155">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Security/Shield illustration  
export function SecurityIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background glow */}
            <ellipse cx="100" cy="105" rx="70" ry="75" fill="url(#secBg)" opacity="0.08" />

            {/* Shield shape */}
            <path
                d="M100 30L160 55V95C160 130 135 160 100 175C65 160 40 130 40 95V55L100 30Z"
                stroke="url(#secGradient)"
                strokeWidth="4"
                fill="none"
            />

            {/* Inner shield */}
            <path
                d="M100 50L145 70V100C145 125 125 145 100 157C75 145 55 125 55 100V70L100 50Z"
                fill="url(#secGradient)"
                opacity="0.15"
            />

            {/* Checkmark */}
            <path
                d="M80 100L95 115L125 85"
                stroke="url(#secGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Decorative elements */}
            <circle cx="170" cy="50" r="3" fill="#10b981" opacity="0.5" />
            <circle cx="30" cy="70" r="2" fill="#34d399" opacity="0.4" />
            <circle cx="165" cy="140" r="2" fill="#10b981" opacity="0.3" />

            <defs>
                <linearGradient id="secBg" x1="30" y1="30" x2="170" y2="175">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="secGradient" x1="40" y1="30" x2="160" y2="175">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#059669" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Welcome/Onboarding illustration
export function WelcomeIllustration({ className, width = 280, height = 200 }: IllustrationProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 280 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('', className)}
        >
            {/* Background shapes */}
            <circle cx="140" cy="100" r="90" fill="url(#welcomeBg)" opacity="0.05" />
            <circle cx="70" cy="60" r="40" fill="url(#welcomeBg)" opacity="0.03" />
            <circle cx="220" cy="140" r="35" fill="url(#welcomeBg)" opacity="0.03" />

            {/* Main window/card */}
            <rect x="70" y="40" width="140" height="120" rx="12" fill="#171717" stroke="url(#welcomeGradient)" strokeWidth="2" />

            {/* Window header */}
            <rect x="70" y="40" width="140" height="30" rx="12" fill="url(#welcomeGradient)" opacity="0.2" />
            <circle cx="85" cy="55" r="4" fill="#ef4444" opacity="0.8" />
            <circle cx="100" cy="55" r="4" fill="#fbbf24" opacity="0.8" />
            <circle cx="115" cy="55" r="4" fill="#10b981" opacity="0.8" />

            {/* Content lines */}
            <rect x="85" y="85" width="60" height="6" rx="3" fill="#6b7280" opacity="0.4" />
            <rect x="85" y="100" width="100" height="4" rx="2" fill="#6b7280" opacity="0.2" />
            <rect x="85" y="112" width="80" height="4" rx="2" fill="#6b7280" opacity="0.2" />

            {/* Button */}
            <rect x="85" y="130" width="50" height="20" rx="10" fill="url(#welcomeGradient)" />

            {/* Floating elements */}
            <circle cx="230" cy="60" r="15" stroke="url(#welcomeGradient)" strokeWidth="2" fill="none" opacity="0.5">
                <animate attributeName="cy" values="60;55;60" dur="3s" repeatCount="indefinite" />
            </circle>
            <path d="M230 55L233 60H237L234 63L235 68L230 65L225 68L226 63L223 60H227L230 55Z" fill="#fbbf24" opacity="0.8" />

            <circle cx="50" cy="120" r="12" stroke="url(#welcomeGradient)" strokeWidth="2" fill="none" opacity="0.4">
                <animate attributeName="cy" values="120;115;120" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <path d="M46 117L50 125L58 113" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Sparkles */}
            <circle cx="250" cy="100" r="3" fill="#a855f7" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="35" cy="70" r="2" fill="#6366f1" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.8s" repeatCount="indefinite" />
            </circle>

            <defs>
                <linearGradient id="welcomeBg" x1="50" y1="10" x2="230" y2="190">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="welcomeGradient" x1="70" y1="40" x2="210" y2="160">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}
