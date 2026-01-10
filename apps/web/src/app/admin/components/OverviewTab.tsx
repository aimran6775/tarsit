'use client';

import {
  Users, Building2, Star, Calendar, Shield, Activity,
  TrendingUp, MessageSquare, ArrowUpRight, ArrowDownRight,
  ChevronRight, Zap, AlertCircle, CheckCircle, Clock, Globe
} from 'lucide-react';
import type { RealTimeStats, TabType } from '../types';
import { formatNumber } from '../types';

interface OverviewTabProps {
  stats: RealTimeStats | null;
  setActiveTab: (tab: TabType) => void;
}

export function OverviewTab({ stats, setActiveTab }: OverviewTabProps) {
  const statCards = [
    {
      label: 'Total Users',
      value: stats?.overview.totalUsers || 0,
      change: stats?.growth.userGrowth || 0,
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Total Businesses',
      value: stats?.overview.totalBusinesses || 0,
      change: stats?.growth.businessGrowth || 0,
      icon: Building2,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Total Reviews',
      value: stats?.overview.totalReviews || 0,
      change: stats?.growth.reviewGrowth || 0,
      icon: Star,
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Appointments',
      value: stats?.overview.totalAppointments || 0,
      change: 0,
      icon: Calendar,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  const realTimeCards = [
    { label: 'Online Users', value: stats?.realTime.onlineUsers || 0, icon: Globe, color: 'text-emerald-400' },
    { label: 'Active Today', value: stats?.realTime.activeUsers24h || 0, icon: Activity, color: 'text-blue-400' },
    { label: 'New Users (24h)', value: stats?.realTime.newUsers24h || 0, icon: Users, color: 'text-purple-400' },
    { label: 'Active Chats', value: stats?.realTime.activeChats || 0, icon: MessageSquare, color: 'text-cyan-400' },
    { label: 'Pending Verifications', value: stats?.realTime.pendingVerifications || 0, icon: Shield, color: 'text-amber-400' },
    { label: 'New Businesses (24h)', value: stats?.realTime.newBusinesses24h || 0, icon: Building2, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Data
        </span>
        <span>•</span>
        <span>Last updated: {stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : 'N/A'}</span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <h3 className="text-3xl font-bold text-white">{formatNumber(stat.value)}</h3>
            <p className="text-sm text-white/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Real-time Activity Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {realTimeCards.map((card) => (
          <div
            key={card.label}
            className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center hover:bg-white/10 transition-all"
          >
            <card.icon className={`h-5 w-5 ${card.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white">{formatNumber(card.value)}</p>
            <p className="text-xs text-white/50 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Recent Activity
            </h3>
            <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {stats?.recentActivities?.newUsers?.slice(0, 3).map((user: any, i: number) => (
              <div key={user.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.firstName} {user.lastName} joined
                  </p>
                  <p className="text-xs text-white/50">{user.email}</p>
                </div>
                <span className="text-xs text-white/40">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}

            {stats?.recentActivities?.newBusinesses?.slice(0, 2).map((biz: any, i: number) => (
              <div key={biz.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {biz.name} registered
                  </p>
                  <p className="text-xs text-white/50">
                    by {biz.owner?.firstName} {biz.owner?.lastName}
                  </p>
                </div>
                <span className="text-xs text-white/40">
                  {new Date(biz.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}

            {(!stats?.recentActivities?.newUsers?.length && !stats?.recentActivities?.newBusinesses?.length) && (
              <div className="text-center py-8">
                <Activity className="h-10 w-10 text-white/10 mx-auto mb-2" />
                <p className="text-sm text-white/50">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              Pending Actions
            </h3>
            <button 
              onClick={() => setActiveTab('verifications')}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {(stats?.realTime.pendingVerifications || 0) > 0 && (
              <button
                onClick={() => setActiveTab('verifications')}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-amber-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Verification Requests</p>
                    <p className="text-xs text-white/50">Business verifications pending review</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-semibold">
                  {stats?.realTime.pendingVerifications}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('reviews')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-purple-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Content Moderation</p>
                  <p className="text-xs text-white/50">Review flagged content</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/30" />
            </button>

            <button
              onClick={() => setActiveTab('businesses')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-emerald-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Business Management</p>
                  <p className="text-xs text-white/50">Manage business listings</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/30" />
            </button>

            {(stats?.realTime.pendingVerifications || 0) === 0 && (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-medium">All caught up!</p>
                <p className="text-sm text-white/50">No urgent actions needed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
          <TrendingUp className="h-8 w-8 mb-3 opacity-80" />
          <h3 className="text-2xl font-bold">{stats?.growth.userGrowth || 0}%</h3>
          <p className="text-blue-100 text-sm">User Growth</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
          <Building2 className="h-8 w-8 mb-3 opacity-80" />
          <h3 className="text-2xl font-bold">{stats?.growth.businessGrowth || 0}%</h3>
          <p className="text-emerald-100 text-sm">Business Growth</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <Star className="h-8 w-8 mb-3 opacity-80" />
          <h3 className="text-2xl font-bold">{stats?.growth.reviewGrowth || 0}%</h3>
          <p className="text-purple-100 text-sm">Review Growth</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-6 text-white">
          <Clock className="h-8 w-8 mb-3 opacity-80" />
          <h3 className="text-2xl font-bold">99.9%</h3>
          <p className="text-amber-100 text-sm">Uptime</p>
        </div>
      </div>
    </div>
  );
}
