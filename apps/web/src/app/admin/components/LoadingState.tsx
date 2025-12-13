'use client';

import { Loader2, Shield } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="h-8 w-8 text-purple-400" />
          </div>
          <Loader2 className="absolute -inset-2 h-24 w-24 text-purple-500 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Admin Dashboard</h2>
        <p className="text-white/50">Loading system data...</p>
      </div>
    </div>
  );
}
