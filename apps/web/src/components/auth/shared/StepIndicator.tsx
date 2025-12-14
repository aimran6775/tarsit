'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  theme?: 'customer' | 'business';
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, theme = 'customer', labels }: StepIndicatorProps) {
  const themeColors = {
    customer: {
      active: 'bg-purple-500',
      completed: 'bg-purple-500',
      inactive: 'bg-neutral-700',
      line: 'bg-purple-500',
      lineInactive: 'bg-neutral-700',
      text: 'text-purple-400',
    },
    business: {
      active: 'bg-teal-500',
      completed: 'bg-teal-500',
      inactive: 'bg-neutral-700',
      line: 'bg-teal-500',
      lineInactive: 'bg-neutral-700',
      text: 'text-teal-400',
    },
  };

  const colors = themeColors[theme];

  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step circle */}
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                index < currentStep && colors.completed,
                index === currentStep && `${colors.active} ring-4 ring-opacity-30`,
                index === currentStep && (theme === 'customer' ? 'ring-purple-500' : 'ring-teal-500'),
                index > currentStep && colors.inactive,
                index <= currentStep ? 'text-white' : 'text-neutral-400'
              )}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            
            {/* Connecting line */}
            {index < totalSteps - 1 && (
              <div 
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all duration-300",
                  index < currentStep ? colors.line : colors.lineInactive
                )}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Labels */}
      {labels && (
        <div className="flex justify-between">
          {labels.map((label, index) => (
            <span 
              key={label}
              className={cn(
                "text-xs font-medium transition-colors duration-300",
                index <= currentStep ? colors.text : 'text-neutral-500'
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
