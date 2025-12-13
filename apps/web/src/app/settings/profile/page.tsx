'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { authApi, uploadApi } from '@/lib/api';
import { ImageUpload } from '@/components/shared';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || null);
    }
  }, [user]);

  const handleAvatarUpload = async (image: { publicId: string; url: string; secureUrl: string }) => {
    setIsUploadingAvatar(true);
    try {
      await authApi.updateProfile({ avatar: image.secureUrl });
      setAvatar(image.secureUrl);
      await refreshUser();
      toast.success('Avatar updated!');
    } catch (error) {
      console.error('Avatar update error:', error);
      toast.error('Failed to update avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await authApi.updateProfile({ avatar: '' });
      setAvatar(null);
      await refreshUser();
      toast.success('Avatar removed');
    } catch (error) {
      console.error('Avatar remove error:', error);
      toast.error('Failed to remove avatar');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await authApi.updateProfile({
        firstName,
        lastName,
        username: username || undefined,
        phone: phone || undefined,
      });
      
      await refreshUser();
      toast.success('Profile updated!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <p className="text-white/60 mt-2">Update your personal information</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Profile Photo</h2>
            
            <ImageUpload
              variant="avatar"
              folder="profiles"
              existingImages={avatar ? [{ publicId: '', url: avatar }] : []}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
              maxFiles={1}
            />
            
            {isUploadingAvatar && (
              <p className="text-sm text-white/50 mt-2">Uploading avatar...</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-6">Personal Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  pattern="^[a-z0-9_]+$"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  placeholder="johndoe"
                />
                <p className="text-xs text-white/40 mt-1">
                  Lowercase letters, numbers, and underscores only
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
              />
              <p className="text-xs text-white/40 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
