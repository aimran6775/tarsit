'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  theme?: 'customer' | 'business';
}

export function PasswordStrength({ password, theme = 'customer' }: PasswordStrengthProps) {
  const requirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];

  const passedCount = requirements.filter(req => req.test(password)).length;
  const strengthPercent = (passedCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercent <= 20) return 'bg-red-500';
    if (strengthPercent <= 40) return 'bg-orange-500';
    if (strengthPercent <= 60) return 'bg-yellow-500';
    if (strengthPercent <= 80) return theme === 'customer' ? 'bg-purple-500' : 'bg-teal-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strengthPercent <= 20) return 'Very weak';
    if (strengthPercent <= 40) return 'Weak';
    if (strengthPercent <= 60) return 'Fair';
    if (strengthPercent <= 80) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-3">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400">Password strength</span>
          <span className={cn(
            "font-medium",
            strengthPercent === 100 ? 'text-green-400' : 'text-neutral-400'
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300 rounded-full", getStrengthColor())}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
      </div>

      {/* Requirements list */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <div key={req.label} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-neutral-600" />
              )}
              <span className={passed ? 'text-green-400' : 'text-neutral-500'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
