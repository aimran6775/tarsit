'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  theme?: 'customer' | 'business';
  visualContent?: ReactNode;
  visualPosition?: 'left' | 'right';
}

export function AuthLayout({ 
  children, 
  theme = 'customer', 
  visualContent,
  visualPosition = 'right' 
}: AuthLayoutProps) {
  const themeStyles = {
    customer: {
      logo: 'text-purple-400',
      gradientOrb1: 'bg-purple-600/20',
      gradientOrb2: 'bg-violet-600/20',
      visualBg: 'from-purple-950/50 via-neutral-950 to-neutral-950',
    },
    business: {
      logo: 'text-teal-400',
      gradientOrb1: 'bg-teal-600/20',
      gradientOrb2: 'bg-emerald-600/20',
      visualBg: 'from-teal-950/50 via-neutral-950 to-neutral-950',
    },
  };

  const colors = themeStyles[theme];

  const FormSection = (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
      {/* Subtle gradient orbs */}
      <div className={cn("absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-30", colors.gradientOrb1)} />
      <div className={cn("absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20", colors.gradientOrb2)} />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
          <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
            theme === 'customer' ? 'from-purple-500 to-purple-600' : 'from-teal-500 to-teal-600'
          )}>
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-semibold text-white group-hover:text-neutral-300 transition-colors">
            tarsit
          </span>
          {theme === 'business' && (
            <span className="text-xs font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
              Business
            </span>
          )}
        </Link>
        
        {children}
      </div>
    </div>
  );

  const VisualSection = visualContent && (
    <div className={cn(
      "hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden",
      "bg-gradient-to-br border-neutral-800/50",
      colors.visualBg,
      visualPosition === 'left' ? 'border-r' : 'border-l'
    )}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className={cn(
          "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse",
          colors.gradientOrb1
        )} />
        <div className={cn(
          "absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000",
          colors.gradientOrb2
        )} />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="relative z-10 max-w-lg">
        {visualContent}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {visualPosition === 'left' ? (
        <>
          {VisualSection}
          {FormSection}
        </>
      ) : (
        <>
          {FormSection}
          {VisualSection}
        </>
      )}
    </div>
  );
}
