'use client';

import { useState } from 'react';
import {
  Save,
  Loader2,
  Eye,
  EyeOff,
  MessageSquare,
  Calendar,
  Star,
  Clock,
  Phone,
  Globe,
  Mail,
  Briefcase,
  AlertTriangle,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AppointmentSettings } from '../types';

interface VisibilitySettings {
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showHours: boolean;
  showServices: boolean;
  showReviews: boolean;
  messagesEnabled: boolean;
}

interface SettingsTabProps {
  appointmentSettings: AppointmentSettings;
  setAppointmentSettings: (settings: AppointmentSettings) => void;
  visibilitySettings?: VisibilitySettings;
  setVisibilitySettings?: (settings: VisibilitySettings) => void;
  isSavingSettings: boolean;
  onSaveSettings: () => void;
  onContactSupport?: () => void;
}

// Toggle Switch Component
function ToggleSwitch({
  enabled,
  onChange,
  size = 'default',
}: {
  enabled: boolean;
  onChange: () => void;
  size?: 'small' | 'default';
}) {
  const sizes = {
    small: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    default: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
  };
  const s = sizes[size];

  return (
    <button
      type="button"
      onClick={onChange}
      className={`${s.track} rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-white/20'
        }`}
    >
      <div
        className={`${s.thumb} bg-white rounded-full shadow-sm transition-transform ${enabled ? s.translate : 'translate-x-0.5'
          }`}
      />
    </button>
  );
}

// Settings Section Component
function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  defaultExpanded = true,
  variant = 'default',
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  variant?: 'default' | 'danger';
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const borderColor = variant === 'danger' ? 'border-red-500/30' : 'border-white/10';

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border ${borderColor} overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${variant === 'danger' ? 'bg-red-500/20' : 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${variant === 'danger' ? 'text-red-400' : 'text-purple-400'}`} />
          </div>
          <div className="text-left">
            <h2 className={`text-lg font-semibold ${variant === 'danger' ? 'text-red-400' : 'text-white'}`}>{title}</h2>
            {description && (
              <p className="text-sm text-white/50">{description}</p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white/50" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/50" />
        )}
      </button>
      {isExpanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// Toggle Row Component
function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
  iconColor = 'text-purple-400',
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="text-sm text-white/50">{description}</p>
        </div>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} />
    </div>
  );
}

export function SettingsTab({
  appointmentSettings,
  setAppointmentSettings,
  visibilitySettings = {
    showPhone: true,
    showEmail: true,
    showWebsite: true,
    showHours: true,
    showServices: true,
    showReviews: true,
    messagesEnabled: true,
  },
  setVisibilitySettings,
  isSavingSettings,
  onSaveSettings,
  onContactSupport,
}: SettingsTabProps) {
  // Local state if no external setter provided
  const [localVisibility, setLocalVisibility] = useState(visibilitySettings);
  const visibility = setVisibilitySettings ? visibilitySettings : localVisibility;
  const setVisibility = setVisibilitySettings || setLocalVisibility;

  const updateVisibility = (key: keyof VisibilitySettings) => {
    setVisibility({ ...visibility, [key]: !visibility[key] });
  };
  return (
    <div className="space-y-6">
      {/* Profile Visibility Section */}
      <SettingsSection
        title="Profile Visibility"
        description="Control what information is shown on your public profile"
        icon={Eye}
        defaultExpanded={true}
      >
        <div className="space-y-3">
          <ToggleRow
            icon={Phone}
            title="Show Phone Number"
            description="Display your phone number on your business profile"
            enabled={visibility.showPhone}
            onChange={() => updateVisibility('showPhone')}
            iconColor="text-green-400"
          />
          <ToggleRow
            icon={Mail}
            title="Show Email Address"
            description="Display your email on your business profile"
            enabled={visibility.showEmail}
            onChange={() => updateVisibility('showEmail')}
            iconColor="text-blue-400"
          />
          <ToggleRow
            icon={Globe}
            title="Show Website"
            description="Display your website link on your profile"
            enabled={visibility.showWebsite}
            onChange={() => updateVisibility('showWebsite')}
            iconColor="text-cyan-400"
          />
          <ToggleRow
            icon={Clock}
            title="Show Business Hours"
            description="Display your operating hours on your profile"
            enabled={visibility.showHours}
            onChange={() => updateVisibility('showHours')}
            iconColor="text-orange-400"
          />
          <ToggleRow
            icon={Briefcase}
            title="Show Services"
            description="Display your services list on your profile"
            enabled={visibility.showServices}
            onChange={() => updateVisibility('showServices')}
            iconColor="text-purple-400"
          />
          <ToggleRow
            icon={Star}
            title="Show Reviews"
            description="Display customer reviews on your profile"
            enabled={visibility.showReviews}
            onChange={() => updateVisibility('showReviews')}
            iconColor="text-yellow-400"
          />
        </div>
      </SettingsSection>

      {/* Features Section */}
      <SettingsSection
        title="Features"
        description="Enable or disable features for your business"
        icon={Shield}
        defaultExpanded={true}
      >
        <div className="space-y-3">
          <ToggleRow
            icon={Calendar}
            title="Online Appointments"
            description="Allow customers to book appointments online"
            enabled={appointmentSettings.appointmentsEnabled}
            onChange={() =>
              setAppointmentSettings({
                ...appointmentSettings,
                appointmentsEnabled: !appointmentSettings.appointmentsEnabled,
              })
            }
            iconColor="text-emerald-400"
          />
          <ToggleRow
            icon={MessageSquare}
            title="Customer Messaging"
            description="Allow customers to send you messages"
            enabled={visibility.messagesEnabled}
            onChange={() => updateVisibility('messagesEnabled')}
            iconColor="text-indigo-400"
          />
        </div>

        {/* Appointment Settings (shown when enabled) */}
        {appointmentSettings.appointmentsEnabled && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-white/70 mb-4">
              Appointment Configuration
            </h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Default Duration
                </label>
                <select
                  value={appointmentSettings.appointmentDuration}
                  onChange={(e) =>
                    setAppointmentSettings({
                      ...appointmentSettings,
                      appointmentDuration: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                  Buffer Time
                </label>
                <select
                  value={appointmentSettings.appointmentBuffer}
                  onChange={(e) =>
                    setAppointmentSettings({
                      ...appointmentSettings,
                      appointmentBuffer: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                  Advance Booking
                </label>
                <select
                  value={appointmentSettings.advanceBookingDays}
                  onChange={(e) =>
                    setAppointmentSettings({
                      ...appointmentSettings,
                      advanceBookingDays: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value={7} className="bg-neutral-900">1 week</option>
                  <option value={14} className="bg-neutral-900">2 weeks</option>
                  <option value={30} className="bg-neutral-900">1 month</option>
                  <option value={60} className="bg-neutral-900">2 months</option>
                  <option value={90} className="bg-neutral-900">3 months</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </SettingsSection>

      {/* Help & Support Section */}
      <SettingsSection
        title="Help & Support"
        description="Get help with your business dashboard"
        icon={HelpCircle}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          <p className="text-white/60 text-sm">
            Need help setting up your business or have questions? Our support team is here to help.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={onContactSupport}
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-xl text-purple-400 hover:from-purple-600/30 hover:to-indigo-600/30 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Contact Support</span>
            </button>
            <a
              href="/help/business"
              target="_blank"
              className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help Center</span>
            </a>
          </div>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={onSaveSettings}
          disabled={isSavingSettings}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
        >
          {isSavingSettings ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save All Settings
        </button>
      </div>

      {/* Danger Zone */}
      <SettingsSection
        title="Danger Zone"
        description="Irreversible actions for your business"
        icon={AlertTriangle}
        defaultExpanded={false}
        variant="danger"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400">Delete Business</h4>
                <p className="text-sm text-white/50 mt-1">
                  Permanently delete your business listing and all associated data.
                  This action cannot be undone.
                </p>
                <button className="mt-3 px-4 py-2 border-2 border-red-500/30 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10 transition-colors">
                  Delete Business
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <EyeOff className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-400">Temporarily Hide Business</h4>
                <p className="text-sm text-white/50 mt-1">
                  Hide your business from search results and public view. You can
                  unhide it anytime.
                </p>
                <button className="mt-3 px-4 py-2 border-2 border-amber-500/30 text-amber-400 text-sm font-medium rounded-lg hover:bg-amber-500/10 transition-colors">
                  Hide Business
                </button>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
