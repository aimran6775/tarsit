'use client';

import {
  AlertCircle,
  Ban,
  Building2,
  Calendar,
  Check,
  Edit2,
  Globe,
  Image,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Shield,
  Star,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { Business } from '../types';

interface BusinessDetailModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBusiness: (businessId: string, data: Partial<Business>) => void;
  onVerifyBusiness: (businessId: string) => void;
  onSuspendBusiness: (businessId: string) => void;
  onActivateBusiness: (businessId: string) => void;
  onDeleteBusiness: (businessId: string) => void;
}

export function BusinessDetailModal({
  business,
  isOpen,
  onClose,
  onUpdateBusiness,
  onVerifyBusiness,
  onSuspendBusiness,
  onActivateBusiness,
  onDeleteBusiness,
}: BusinessDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedBusiness, setEditedBusiness] = useState<Partial<Business>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !business) return null;

  const handleSave = () => {
    onUpdateBusiness(business.id, editedBusiness);
    setIsEditing(false);
    setEditedBusiness({});
  };

  const handleEdit = () => {
    setEditedBusiness({
      name: business.name,
      description: business.description,
      phone: business.phone,
      email: business.email,
      website: business.website,
    });
    setIsEditing(true);
  };

  const tabs: { id: 'overview' | 'analytics' | 'settings'; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
  ];

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-500/20 text-amber-400',
    suspended: 'bg-red-500/20 text-red-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-600/20 to-indigo-600/20">
          {business.coverPhoto ? (
            <img
              src={business.coverPhoto}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-16 w-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white/70"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-xl bg-neutral-800 border-2 border-neutral-900 flex items-center justify-center overflow-hidden">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-white/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white truncate">{business.name}</h2>
                  {business.isVerified && (
                    <div className="p-1 rounded-full bg-blue-500/20">
                      <Shield className="h-4 w-4 text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[business.status]}`}
                  >
                    {business.status}
                  </span>
                  <span className="text-sm text-white/50">
                    {typeof business.category === 'string'
                      ? business.category
                      : business.category.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="text-xs">Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {business.rating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-xs text-white/40">{business.reviewCount || 0} reviews</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Team</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{business.teamSize || 1}</p>
                  <p className="text-xs text-white/40">members</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-1">
                    <Tag className="h-4 w-4" />
                    <span className="text-xs">Services</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{business.serviceCount || 0}</p>
                  <p className="text-xs text-white/40">offered</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-1">
                    <Image className="h-4 w-4" />
                    <span className="text-xs">Photos</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{business.photoCount || 0}</p>
                  <p className="text-xs text-white/40">uploaded</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">About</h3>
                {isEditing ? (
                  <textarea
                    value={editedBusiness.description || ''}
                    onChange={(e) =>
                      setEditedBusiness({ ...editedBusiness, description: e.target.value })
                    }
                    className="w-full h-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none"
                  />
                ) : (
                  <p className="text-white/70">
                    {business.description || 'No description provided.'}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm text-white/50 mb-1">Business Name</label>
                        <input
                          type="text"
                          value={editedBusiness.name || ''}
                          onChange={(e) =>
                            setEditedBusiness({ ...editedBusiness, name: e.target.value })
                          }
                          className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/50 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={editedBusiness.phone || ''}
                            onChange={(e) =>
                              setEditedBusiness({ ...editedBusiness, phone: e.target.value })
                            }
                            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/50 mb-1">Email</label>
                          <input
                            type="email"
                            value={editedBusiness.email || ''}
                            onChange={(e) =>
                              setEditedBusiness({ ...editedBusiness, email: e.target.value })
                            }
                            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/50 mb-1">Website</label>
                        <input
                          type="url"
                          value={editedBusiness.website || ''}
                          onChange={(e) =>
                            setEditedBusiness({ ...editedBusiness, website: e.target.value })
                          }
                          className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-white/70">
                        <MapPin className="h-4 w-4 text-white/40" />
                        <span>
                          {business.address}, {business.city}, {business.state} {business.zipCode}
                        </span>
                      </div>
                      {business.phone && (
                        <div className="flex items-center gap-3 text-white/70">
                          <Phone className="h-4 w-4 text-white/40" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      {business.email && (
                        <div className="flex items-center gap-3 text-white/70">
                          <Mail className="h-4 w-4 text-white/40" />
                          <span>{business.email}</span>
                        </div>
                      )}
                      {business.website && (
                        <div className="flex items-center gap-3 text-white/70">
                          <Globe className="h-4 w-4 text-white/40" />
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener"
                            className="text-purple-400 hover:underline"
                          >
                            {business.website}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-white/70">
                        <Calendar className="h-4 w-4 text-white/40" />
                        <span>
                          Listed since {new Date(business.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Owner Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Owner Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {business.ownerName || 'Not specified'}
                    </p>
                    <p className="text-sm text-white/50">{business.ownerEmail || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">Performance Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/50 mb-1">Profile Views</p>
                    <p className="text-2xl font-bold text-white">1,234</p>
                    <p className="text-xs text-emerald-400">+12% from last month</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/50 mb-1">Contact Clicks</p>
                    <p className="text-2xl font-bold text-white">256</p>
                    <p className="text-xs text-emerald-400">+8% from last month</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/50 mb-1">Messages Received</p>
                    <p className="text-2xl font-bold text-white">48</p>
                    <p className="text-xs text-amber-400">-3% from last month</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/50 mb-1">Appointments</p>
                    <p className="text-2xl font-bold text-white">32</p>
                    <p className="text-xs text-emerald-400">+15% from last month</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'New review received', time: '2 hours ago', icon: Star },
                    { action: 'Profile updated', time: '1 day ago', icon: Edit2 },
                    { action: 'New message received', time: '2 days ago', icon: MessageSquare },
                    { action: 'Service added', time: '5 days ago', icon: Tag },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                      <div className="p-2 rounded-lg bg-white/10">
                        <activity.icon className="h-4 w-4 text-white/70" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.action}</p>
                        <p className="text-xs text-white/50">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Verification */}
              {!business.isVerified && (
                <button
                  onClick={() => onVerifyBusiness(business.id)}
                  className="w-full flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <span className="text-blue-400">Verify Business</span>
                  </div>
                  <span className="text-sm text-blue-400/70">Grant verified badge</span>
                </button>
              )}

              {/* Status Actions */}
              {business.status === 'active' ? (
                <button
                  onClick={() => onSuspendBusiness(business.id)}
                  className="w-full flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Ban className="h-5 w-5 text-amber-400" />
                    <span className="text-amber-400">Suspend Business</span>
                  </div>
                </button>
              ) : business.status === 'suspended' ? (
                <button
                  onClick={() => onActivateBusiness(business.id)}
                  className="w-full flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-400">Activate Business</span>
                  </div>
                </button>
              ) : null}

              {/* Delete */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-400" />
                  <span className="text-red-400">Delete Business</span>
                </div>
              </button>

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-400">Are you sure?</p>
                      <p className="text-sm text-red-400/70 mt-1">
                        This will permanently delete the business and all associated data including
                        reviews, services, and photos.
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
                            onDeleteBusiness(business.id);
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
          <p className="text-sm text-white/40">Business ID: {business.id.substring(0, 8)}...</p>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedBusiness({});
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
                Edit Business
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
