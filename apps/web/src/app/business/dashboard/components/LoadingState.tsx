'use client';

import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-sm text-white/50">Loading dashboard...</p>
      </div>
    </div>
  );
}
