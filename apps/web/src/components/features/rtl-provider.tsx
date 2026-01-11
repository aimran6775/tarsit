'use client';

import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface RTLProviderProps {
  children: ReactNode;
  className?: string;
}

/**
 * RTL-aware wrapper component that applies direction-specific styles
 */
export function RTLProvider({ children, className }: RTLProviderProps) {
  const { direction, isRTL } = useLanguage();

  return (
    <div
      dir={direction}
      className={cn(
        'min-h-screen',
        isRTL && 'font-arabic',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Component that flips its content in RTL mode
 */
export function RTLFlip({ children, className }: RTLProviderProps) {
  const { isRTL } = useLanguage();

  return (
    <div className={cn(isRTL && 'scale-x-[-1]', className)}>
      {children}
    </div>
  );
}

/**
 * Icon wrapper that flips directional icons (arrows, chevrons) in RTL
 */
export function DirectionalIcon({
  children,
  className,
  flip = true,
}: {
  children: ReactNode;
  className?: string;
  flip?: boolean;
}) {
  const { isRTL } = useLanguage();

  return (
    <span className={cn(flip && isRTL && 'inline-block scale-x-[-1]', className)}>
      {children}
    </span>
  );
}

/**
 * Text alignment component
 */
export function AlignedText({
  children,
  align = 'start',
  className,
}: {
  children: ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
}) {
  const alignClasses = {
    start: 'text-start',
    end: 'text-end',
    center: 'text-center',
  };

  return <div className={cn(alignClasses[align], className)}>{children}</div>;
}

/**
 * Hook to get RTL-aware class utilities
 */
export function useRTLClasses() {
  const { isRTL } = useLanguage();

  return {
    // Text alignment
    textStart: 'text-start',
    textEnd: 'text-end',

    // Flexbox - reverse row in RTL
    flexRow: isRTL ? 'flex-row-reverse' : 'flex-row',

    // Margin auto
    marginStart: 'ms-auto',
    marginEnd: 'me-auto',

    // Padding
    paddingStart: (size: number) => `ps-${size}`,
    paddingEnd: (size: number) => `pe-${size}`,

    // Border
    borderStart: 'border-s',
    borderEnd: 'border-e',

    // Position
    start0: 'start-0',
    end0: 'end-0',

    // Rounded
    roundedStart: isRTL ? 'rounded-r' : 'rounded-l',
    roundedEnd: isRTL ? 'rounded-l' : 'rounded-r',

    // Translate/Transform for directional icons
    flipIcon: isRTL ? 'scale-x-[-1]' : '',
  };
}
