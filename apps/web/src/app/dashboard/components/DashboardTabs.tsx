'use client';

import { Calendar, Heart, MessageSquare, Settings, LucideIcon } from 'lucide-react';
import { TabId } from '../types';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface DashboardTabsProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  upcomingCount: number;
  favoritesCount: number;
  unreadCount: number;
}

export function DashboardTabs({ 
  activeTab, 
  setActiveTab, 
  upcomingCount, 
  favoritesCount, 
  unreadCount 
}: DashboardTabsProps) {
  const tabs: Tab[] = [
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: upcomingCount },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favoritesCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10 mt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-white/50 hover:text-white/70'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
