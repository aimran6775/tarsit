'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function SettingsTab() {
  const settingsItems = [
    { label: 'Edit Profile', desc: 'Update your name and photo', href: '/settings/profile' },
    { label: 'Email Preferences', desc: 'Manage notification settings', href: '/settings/notifications' },
    { label: 'Password & Security', desc: 'Update your password', href: '/settings/security' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Account Settings</h2>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 divide-y divide-white/10">
          {settingsItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-white/50">{item.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </Link>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
        <div className="bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 p-4">
          <button className="text-sm text-red-400 font-medium hover:text-red-300 transition-colors">
            Delete Account
          </button>
          <p className="text-sm text-white/50 mt-1">
            Permanently delete your account and all data
          </p>
        </div>
      </div>
    </div>
  );
}
