'use client';

import { Bell, Menu, RefreshCw, Search, Shield } from 'lucide-react';
import type { TabType } from '../types';

interface TopHeaderProps {
  activeTab: TabType;
  onMenuClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const tabLabels: Record<TabType, { title: string; description: string }> = {
  overview: {
    title: 'Dashboard Overview',
    description: 'Real-time platform monitoring and analytics',
  },
  users: { title: 'User Management', description: 'Manage all platform users and permissions' },
  businesses: { title: 'Business Management', description: 'Oversee all registered businesses' },
  verifications: {
    title: 'Verification Requests',
    description: 'Review and process business verifications',
  },
  reviews: {
    title: 'Content Moderation',
    description: 'Manage reviews and user-generated content',
  },
  categories: { title: 'Category Management', description: 'Organize business categories' },
  tars: { title: 'Tars AI Management', description: 'Manage AI settings and interactions' },
  system: { title: 'System Monitoring', description: 'Server health and performance metrics' },
  reports: { title: 'Reports & Analytics', description: 'Generate and export platform reports' },
  'audit-logs': { title: 'Audit Logs', description: 'Track all administrative actions' },
  settings: { title: 'Platform Settings', description: 'Configure system-wide preferences' },
};

export function TopHeader({ activeTab, onMenuClick, onRefresh, isRefreshing }: TopHeaderProps) {
  const tab = tabLabels[activeTab];
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="h-5 w-5 text-white/70" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{tab.title}</h2>
            <p className="text-sm text-white/50">{tab.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <Search className="h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Quick search..."
              className="bg-transparent text-white text-sm placeholder:text-white/40 focus:outline-none w-40"
            />
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/40">⌘K</kbd>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Notifications */}
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative">
            <Bell className="h-5 w-5 text-white/70" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* Admin Profile */}
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-white/50">{currentDate}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
