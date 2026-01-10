'use client';

import { ALL_PERSONAS, TarsPersona } from '@/lib/tars/personas';
import { cn } from '@/lib/utils';
import { CircuitBoard, Compass, Cpu, Sparkles, Terminal, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

// ============================================
// TARS AVATAR COMPONENT
// ============================================

interface TarsAvatarProps {
  persona: TarsPersona;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showStatus?: boolean;
  statusText?: string;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const STATUS_SIZES = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
};

// Persona-specific icons
const PERSONA_ICONS = {
  guest: Compass, // Discovery/exploration
  customer: Sparkles, // Personal/magical
  business: Terminal, // Command center
};

// Secondary animated icons
const PERSONA_SECONDARY_ICONS = {
  guest: Zap,
  customer: CircuitBoard,
  business: Cpu,
};

export function TarsAvatar({
  persona,
  size = 'md',
  animated = true,
  showStatus = false,
  statusText = 'Online',
  className,
}: TarsAvatarProps) {
  const config = ALL_PERSONAS[persona];
  const Icon = PERSONA_ICONS[persona];
  const iconSize = ICON_SIZES[size];

  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Main Avatar */}
      <div
        className={cn(
          SIZE_CLASSES[size],
          'relative rounded-full flex items-center justify-center',
          'bg-gradient-to-br shadow-lg',
          config.colors.gradient,
          animated && 'transition-transform hover:scale-105'
        )}
      >
        {/* Glow effect */}
        {animated && (
          <div
            className={cn(
              'absolute inset-0 rounded-full blur-sm opacity-50',
              'bg-gradient-to-br',
              config.colors.gradient,
              'animate-pulse'
            )}
          />
        )}

        {/* Icon */}
        <Icon size={iconSize} className="text-white relative z-10" strokeWidth={2} />

        {/* Inner ring */}
        <div className="absolute inset-[2px] rounded-full border border-white/20" />
      </div>

      {/* Status indicator */}
      {showStatus && (
        <div
          className={cn(
            STATUS_SIZES[size],
            'absolute -bottom-0.5 -right-0.5',
            'bg-green-500 rounded-full border-2 border-white',
            animated && 'animate-pulse'
          )}
          title={statusText}
        />
      )}
    </div>
  );
}

// ============================================
// TARS LOGO COMPONENT (Full branding)
// ============================================

interface TarsLogoProps {
  persona: TarsPersona;
  variant?: 'icon' | 'horizontal' | 'vertical' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  animated?: boolean;
  className?: string;
}

export function TarsLogo({
  persona,
  variant = 'horizontal',
  size = 'md',
  showTagline = false,
  animated = true,
  className,
}: TarsLogoProps) {
  const config = ALL_PERSONAS[persona];

  if (variant === 'icon') {
    return <TarsAvatar persona={persona} size={size} animated={animated} className={className} />;
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        variant === 'vertical' && 'flex-col gap-1',
        className
      )}
    >
      <TarsAvatar persona={persona} size={size} animated={animated} />

      <div className={cn(variant === 'vertical' && 'text-center')}>
        <div
          className={cn(textSizes[size], 'font-bold tracking-tight')}
          style={{ color: config.colors.primary }}
        >
          TARS
        </div>

        {showTagline && (
          <div
            className={cn(taglineSizes[size], 'opacity-70')}
            style={{ color: config.colors.text }}
          >
            {config.tagline}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// ANIMATED TARS FACE (For loading/thinking)
// ============================================

interface TarsFaceProps {
  persona: TarsPersona;
  state?: 'idle' | 'thinking' | 'speaking' | 'listening';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TarsFace({ persona, state = 'idle', size = 'md', className }: TarsFaceProps) {
  const config = ALL_PERSONAS[persona];
  const Icon = PERSONA_ICONS[persona];
  const SecondaryIcon = PERSONA_SECONDARY_ICONS[persona];

  const [showSecondary, setShowSecondary] = useState(false);

  // Animate icon swap when thinking
  useEffect(() => {
    if (state === 'thinking') {
      const interval = setInterval(() => {
        setShowSecondary((prev) => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
    setShowSecondary(false);
  }, [state]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  const CurrentIcon = showSecondary ? SecondaryIcon : Icon;

  return (
    <div
      className={cn(
        sizeClasses[size],
        'relative rounded-2xl flex items-center justify-center',
        'bg-gradient-to-br shadow-xl',
        config.colors.gradient,
        className
      )}
    >
      {/* Animated background rings */}
      {(state === 'thinking' || state === 'speaking') && (
        <>
          <div
            className={cn(
              'absolute inset-0 rounded-2xl',
              'bg-gradient-to-br opacity-30',
              config.colors.gradient,
              'animate-ping'
            )}
          />
          <div
            className={cn(
              'absolute -inset-1 rounded-2xl',
              'bg-gradient-to-br opacity-20',
              config.colors.gradient,
              state === 'speaking' ? 'animate-pulse' : 'animate-spin-slow'
            )}
          />
        </>
      )}

      {/* Listening indicator */}
      {state === 'listening' && (
        <div className="absolute -inset-2 rounded-2xl border-2 border-dashed border-white/30 animate-spin-slow" />
      )}

      {/* Icon */}
      <CurrentIcon
        size={iconSizes[size]}
        className={cn(
          'text-white relative z-10 transition-all duration-300',
          state === 'thinking' && 'animate-pulse',
          state === 'speaking' && 'animate-bounce'
        )}
        strokeWidth={1.5}
      />

      {/* Inner glow */}
      <div className="absolute inset-2 rounded-xl bg-white/10" />
    </div>
  );
}

// ============================================
// TARS BADGE (Small inline indicator)
// ============================================

interface TarsBadgeProps {
  persona: TarsPersona;
  text?: string;
  className?: string;
}

export function TarsBadge({ persona, text = 'AI', className }: TarsBadgeProps) {
  const config = ALL_PERSONAS[persona];
  const Icon = PERSONA_ICONS[persona];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: config.colors.background,
        color: config.colors.primary,
      }}
    >
      <Icon size={12} />
      {text}
    </span>
  );
}

// ============================================
// TYPING INDICATOR
// ============================================

interface TarsTypingIndicatorProps {
  persona: TarsPersona;
  className?: string;
}

export function TarsTypingIndicator({ persona, className }: TarsTypingIndicatorProps) {
  const config = ALL_PERSONAS[persona];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <TarsAvatar persona={persona} size="sm" animated />

      <div
        className="flex items-center gap-1 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: config.colors.background }}
      >
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: config.colors.primary,
            animationDelay: '0ms',
          }}
        />
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: config.colors.primary,
            animationDelay: '150ms',
          }}
        />
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: config.colors.primary,
            animationDelay: '300ms',
          }}
        />
      </div>
    </div>
  );
}

// ============================================
// MESSAGE BUBBLE STYLING
// ============================================

interface TarsMessageStyleProps {
  persona: TarsPersona;
  isUser: boolean;
}

export function getTarsMessageStyles({ persona, isUser }: TarsMessageStyleProps): {
  containerClass: string;
  bubbleClass: string;
  textClass: string;
} {
  const config = ALL_PERSONAS[persona];

  if (isUser) {
    return {
      containerClass: 'justify-end',
      bubbleClass: 'bg-gray-900 text-white rounded-2xl rounded-br-md',
      textClass: 'text-white',
    };
  }

  return {
    containerClass: 'justify-start',
    bubbleClass: cn(
      'rounded-2xl rounded-bl-md',
      'border shadow-sm',
      config.colors.lightBg,
      `border-${config.colors.base}/20`
    ),
    textClass: config.colors.text,
  };
}

// Add custom CSS for slow spin animation
const styles = `
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
