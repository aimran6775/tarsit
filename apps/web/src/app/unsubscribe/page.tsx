'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Loader2, Mail, MailX, Shield } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

interface Preferences {
  promotionalEmails: boolean;
  weeklyDigest: boolean;
  appointmentReminders: boolean;
  appointmentUpdates: boolean;
  reviewNotifications: boolean;
  unsubscribedAll: boolean;
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const category = searchParams.get('category');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!token) {
      setError('Invalid unsubscribe link. Please check your email for a valid link.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/email-preferences/unsubscribe?token=${token}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setEmail(data.email);
        setPreferences(data.preferences);

        // Auto-unsubscribe if category is specified
        if (category) {
          handleCategoryUnsubscribe(category);
        }
      }
    } catch (err) {
      setError('Unable to load preferences. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [token, category]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleCategoryUnsubscribe = async (cat: string) => {
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/email-preferences/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, category: cat }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(data.message);
        fetchPreferences();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Unable to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/email-preferences/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(data.message);
        fetchPreferences();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Unable to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleResubscribe = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/email-preferences/resubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('You have been resubscribed to all emails.');
        fetchPreferences();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Unable to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (key: keyof Preferences, value: boolean) => {
    if (!token || !preferences) return;

    setSaving(true);
    setPreferences({ ...preferences, [key]: value });

    try {
      const res = await fetch(`${API_BASE}/api/email-preferences/update?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Preferences saved');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Revert on error
        setPreferences({ ...preferences, [key]: !value });
        setError(data.message);
      }
    } catch (err) {
      setPreferences({ ...preferences, [key]: !value });
      setError('Unable to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/80 border-gray-800 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <MailX className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-white">Invalid Link</CardTitle>
            <CardDescription className="text-gray-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline">Return to Tarsit</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Email Preferences</h1>
          <p className="text-gray-400">
            Manage your email notifications for {email}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="mb-6 bg-green-500/10 border-green-500/30">
            <CardContent className="py-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">{success}</span>
            </CardContent>
          </Card>
        )}

        {/* Unsubscribed All Banner */}
        {preferences?.unsubscribedAll && (
          <Card className="mb-6 bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MailX className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400">You are unsubscribed from all marketing emails</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResubscribe}
                  disabled={saving}
                >
                  Resubscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferences Card */}
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-xl mb-6">
          <CardHeader>
            <CardTitle className="text-white">Notification Settings</CardTitle>
            <CardDescription>Choose which emails you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Marketing Emails */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Marketing</h3>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-white font-medium">Promotional Emails</p>
                  <p className="text-sm text-gray-400">Special offers and announcements from businesses</p>
                </div>
                <Switch
                  checked={preferences?.promotionalEmails ?? true}
                  onCheckedChange={(v) => handleToggle('promotionalEmails', v)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-white font-medium">Weekly Digest</p>
                  <p className="text-sm text-gray-400">Weekly summary of your activity and recommendations</p>
                </div>
                <Switch
                  checked={preferences?.weeklyDigest ?? true}
                  onCheckedChange={(v) => handleToggle('weeklyDigest', v)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Transactional Emails */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Appointments</h3>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-white font-medium">Appointment Reminders</p>
                  <p className="text-sm text-gray-400">Reminders before your scheduled appointments</p>
                </div>
                <Switch
                  checked={preferences?.appointmentReminders ?? true}
                  onCheckedChange={(v) => handleToggle('appointmentReminders', v)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-white font-medium">Appointment Updates</p>
                  <p className="text-sm text-gray-400">Confirmations, cancellations, and changes</p>
                </div>
                <Switch
                  checked={preferences?.appointmentUpdates ?? true}
                  onCheckedChange={(v) => handleToggle('appointmentUpdates', v)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Business Emails */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reviews & Messages</h3>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-white font-medium">Review Notifications</p>
                  <p className="text-sm text-gray-400">Alerts when you receive new reviews</p>
                </div>
                <Switch
                  checked={preferences?.reviewNotifications ?? true}
                  onCheckedChange={(v) => handleToggle('reviewNotifications', v)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Security & Account Emails</p>
                <p className="text-sm text-gray-400">
                  Password resets, login alerts, and important account notifications are always sent for your security and cannot be disabled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unsubscribe All Button */}
        {!preferences?.unsubscribedAll && (
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-300"
              onClick={handleUnsubscribeAll}
              disabled={saving}
            >
              Unsubscribe from all marketing emails
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Questions? <a href="/contact" className="text-purple-400 hover:text-purple-300">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
