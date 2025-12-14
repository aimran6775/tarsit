'use client';

import { X, Mail, Loader2 } from 'lucide-react';
import type { InvitePermissions } from '../types';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: string;
  setInviteRole: (role: string) => void;
  invitePermissions: InvitePermissions;
  setInvitePermissions: (permissions: InvitePermissions) => void;
  isInviting: boolean;
  onInvite: () => void;
}

const permissionOptions = [
  { key: 'canManageAppointments' as const, label: 'Manage Appointments' },
  { key: 'canManageChat' as const, label: 'Manage Chat/Messages' },
  { key: 'canEditBusiness' as const, label: 'Edit Business Profile' },
  { key: 'canManageTeam' as const, label: 'Manage Team Members' },
];

export function InviteModal({
  isOpen,
  onClose,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  invitePermissions,
  setInvitePermissions,
  isInviting,
  onInvite,
}: InviteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Invite Team Member</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            >
              <option value="staff" className="bg-neutral-900">Staff</option>
              <option value="manager" className="bg-neutral-900">Manager</option>
              <option value="admin" className="bg-neutral-900">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">Permissions</label>
            <div className="space-y-2">
              {permissionOptions.map(perm => (
                <label key={perm.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invitePermissions[perm.key]}
                    onChange={(e) => setInvitePermissions({ ...invitePermissions, [perm.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-white/30 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                  />
                  <span className="text-sm text-white/70">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-white/20 text-white/70 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onInvite}
            disabled={!inviteEmail || isInviting}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isInviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
