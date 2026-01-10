'use client';

import { Calendar, Check, ChevronLeft, ChevronRight, Clock, Download, ExternalLink, Mail, Phone, X } from 'lucide-react';
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
  businessName?: string;
}

/**
 * Generate iCal format string for a single appointment
 */
function generateICalEvent(apt: Appointment, businessName: string): string {
  const startDate = new Date(apt.appointmentDate);
  const [startHour, startMinute] = apt.startTime.split(':').map(Number);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  const endDate = new Date(apt.appointmentDate);
  const [endHour, endMinute] = apt.endTime.split(':').map(Number);
  endDate.setHours(endHour, endMinute, 0, 0);
  
  const formatDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const uid = `${apt.id}@tarsit.com`;
  const now = formatDate(new Date());
  
  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${apt.service?.name || 'Appointment'} - ${apt.customerName}
DESCRIPTION:Customer: ${apt.customerName}\\nEmail: ${apt.customerEmail}${apt.customerPhone ? '\\nPhone: ' + apt.customerPhone : ''}${apt.notes ? '\\nNotes: ' + apt.notes : ''}
STATUS:${apt.status === 'confirmed' ? 'CONFIRMED' : apt.status === 'cancelled' ? 'CANCELLED' : 'TENTATIVE'}
ORGANIZER;CN=${businessName}:mailto:noreply@tarsit.com
END:VEVENT`;
}

/**
 * Generate full iCal calendar file
 */
function generateICalendar(appointments: Appointment[], businessName: string): string {
  const events = appointments
    .filter(apt => apt.status !== 'cancelled')
    .map(apt => generateICalEvent(apt, businessName))
    .join('\n');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tarsit//Business Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${businessName} Appointments
${events}
END:VCALENDAR`;
}

/**
 * Download iCal file
 */
function downloadICalendar(appointments: Appointment[], businessName: string, filename: string) {
  const icalContent = generateICalendar(appointments, businessName);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Add single appointment to Google Calendar
 */
function addToGoogleCalendar(apt: Appointment) {
  const startDate = new Date(apt.appointmentDate);
  const [startHour, startMinute] = apt.startTime.split(':').map(Number);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  const endDate = new Date(apt.appointmentDate);
  const [endHour, endMinute] = apt.endTime.split(':').map(Number);
  endDate.setHours(endHour, endMinute, 0, 0);
  
  const formatGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${apt.service?.name || 'Appointment'} - ${apt.customerName}`,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: `Customer: ${apt.customerName}\nEmail: ${apt.customerEmail}${apt.customerPhone ? '\nPhone: ' + apt.customerPhone : ''}${apt.notes ? '\nNotes: ' + apt.notes : ''}`,
  });
  
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
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
  businessName = 'Business',
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

  const handleExportAll = () => {
    const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '-');
    downloadICalendar(appointments, businessName, `${businessName.replace(/\s+/g, '-')}-appointments-${monthName}.ics`);
  };

  const handleExportDay = () => {
    if (!selectedDate) return;
    const dayAppointments = getAppointmentsForDate(selectedDate);
    const dateStr = selectedDate.toISOString().split('T')[0];
    downloadICalendar(dayAppointments, businessName, `${businessName.replace(/\s+/g, '-')}-appointments-${dateStr}.ics`);
  };

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
              onClick={handleExportAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/70 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              title="Export all appointments to calendar"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">
            {selectedDate
              ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              : 'All Appointments'}
          </h3>
          {selectedDate && getAppointmentsForDate(selectedDate).length > 0 && (
            <button
              onClick={handleExportDay}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-white/70 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              title="Export day's appointments to calendar"
            >
              <Download className="h-3 w-3" />
              Export Day
            </button>
          )}
        </div>
        
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

              {/* Calendar integration buttons */}
              <div className="flex gap-2 mb-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => addToGoogleCalendar(apt)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
                  title="Add to Google Calendar"
                >
                  <ExternalLink className="h-3 w-3" />
                  Google
                </button>
                <button
                  onClick={() => downloadICalendar([apt], businessName, `appointment-${apt.id}.ics`)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
                  title="Download .ics file"
                >
                  <Download className="h-3 w-3" />
                  .ics
                </button>
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
