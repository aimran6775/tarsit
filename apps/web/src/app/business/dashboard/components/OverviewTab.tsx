'use client';

import { Calendar, AlertCircle, Star, Users, User, ChevronRight } from 'lucide-react';
import type { BusinessStats, Appointment, Review, Tab } from '../types';
import { getStatusColor } from '../types';

interface OverviewTabProps {
  stats: BusinessStats | null;
  appointments: Appointment[];
  reviews: Review[];
  teamMembersCount: number;
  setActiveTab: (tab: Tab) => void;
}

export function OverviewTab({ stats, appointments, reviews, teamMembersCount, setActiveTab }: OverviewTabProps) {
  const statItems = [
    { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'Pending', value: stats?.pendingAppointments || 0, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { label: 'Reviews', value: stats?.totalReviews || 0, icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'Team Members', value: teamMembersCount, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map(stat => (
          <div key={stat.label} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/50">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Appointments</h2>
          <button
            onClick={() => setActiveTab('appointments')}
            className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {appointments.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="h-12 w-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/50">No appointments yet</p>
            <p className="text-sm text-white/30 mt-1">Appointments will appear here when customers book</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-white/50" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{apt.customerName}</p>
                    <p className="text-sm text-white/50">{apt.service?.name || 'General Appointment'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Reviews</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <Star className="h-12 w-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/50">No reviews yet</p>
            <p className="text-sm text-white/30 mt-1">Customer reviews will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 3).map(review => (
              <div key={review.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-white/30">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-white/70">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
