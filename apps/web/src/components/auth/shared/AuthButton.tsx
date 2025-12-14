'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'social' | 'ghost';
  theme?: 'customer' | 'business';
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    theme = 'customer', 
    isLoading, 
    icon: Icon, 
    iconPosition = 'right',
    className, 
    disabled,
    ...props 
  }, ref) => {
    const themeStyles = {
      customer: {
        primary: 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]',
        secondary: 'bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50',
      },
      business: {
        primary: 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]',
        secondary: 'bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50',
      },
    };

    const baseStyles = {
      primary: themeStyles[theme].primary,
      secondary: themeStyles[theme].secondary,
      social: 'bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 hover:border-neutral-600',
      ghost: 'text-neutral-400 hover:text-white hover:bg-white/5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative h-12 px-6 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
          baseStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="h-5 w-5" />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className="h-5 w-5" />}
          </>
        )}
      </button>
    );
  }
);

AuthButton.displayName = 'AuthButton';
