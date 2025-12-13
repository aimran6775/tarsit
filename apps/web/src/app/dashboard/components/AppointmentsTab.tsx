'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, Clock, MapPin, Building2, Check, X, 
  AlertCircle, Loader2, Phone, ExternalLink 
} from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentsTabProps {
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  cancellingId: string | null;
  onCancelAppointment: (id: string) => void;
}

export function AppointmentsTab({ 
  upcomingAppointments, 
  pastAppointments, 
  cancellingId, 
  onCancelAppointment 
}: AppointmentsTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400';
      case 'pending': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'no_show': return 'bg-white/10 text-white/50';
      default: return 'bg-white/10 text-white/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Check className="h-3.5 w-3.5" />;
      case 'pending': return <AlertCircle className="h-3.5 w-3.5" />;
      case 'completed': return <Check className="h-3.5 w-3.5" />;
      case 'cancelled': return <X className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Appointments</h2>
        
        {upcomingAppointments.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white/40" />
            </div>
            <h3 className="font-medium text-white mb-2">No upcoming appointments</h3>
            <p className="text-sm text-white/50 mb-6">Book your first appointment to get started</p>
            <Link 
              href="/search"
              className="inline-flex px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
            >
              Find Businesses
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments
              .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
              .map((apt) => (
              <div key={apt.id} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5">
                <div className="flex items-start gap-4">
                  <Link href={`/business/${apt.business.slug}`} className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                      {apt.business?.logoImage ? (
                        <Image src={apt.business.logoImage} alt="" width={56} height={56} className="object-cover" />
                      ) : (
                        <Building2 className="h-6 w-6 text-white/40" />
                      )}
                    </div>
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/business/${apt.business.slug}`} className="font-semibold text-white hover:text-purple-400 transition-colors">
                          {apt.business?.name}
                        </Link>
                        <p className="text-sm text-white/50">{apt.service?.name || 'Appointment'}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                        {getStatusIcon(apt.status)}
                        {apt.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-white/40" />
                        {new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric' 
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-white/40" />
                        {apt.startTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-white/40" />
                        {apt.business?.city}, {apt.business?.state}
                      </span>
                    </div>
                    
                    {apt.notes && (
                      <p className="mt-2 text-sm text-white/50 bg-white/5 rounded-lg p-2 border border-white/5">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    {apt.business.phone && (
                      <a 
                        href={`tel:${apt.business.phone}`}
                        className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    )}
                    <Link 
                      href={`/business/${apt.business.slug}`}
                      className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Business
                    </Link>
                  </div>
                  
                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
                    <button
                      onClick={() => onCancelAppointment(apt.id)}
                      disabled={cancellingId === apt.id}
                      className="text-sm text-red-400 hover:text-red-300 font-medium disabled:opacity-50 transition-colors"
                    >
                      {cancellingId === apt.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Cancel'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Past Appointments</h2>
          <div className="space-y-3">
            {pastAppointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                      {apt.business?.logoImage ? (
                        <Image src={apt.business.logoImage} alt="" width={40} height={40} className="object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5 text-white/40" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white/70">{apt.business?.name}</p>
                      <p className="text-sm text-white/50">
                        {new Date(apt.appointmentDate).toLocaleDateString()} • {apt.service?.name || 'Appointment'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
