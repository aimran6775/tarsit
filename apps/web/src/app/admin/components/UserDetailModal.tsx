'use client';

import { useState } from 'react';
import { 
  X, User, Mail, Phone, Calendar, 
  Building2, Star, MessageSquare, Clock, AlertCircle,
  Check, Ban, Trash2, Edit2, Save, Key
} from 'lucide-react';
import type { User as UserType } from '../types';

interface UserDetailModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (userId: string, data: Partial<UserType>) => void;
  onSuspendUser: (userId: string) => void;
  onActivateUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onResetPassword: (userId: string) => void;
}

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onResetPassword,
}: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = () => {
    onUpdateUser(user.id, editedUser);
    setIsEditing(false);
    setEditedUser({});
  };

  const handleEdit = () => {
    setEditedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
    setIsEditing(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' },
  ];

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400',
    suspended: 'bg-red-500/20 text-red-400',
    pending: 'bg-amber-500/20 text-amber-400',
  };

  const roleColors = {
    USER: 'bg-blue-500/20 text-blue-400',
    BUSINESS_OWNER: 'bg-purple-500/20 text-purple-400',
    ADMIN: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-neutral-900 rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-purple-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {user.firstName} {user.lastName}
                  </h2>
                  {user.isVerified && (
                    <div className="p-1 rounded-full bg-blue-500/20">
                      <Check className="h-3 w-3 text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[user.status]}`}>
                    {user.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${roleColors[user.role]}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-1">
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs">Businesses</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{user.businessCount || 0}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="text-xs">Reviews</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{user.reviewCount || 0}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs">Messages</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{user.messageCount || 0}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/50 mb-1">First Name</label>
                          <input
                            type="text"
                            value={editedUser.firstName || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/50 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={editedUser.lastName || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/50 mb-1">Email</label>
                        <input
                          type="email"
                          value={editedUser.email || ''}
                          onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/50 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editedUser.phone || ''}
                          onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-white/70">
                        <Mail className="h-4 w-4 text-white/40" />
                        <span>{user.email}</span>
                        {user.isVerified && (
                          <span className="text-xs text-emerald-400">(Verified)</span>
                        )}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3 text-white/70">
                          <Phone className="h-4 w-4 text-white/40" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-white/70">
                        <Calendar className="h-4 w-4 text-white/40" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      {user.lastLoginAt && (
                        <div className="flex items-center gap-3 text-white/70">
                          <Clock className="h-4 w-4 text-white/40" />
                          <span>Last active {new Date(user.lastLoginAt).toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* User's Businesses */}
              {user.role === 'BUSINESS_OWNER' && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-4">Owned Businesses</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-purple-400" />
                        <span className="text-white">Sample Business</span>
                      </div>
                      <span className="text-xs text-emerald-400">Active</span>
                    </div>
                    <p className="text-sm text-white/40 text-center py-2">
                      View full business list in Businesses tab
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'Logged in', time: '2 hours ago', icon: User },
                  { action: 'Updated profile', time: '1 day ago', icon: Edit2 },
                  { action: 'Left a review', time: '3 days ago', icon: Star },
                  { action: 'Sent a message', time: '5 days ago', icon: MessageSquare },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="p-2 rounded-lg bg-white/10">
                      <activity.icon className="h-4 w-4 text-white/70" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{activity.action}</p>
                      <p className="text-sm text-white/50">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Account Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => onResetPassword(user.id)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-white/50" />
                    <span className="text-white">Reset Password</span>
                  </div>
                  <span className="text-sm text-white/50">Send reset email</span>
                </button>

                {user.status === 'active' ? (
                  <button
                    onClick={() => onSuspendUser(user.id)}
                    className="w-full flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Ban className="h-5 w-5 text-amber-400" />
                      <span className="text-amber-400">Suspend Account</span>
                    </div>
                  </button>
                ) : user.status === 'suspended' ? (
                  <button
                    onClick={() => onActivateUser(user.id)}
                    className="w-full flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-emerald-400" />
                      <span className="text-emerald-400">Activate Account</span>
                    </div>
                  </button>
                ) : null}

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-red-400" />
                    <span className="text-red-400">Delete Account</span>
                  </div>
                </button>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-400">Are you sure?</p>
                      <p className="text-sm text-red-400/70 mt-1">
                        This action cannot be undone. All user data will be permanently deleted.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onDeleteUser(user.id);
                            onClose();
                          }}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <p className="text-sm text-white/40">
            User ID: {user.id.substring(0, 8)}...
          </p>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedUser({});
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
