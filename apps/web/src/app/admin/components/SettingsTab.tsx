'use client';

import { useState } from 'react';
import { 
  Settings, Save, Shield, Database,
  ToggleLeft, AlertCircle, Check
} from 'lucide-react';
import type { PlatformSettings } from '../types';

interface SettingsTabProps {
  settings: PlatformSettings | null;
  onUpdateSettings: (settings: Partial<PlatformSettings>) => void;
}

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon, children }: SettingsSectionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/50">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function ToggleSetting({ label, description, enabled, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-white">{label}</p>
        {description && <p className="text-sm text-white/50">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-purple-500' : 'bg-white/20'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const [localSettings, setLocalSettings] = useState<PlatformSettings>(
    settings || {
      platformName: 'Tarsit',
      platformEmail: 'support@tarsit.com',
      maintenanceMode: false,
      registrationEnabled: true,
      businessRegistrationEnabled: true,
      emailVerificationRequired: true,
      autoApproveBusinesses: false,
      maxPhotosPerBusiness: 20,
      maxServicesPerBusiness: 50,
      reviewModerationEnabled: true,
      chatEnabled: true,
      notificationsEnabled: true,
      analyticsEnabled: true,
      defaultCurrency: 'USD',
      defaultTimezone: 'America/New_York',
      supportedLanguages: ['en', 'es', 'fr'],
    }
  );

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setLocalSettings({ ...localSettings, [key]: value });
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdateSettings(localSettings);
    setSaving(false);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Save Banner */}
      {hasChanges && (
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-purple-400" />
            <span className="text-white">You have unsaved changes</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-emerald-400">Settings saved successfully!</span>
        </div>
      )}

      {/* General Settings */}
      <SettingsSection
        title="General Settings"
        description="Basic platform configuration"
        icon={<Settings className="h-5 w-5 text-purple-400" />}
      >
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Platform Name</label>
            <input
              type="text"
              value={localSettings.platformName}
              onChange={(e) => updateSetting('platformName', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Support Email</label>
            <input
              type="email"
              value={localSettings.platformEmail}
              onChange={(e) => updateSetting('platformEmail', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Default Currency</label>
              <select
                value={localSettings.defaultCurrency}
                onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="USD" className="bg-neutral-900">USD ($)</option>
                <option value="EUR" className="bg-neutral-900">EUR (€)</option>
                <option value="GBP" className="bg-neutral-900">GBP (£)</option>
                <option value="CAD" className="bg-neutral-900">CAD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Default Timezone</label>
              <select
                value={localSettings.defaultTimezone}
                onChange={(e) => updateSetting('defaultTimezone', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="America/New_York" className="bg-neutral-900">Eastern Time</option>
                <option value="America/Chicago" className="bg-neutral-900">Central Time</option>
                <option value="America/Denver" className="bg-neutral-900">Mountain Time</option>
                <option value="America/Los_Angeles" className="bg-neutral-900">Pacific Time</option>
                <option value="UTC" className="bg-neutral-900">UTC</option>
              </select>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Platform Status */}
      <SettingsSection
        title="Platform Status"
        description="Control platform availability and features"
        icon={<Shield className="h-5 w-5 text-purple-400" />}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <span className="text-sm text-amber-400">
              Enabling maintenance mode will temporarily disable the platform for all users.
            </span>
          </div>
          <ToggleSetting
            label="Maintenance Mode"
            description="Temporarily disable the platform for maintenance"
            enabled={localSettings.maintenanceMode}
            onChange={(v) => updateSetting('maintenanceMode', v)}
          />
          <ToggleSetting
            label="User Registration"
            description="Allow new users to create accounts"
            enabled={localSettings.registrationEnabled}
            onChange={(v) => updateSetting('registrationEnabled', v)}
          />
          <ToggleSetting
            label="Business Registration"
            description="Allow users to register new businesses"
            enabled={localSettings.businessRegistrationEnabled}
            onChange={(v) => updateSetting('businessRegistrationEnabled', v)}
          />
        </div>
      </SettingsSection>

      {/* Security Settings */}
      <SettingsSection
        title="Security & Verification"
        description="Authentication and verification settings"
        icon={<Shield className="h-5 w-5 text-purple-400" />}
      >
        <div className="space-y-2">
          <ToggleSetting
            label="Email Verification Required"
            description="Require users to verify their email address"
            enabled={localSettings.emailVerificationRequired}
            onChange={(v) => updateSetting('emailVerificationRequired', v)}
          />
          <ToggleSetting
            label="Auto-Approve Businesses"
            description="Automatically approve new business registrations"
            enabled={localSettings.autoApproveBusinesses}
            onChange={(v) => updateSetting('autoApproveBusinesses', v)}
          />
          <ToggleSetting
            label="Review Moderation"
            description="Moderate reviews before they are published"
            enabled={localSettings.reviewModerationEnabled}
            onChange={(v) => updateSetting('reviewModerationEnabled', v)}
          />
        </div>
      </SettingsSection>

      {/* Features */}
      <SettingsSection
        title="Platform Features"
        description="Enable or disable platform features"
        icon={<ToggleLeft className="h-5 w-5 text-purple-400" />}
      >
        <div className="space-y-2">
          <ToggleSetting
            label="Chat System"
            description="Enable real-time chat between users and businesses"
            enabled={localSettings.chatEnabled}
            onChange={(v) => updateSetting('chatEnabled', v)}
          />
          <ToggleSetting
            label="Notifications"
            description="Send push and email notifications"
            enabled={localSettings.notificationsEnabled}
            onChange={(v) => updateSetting('notificationsEnabled', v)}
          />
          <ToggleSetting
            label="Analytics"
            description="Track user activity and platform metrics"
            enabled={localSettings.analyticsEnabled}
            onChange={(v) => updateSetting('analyticsEnabled', v)}
          />
        </div>
      </SettingsSection>

      {/* Limits */}
      <SettingsSection
        title="Business Limits"
        description="Set limits for business accounts"
        icon={<Database className="h-5 w-5 text-purple-400" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Max Photos per Business</label>
            <input
              type="number"
              value={localSettings.maxPhotosPerBusiness}
              onChange={(e) => updateSetting('maxPhotosPerBusiness', parseInt(e.target.value))}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Max Services per Business</label>
            <input
              type="number"
              value={localSettings.maxServicesPerBusiness}
              onChange={(e) => updateSetting('maxServicesPerBusiness', parseInt(e.target.value))}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl border border-red-500/30 overflow-hidden">
        <div className="p-4 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-400">Danger Zone</h3>
              <p className="text-sm text-red-400/70">Irreversible actions. Proceed with caution.</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Clear All Cache</p>
              <p className="text-sm text-white/50">Remove all cached data from the system</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-colors">
              Clear Cache
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Reset Analytics</p>
              <p className="text-sm text-white/50">Delete all analytics data</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-colors">
              Reset
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Export All Data</p>
              <p className="text-sm text-white/50">Download complete database backup</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors">
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
