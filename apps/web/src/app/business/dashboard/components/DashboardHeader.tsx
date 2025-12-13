'use client';

import Link from 'next/link';
import { Building2, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
  onLogout: () => void;
}

export function DashboardHeader({ userName, onLogout }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Tarsit</span>
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-medium text-white/50">Business Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{userName}</span>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
