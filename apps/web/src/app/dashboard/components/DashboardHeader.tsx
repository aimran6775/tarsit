'use client';

import { User } from 'lucide-react';

interface DashboardHeaderProps {
  firstName?: string;
  email?: string;
  onLogout: () => void;
}

export function DashboardHeader({ firstName, email, onLogout }: DashboardHeaderProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
              <User className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Welcome back, {firstName || 'User'}!
              </h1>
              <p className="text-sm text-white/50">
                {email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
