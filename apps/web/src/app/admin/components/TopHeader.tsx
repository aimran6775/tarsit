'use client';

import { Bell, Clock, Globe, Menu, RefreshCw, Search, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { TabType } from '../types';

interface TopHeaderProps {
  activeTab: TabType;
  onMenuClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

// Global time zones to display
const timeZones = [
  { id: 'local', label: 'Local', zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: 'utc', label: 'UTC', zone: 'UTC' },
  { id: 'ny', label: 'NY', zone: 'America/New_York' },
  { id: 'london', label: 'LON', zone: 'Europe/London' },
  { id: 'tokyo', label: 'TYO', zone: 'Asia/Tokyo' },
];

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
  regions: { title: 'Region Management', description: 'Manage global regions and localization' },
  currencies: { title: 'Currency Management', description: 'Manage currencies and exchange rates' },
  translations: { title: 'Translation Management', description: 'Manage multi-language content' },
  emails: { title: 'Email Management', description: 'Monitor email logs, templates, and deliverability' },
  tars: { title: 'Tars AI Management', description: 'Manage AI settings and interactions' },
  system: { title: 'System Monitoring', description: 'Server health and performance metrics' },
  reports: { title: 'Reports & Analytics', description: 'Generate and export platform reports' },
  'audit-logs': { title: 'Audit Logs', description: 'Track all administrative actions' },
  settings: { title: 'Platform Settings', description: 'Configure system-wide preferences' },
};

export function TopHeader({ activeTab, onMenuClick, onRefresh, isRefreshing }: TopHeaderProps) {
  const tab = tabLabels[activeTab];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWorldClocks, setShowWorldClocks] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date, timeZone?: string) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone,
    });
  };

  const formatShortTime = (date: Date, timeZone: string) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    });
  };

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

          {/* Date & Time */}
          <div className="relative">
            <button
              onClick={() => setShowWorldClocks(!showWorldClocks)}
              className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white font-mono">{formatTime(currentTime)}</p>
                <p className="text-xs text-white/50">{formatDate(currentTime)}</p>
              </div>
            </button>

            {/* World Clocks Dropdown */}
            {showWorldClocks && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">World Clocks</span>
                </div>
                <div className="p-2 space-y-1">
                  {timeZones.map((tz) => (
                    <div
                      key={tz.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5"
                    >
                      <span className="text-sm text-white/70">{tz.label}</span>
                      <span className="text-sm font-mono text-white">{formatShortTime(currentTime, tz.zone)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
