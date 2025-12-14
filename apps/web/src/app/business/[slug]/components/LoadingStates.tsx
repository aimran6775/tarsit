'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-white/10"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-white/50">Loading business...</p>
      </div>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-white/40" />
      </div>
      <h1 className="text-xl font-semibold text-white mb-2">Business Not Found</h1>
      <p className="text-sm text-white/50 mb-8">The business you're looking for doesn't exist or has been removed.</p>
      <Link 
        href="/search"
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-colors shadow-lg shadow-purple-500/25"
      >
        Browse All Businesses
      </Link>
    </div>
  );
}
