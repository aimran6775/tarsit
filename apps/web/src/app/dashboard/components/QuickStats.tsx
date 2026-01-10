'use client';

import { Calendar, Heart, MessageSquare, Check, LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

interface QuickStatsProps {
  upcomingCount: number;
  favoritesCount: number;
  messagesCount: number;
  completedCount: number;
}

export function QuickStats({ upcomingCount, favoritesCount, messagesCount, completedCount }: QuickStatsProps) {
  const stats: Stat[] = [
    { label: 'Upcoming', value: upcomingCount, icon: Calendar, color: 'from-blue-500/20 to-blue-600/20 text-blue-400' },
    { label: 'Favorites', value: favoritesCount, icon: Heart, color: 'from-rose-500/20 to-rose-600/20 text-rose-400' },
    { label: 'Messages', value: messagesCount, icon: MessageSquare, color: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400' },
    { label: 'Past Visits', value: completedCount, icon: Check, color: 'from-purple-500/20 to-purple-600/20 text-purple-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
