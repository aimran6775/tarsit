'use client';

import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  showPasswordToggle?: boolean;
  theme?: 'customer' | 'business';
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon: Icon, error, showPasswordToggle, theme = 'customer', className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    const themeColors = {
      customer: {
        focus: 'focus:border-purple-500/50 focus:ring-purple-500/20',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
        icon: 'text-purple-400',
      },
      business: {
        focus: 'focus:border-teal-500/50 focus:ring-teal-500/20',
        glow: 'shadow-[0_0_20px_rgba(20,184,166,0.15)]',
        icon: 'text-teal-400',
      },
    };

    const colors = themeColors[theme];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-300">
          {label}
        </label>
        <div className="relative group">
          {Icon && (
            <Icon 
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200",
                isFocused ? colors.icon : "text-neutral-500"
              )} 
            />
          )}
          <input
            ref={ref}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full h-12 bg-neutral-900/80 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 text-sm transition-all duration-200",
              "focus:outline-none focus:ring-2",
              colors.focus,
              isFocused && colors.glow,
              Icon ? "pl-12" : "pl-4",
              showPasswordToggle ? "pr-12" : "pr-4",
              error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
