'use client';

import Link from 'next/link';
import {
  Shield, BarChart3, Users, Building2, CheckCircle, Star,
  Grid, Server, FileText, History, Settings, Bell, LogOut, X
} from 'lucide-react';
import type { TabType } from '../types';

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pendingVerifications: number;
  onLogout: () => void;
}

const tabs: Array<{ id: TabType; label: string; icon: typeof BarChart3; badge?: boolean }> = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'businesses', label: 'Businesses', icon: Building2 },
  { id: 'verifications', label: 'Verifications', icon: CheckCircle, badge: true },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'categories', label: 'Categories', icon: Grid },
  { id: 'system', label: 'System', icon: Server },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'audit-logs', label: 'Audit Logs', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  pendingVerifications,
  onLogout,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-neutral-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Tarsit</h1>
                <p className="text-xs text-purple-400 font-medium">Admin Console</p>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider px-4 mb-3">
              Main Menu
            </div>
            
            {tabs.slice(0, 5).map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </div>
                {tab.badge && pendingVerifications > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {pendingVerifications}
                  </span>
                )}
              </button>
            ))}

            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider px-4 mb-3 mt-6">
              Management
            </div>

            {tabs.slice(5).map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all relative">
              <Bell className="h-5 w-5" />
              Notifications
              <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>

          {/* Version Info */}
          <div className="px-6 py-3 border-t border-white/5">
            <p className="text-xs text-white/30">Admin Console v2.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
