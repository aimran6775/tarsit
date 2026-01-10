'use client';

// Feature illustrations for landing page sections

export function DiscoverFeatureIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Background */}
            <rect width="300" height="200" fill="transparent" />

            {/* Map representation */}
            <rect x="20" y="30" width="180" height="140" rx="12" fill="#171717" stroke="#333" strokeWidth="1.5" />

            {/* Grid lines */}
            <line x1="20" y1="70" x2="200" y2="70" stroke="#262626" strokeWidth="1" />
            <line x1="20" y1="110" x2="200" y2="110" stroke="#262626" strokeWidth="1" />
            <line x1="80" y1="30" x2="80" y2="170" stroke="#262626" strokeWidth="1" />
            <line x1="140" y1="30" x2="140" y2="170" stroke="#262626" strokeWidth="1" />

            {/* Location pins */}
            <g transform="translate(60, 55)">
                <path d="M0 -15C-10 -15 -15 -7 -15 0C-15 15 0 25 0 25C0 25 15 15 15 0C15 -7 10 -15 0 -15Z" fill="url(#discoverGrad)" />
                <circle cx="0" cy="-3" r="5" fill="#0a0a0a" />
            </g>

            <g transform="translate(120, 90)">
                <path d="M0 -12C-8 -12 -12 -5 -12 0C-12 12 0 20 0 20C0 20 12 12 12 0C12 -5 8 -12 0 -12Z" fill="#ef4444" />
                <circle cx="0" cy="-2" r="4" fill="#0a0a0a" />
            </g>

            <g transform="translate(160, 140)">
                <path d="M0 -10C-6 -10 -10 -4 -10 0C-10 10 0 16 0 16C0 16 10 10 10 0C10 -4 6 -10 0 -10Z" fill="#fbbf24" />
                <circle cx="0" cy="-1" r="3" fill="#0a0a0a" />
            </g>

            {/* Search card */}
            <rect x="160" y="20" width="130" height="90" rx="10" fill="#1f1f1f" stroke="url(#discoverGrad)" strokeWidth="1.5" />
            <rect x="175" y="35" width="100" height="28" rx="14" fill="#262626" />
            <circle cx="190" cy="49" r="6" stroke="#6b7280" strokeWidth="1.5" fill="none" />
            <line x1="194" y1="53" x2="198" y2="57" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="205" y="45" width="55" height="8" rx="4" fill="#404040" />

            {/* Result previews */}
            <rect x="175" y="72" width="100" height="8" rx="4" fill="#333" />
            <rect x="175" y="85" width="70" height="6" rx="3" fill="#262626" />
            <circle cx="260" cy="85" r="6" fill="#10b981" />
            <path d="M257 85L259 87L263 83" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Floating badge */}
            <circle cx="250" cy="150" r="22" fill="#171717" stroke="url(#discoverGrad)" strokeWidth="2" />
            <path d="M250 138L254 147H264L256 153L259 162L250 156L241 162L244 153L236 147H246L250 138Z" fill="#fbbf24" />

            <defs>
                <linearGradient id="discoverGrad" x1="0" y1="0" x2="300" y2="200">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function ConnectFeatureIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Chat bubbles */}
            <g transform="translate(30, 40)">
                <path d="M0 0H120C130 0 140 10 140 20V60C140 70 130 80 120 80H40L15 100V80H20C10 80 0 70 0 60V20C0 10 10 0 20 0Z" fill="#1f1f1f" stroke="url(#connectGrad)" strokeWidth="1.5" />
                <rect x="20" y="25" width="80" height="8" rx="4" fill="#404040" />
                <rect x="20" y="40" width="60" height="8" rx="4" fill="#333" />
                <rect x="20" y="55" width="40" height="6" rx="3" fill="#262626" />
            </g>

            <g transform="translate(130, 100)">
                <path d="M140 0H20C10 0 0 10 0 20V60C0 70 10 80 20 80H100L125 100V80H120C130 80 140 70 140 60V20C140 10 130 0 120 0Z" fill="#171717" stroke="#10b981" strokeWidth="1.5" />
                <rect x="20" y="25" width="90" height="8" rx="4" fill="#10b981" opacity="0.3" />
                <rect x="20" y="40" width="70" height="8" rx="4" fill="#10b981" opacity="0.2" />
                <rect x="20" y="55" width="50" height="6" rx="3" fill="#10b981" opacity="0.15" />
            </g>

            {/* User avatars */}
            <circle cx="185" cy="30" r="18" fill="#262626" stroke="url(#connectGrad)" strokeWidth="2" />
            <circle cx="185" cy="25" r="6" stroke="#a855f7" strokeWidth="1.5" fill="none" />
            <path d="M175 40C175 34 179 30 185 30C191 30 195 34 195 40" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            <circle cx="115" cy="170" r="18" fill="#262626" stroke="#10b981" strokeWidth="2" />
            <rect x="106" y="163" width="18" height="14" rx="3" stroke="#10b981" strokeWidth="1.5" fill="none" />
            <circle cx="115" cy="160" r="3" fill="#10b981" />

            {/* Connection line */}
            <path d="M175 45 Q 145 100 130 155" stroke="url(#connectGrad)" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.5" />

            {/* Status indicators */}
            <circle cx="198" cy="40" r="5" fill="#10b981">
                <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>

            <defs>
                <linearGradient id="connectGrad" x1="0" y1="0" x2="300" y2="200">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function BookFeatureIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Calendar card */}
            <rect x="60" y="20" width="180" height="160" rx="12" fill="#171717" stroke="url(#bookGrad)" strokeWidth="1.5" />

            {/* Calendar header */}
            <rect x="60" y="20" width="180" height="40" rx="12" fill="url(#bookGrad)" opacity="0.15" />
            <rect x="80" y="35" width="60" height="10" rx="5" fill="url(#bookGrad)" opacity="0.5" />
            <rect x="160" y="33" width="14" height="14" rx="4" fill="#262626" />
            <rect x="180" y="33" width="14" height="14" rx="4" fill="#262626" />

            {/* Calendar grid */}
            <g transform="translate(75, 75)">
                {/* Week days */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((_, i) => (
                    <rect key={i} x={i * 22} y="0" width="18" height="6" rx="3" fill="#404040" />
                ))}

                {/* Date cells */}
                {[...Array(21)].map((_, i) => {
                    const row = Math.floor(i / 7);
                    const col = i % 7;
                    const isSelected = i === 10;
                    const hasAppointment = i === 5 || i === 12 || i === 18;

                    return (
                        <g key={i}>
                            <rect
                                x={col * 22}
                                y={20 + row * 28}
                                width="18"
                                height="22"
                                rx="4"
                                fill={isSelected ? 'url(#bookGrad)' : hasAppointment ? '#1f1f1f' : 'transparent'}
                                stroke={hasAppointment && !isSelected ? '#333' : 'none'}
                                strokeWidth="1"
                            />
                            {hasAppointment && !isSelected && (
                                <circle cx={col * 22 + 9} cy={20 + row * 28 + 17} r="2" fill="#10b981" />
                            )}
                        </g>
                    );
                })}
            </g>

            {/* Time slot card */}
            <rect x="200" y="90" width="90" height="80" rx="8" fill="#1f1f1f" stroke="url(#bookGrad)" strokeWidth="1" />
            <rect x="212" y="102" width="66" height="8" rx="4" fill="url(#bookGrad)" opacity="0.3" />

            {/* Time slots */}
            <rect x="212" y="118" width="66" height="14" rx="4" fill="#262626" />
            <rect x="218" y="122" width="30" height="6" rx="3" fill="#404040" />

            <rect x="212" y="138" width="66" height="14" rx="4" fill="url(#bookGrad)" />
            <rect x="218" y="142" width="30" height="6" rx="3" fill="white" opacity="0.3" />
            <path d="M265 142L268 148L275 140" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="scale(0.7) translate(95, 60)" />

            <rect x="212" y="158" width="66" height="14" rx="4" fill="#262626" />
            <rect x="218" y="162" width="30" height="6" rx="3" fill="#404040" />

            {/* Success badge */}
            <circle cx="55" cy="155" r="20" fill="#171717" stroke="#10b981" strokeWidth="2" />
            <path d="M47 155L52 160L63 149" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            <defs>
                <linearGradient id="bookGrad" x1="60" y1="20" x2="240" y2="180">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function TrustFeatureIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Shield */}
            <path
                d="M150 20L220 45V95C220 135 190 165 150 180C110 165 80 135 80 95V45L150 20Z"
                fill="#171717"
                stroke="url(#trustGrad)"
                strokeWidth="2"
            />

            {/* Inner shield */}
            <path
                d="M150 40L200 58V95C200 125 177 148 150 160C123 148 100 125 100 95V58L150 40Z"
                fill="url(#trustGrad)"
                opacity="0.1"
            />

            {/* Checkmark */}
            <path
                d="M125 95L142 112L175 79"
                stroke="url(#trustGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Verification badges */}
            <g transform="translate(240, 50)">
                <circle r="22" fill="#171717" stroke="#10b981" strokeWidth="2" />
                <path d="M-7 0L-2 5L9 -6" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            <g transform="translate(60, 140)">
                <circle r="18" fill="#171717" stroke="#fbbf24" strokeWidth="2" />
                <path d="M0 -8L3 -1H10L4 3L6 10L0 6L-6 10L-4 3L-10 -1H-3L0 -8Z" fill="#fbbf24" transform="scale(0.7)" />
            </g>

            <g transform="translate(250, 150)">
                <circle r="16" fill="#171717" stroke="url(#trustGrad)" strokeWidth="2" />
                <rect x="-6" y="-6" width="12" height="12" rx="2" stroke="#a855f7" strokeWidth="1.5" fill="none" />
                <path d="M-3 0L-1 2L4 -3" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Stars */}
            <circle cx="45" cy="60" r="4" fill="#fbbf24" opacity="0.6">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="260" cy="100" r="3" fill="#a855f7" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="100" r="2" fill="#6366f1" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.8s" repeatCount="indefinite" />
            </circle>

            <defs>
                <linearGradient id="trustGrad" x1="80" y1="20" x2="220" y2="180">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#059669" />
                </linearGradient>
            </defs>
        </svg>
    );
}
