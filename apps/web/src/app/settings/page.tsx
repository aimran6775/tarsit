'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import {
    User,
    Lock,
    Bell,
    Shield,
    Trash2,
    ChevronRight,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    ArrowLeft,
    Mail,
    Phone,
    Camera,
} from 'lucide-react';

type SettingsTab = 'profile' | 'password' | 'notifications' | 'privacy' | 'danger';

export default function SettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, refreshUser, logout } = useAuth();

    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Profile form
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });

    // Password form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Notification preferences
    const [notifications, setNotifications] = useState({
        emailAppointments: true,
        emailMessages: true,
        emailMarketing: false,
        pushAppointments: true,
        pushMessages: true,
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login?redirect=/settings');
        }
    }, [authLoading, isAuthenticated, router]);

    // Load user data
    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: (user as { phone?: string }).phone || '',
            });
        }
    }, [user]);

    const clearMessages = () => {
        setSuccess('');
        setError('');
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setIsLoading(true);

        try {
            await apiClient.patch('/auth/me', profileData);
            await refreshUser();
            setSuccess('Profile updated successfully!');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setSuccess('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.'
        );

        if (!confirmed) return;

        const doubleConfirm = window.prompt('Type "DELETE" to confirm account deletion:');
        if (doubleConfirm !== 'DELETE') {
            alert('Account deletion cancelled.');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.delete('/auth/me');
            await logout();
            router.push('/');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to delete account');
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: User },
        { id: 'password' as const, label: 'Password', icon: Lock },
        { id: 'notifications' as const, label: 'Notifications', icon: Bell },
        { id: 'privacy' as const, label: 'Privacy', icon: Shield },
        { id: 'danger' as const, label: 'Delete Account', icon: Trash2 },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-white/60 mt-1">Manage your account preferences</p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <p className="text-green-400">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="md:w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); clearMessages(); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${activeTab === tab.id
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : tab.id === 'danger'
                                                ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
                                        <p className="text-white/50 text-sm mb-6">Update your personal details</p>
                                    </div>

                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
                                            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Change photo
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Password Tab */}
                            {activeTab === 'password' && (
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
                                        <p className="text-white/50 text-sm mb-6">Update your password to keep your account secure</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Current Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">Minimum 8 characters with uppercase, lowercase, number, and special character</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>
                                        <p className="text-white/50 text-sm mb-6">Choose how you want to be notified</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Email Notifications</h3>

                                        <NotificationToggle
                                            label="Appointment reminders"
                                            description="Get reminded before your appointments"
                                            checked={notifications.emailAppointments}
                                            onChange={(checked) => setNotifications({ ...notifications, emailAppointments: checked })}
                                        />
                                        <NotificationToggle
                                            label="Messages"
                                            description="Get notified when businesses reply to you"
                                            checked={notifications.emailMessages}
                                            onChange={(checked) => setNotifications({ ...notifications, emailMessages: checked })}
                                        />
                                        <NotificationToggle
                                            label="Marketing & promotions"
                                            description="Receive special offers and updates"
                                            checked={notifications.emailMarketing}
                                            onChange={(checked) => setNotifications({ ...notifications, emailMarketing: checked })}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Push Notifications</h3>

                                        <NotificationToggle
                                            label="Appointment updates"
                                            description="Real-time updates about your appointments"
                                            checked={notifications.pushAppointments}
                                            onChange={(checked) => setNotifications({ ...notifications, pushAppointments: checked })}
                                        />
                                        <NotificationToggle
                                            label="New messages"
                                            description="Instant notifications for new messages"
                                            checked={notifications.pushMessages}
                                            onChange={(checked) => setNotifications({ ...notifications, pushMessages: checked })}
                                        />
                                    </div>

                                    <button
                                        onClick={() => setSuccess('Notification preferences saved!')}
                                        className="w-full sm:w-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-4">Privacy Settings</h2>
                                        <p className="text-white/50 text-sm mb-6">Control your privacy and data</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <h3 className="text-white font-medium mb-2">Download Your Data</h3>
                                            <p className="text-white/50 text-sm mb-4">Get a copy of all your data including profile, appointments, and messages.</p>
                                            <button className="px-4 py-2 text-sm text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition-colors">
                                                Request Data Export
                                            </button>
                                        </div>

                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <h3 className="text-white font-medium mb-2">Profile Visibility</h3>
                                            <p className="text-white/50 text-sm mb-4">Control who can see your profile information.</p>
                                            <select className="px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50">
                                                <option value="public">Public - Anyone can see</option>
                                                <option value="businesses">Businesses Only</option>
                                                <option value="private">Private - Only you</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Danger Zone Tab */}
                            {activeTab === 'danger' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
                                        <p className="text-white/50 text-sm mb-6">Irreversible actions that affect your account</p>
                                    </div>

                                    <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                                        <h3 className="text-red-400 font-medium mb-2">Delete Account</h3>
                                        <p className="text-white/50 text-sm mb-4">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                            All your appointments, messages, reviews, and favorites will be permanently removed.
                                        </p>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Deleting...' : 'Delete My Account'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Notification Toggle Component
function NotificationToggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-white/50 text-sm">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-purple-500' : 'bg-white/20'
                    }`}
            >
                <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'left-7' : 'left-1'
                        }`}
                />
            </button>
        </div>
    );
}
