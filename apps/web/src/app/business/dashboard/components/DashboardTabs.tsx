'use client';

import { Eye, CalendarDays, Star, Image, Users, Clock, Settings } from 'lucide-react';
import type { Tab } from '../types';

interface DashboardTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const tabs = [
  { id: 'overview' as const, label: 'Overview', icon: Eye },
  { id: 'appointments' as const, label: 'Appointments', icon: CalendarDays },
  { id: 'reviews' as const, label: 'Reviews', icon: Star },
  { id: 'photos' as const, label: 'Photos', icon: Image },
  { id: 'team' as const, label: 'Team', icon: Users },
  { id: 'hours' as const, label: 'Hours', icon: Clock },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function DashboardTabs({ activeTab, setActiveTab }: DashboardTabsProps) {
  return (
    <div className="flex gap-1 mb-6 p-1 bg-white/5 backdrop-blur-xl rounded-xl w-fit border border-white/10">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
