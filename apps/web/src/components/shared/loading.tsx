'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Loading({ 
  size = 'md', 
  text, 
  fullScreen = false,
  className = '' 
}: LoadingProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeMap[size]} text-purple-500 animate-spin`} />
      {text && <p className="text-sm text-neutral-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Spinner variant
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <Loader2 className={`h-5 w-5 animate-spin text-purple-500 ${className}`} />
  );
}

// Page loading skeleton
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}
