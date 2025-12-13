'use client';

import { Save, Loader2 } from 'lucide-react';
import type { AppointmentSettings } from '../types';

interface SettingsTabProps {
  appointmentSettings: AppointmentSettings;
  setAppointmentSettings: (settings: AppointmentSettings) => void;
  isSavingSettings: boolean;
  onSaveSettings: () => void;
}

export function SettingsTab({
  appointmentSettings,
  setAppointmentSettings,
  isSavingSettings,
  onSaveSettings,
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Appointment Settings */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Appointment Settings</h2>
        
        <div className="space-y-6">
          {/* Enable Appointments Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div>
              <h3 className="font-medium text-white">Accept Appointments</h3>
              <p className="text-sm text-white/50">Allow customers to book appointments online</p>
            </div>
            <button
              onClick={() => setAppointmentSettings({ ...appointmentSettings, appointmentsEnabled: !appointmentSettings.appointmentsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                appointmentSettings.appointmentsEnabled ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                appointmentSettings.appointmentsEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {appointmentSettings.appointmentsEnabled && (
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Default Duration (minutes)
                </label>
                <select
                  value={appointmentSettings.appointmentDuration}
                  onChange={(e) => setAppointmentSettings({ ...appointmentSettings, appointmentDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value={15} className="bg-neutral-900">15 minutes</option>
                  <option value={30} className="bg-neutral-900">30 minutes</option>
                  <option value={45} className="bg-neutral-900">45 minutes</option>
                  <option value={60} className="bg-neutral-900">60 minutes</option>
                  <option value={90} className="bg-neutral-900">90 minutes</option>
                  <option value={120} className="bg-neutral-900">120 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Buffer Time (minutes)
                </label>
                <select
                  value={appointmentSettings.appointmentBuffer}
                  onChange={(e) => setAppointmentSettings({ ...appointmentSettings, appointmentBuffer: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value={0} className="bg-neutral-900">No buffer</option>
                  <option value={5} className="bg-neutral-900">5 minutes</option>
                  <option value={10} className="bg-neutral-900">10 minutes</option>
                  <option value={15} className="bg-neutral-900">15 minutes</option>
                  <option value={30} className="bg-neutral-900">30 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Advance Booking (days)
                </label>
                <select
                  value={appointmentSettings.advanceBookingDays}
                  onChange={(e) => setAppointmentSettings({ ...appointmentSettings, advanceBookingDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value={7} className="bg-neutral-900">1 week</option>
                  <option value={14} className="bg-neutral-900">2 weeks</option>
                  <option value={30} className="bg-neutral-900">1 month</option>
                  <option value={60} className="bg-neutral-900">2 months</option>
                  <option value={90} className="bg-neutral-900">3 months</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onSaveSettings}
            disabled={isSavingSettings}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
          >
            {isSavingSettings ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-white/50 mb-4">
          These actions are irreversible. Please be certain.
        </p>
        <button className="px-4 py-2 border-2 border-red-500/30 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10 transition-colors">
          Delete Business
        </button>
      </div>
    </div>
  );
}
