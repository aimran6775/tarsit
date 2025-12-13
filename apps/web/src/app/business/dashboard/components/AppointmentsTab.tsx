'use client';

import { Calendar, ChevronLeft, ChevronRight, Clock, Mail, Phone, Check, X } from 'lucide-react';
import type { Appointment } from '../types';
import { getStatusColor } from '../types';

interface AppointmentsTabProps {
  appointments: Appointment[];
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
}

export function AppointmentsTab({
  appointments,
  selectedMonth,
  setSelectedMonth,
  selectedDate,
  setSelectedDate,
  onConfirm,
  onCancel,
  onComplete,
}: AppointmentsTabProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => a.appointmentDate?.startsWith(dateStr));
  };

  const displayedAppointments = selectedDate
    ? getAppointmentsForDate(selectedDate)
    : appointments.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-white/50">
              {day}
            </div>
          ))}
          {getDaysInMonth(selectedMonth).map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="p-2" />;
            }
            
            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded-lg text-sm transition-colors relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : isToday
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-white/70 hover:bg-white/5'
                }`}
              >
                {date.getDate()}
                {dayAppointments.length > 0 && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-emerald-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail / Appointment List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold text-white mb-4">
          {selectedDate
            ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : 'All Appointments'}
        </h3>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {displayedAppointments.map(apt => (
            <div key={apt.id} className="p-4 border border-white/10 rounded-xl bg-white/5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-white">{apt.customerName}</p>
                  <p className="text-sm text-white/50">{apt.service?.name || 'Appointment'}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
              
              <div className="text-xs text-white/50 space-y-1 mb-3">
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {apt.startTime} - {apt.endTime}
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {apt.customerEmail}
                </p>
                {apt.customerPhone && (
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {apt.customerPhone}
                  </p>
                )}
              </div>
              
              {apt.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onConfirm(apt.id)}
                    className="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Confirm
                  </button>
                  <button
                    onClick={() => onCancel(apt.id)}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Decline
                  </button>
                </div>
              )}
              {apt.status === 'confirmed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onComplete(apt.id)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => onCancel(apt.id)}
                    className="px-3 py-1.5 border border-white/20 text-white/70 text-xs font-medium rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {displayedAppointments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/50">No appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
