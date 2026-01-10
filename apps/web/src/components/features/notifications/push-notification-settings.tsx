'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { AlertCircle, Bell, BellOff, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PushNotificationSettingsProps {
  accessToken?: string | null;
}

export function PushNotificationSettings({
  accessToken,
}: PushNotificationSettingsProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications(accessToken);

  const [actionLoading, setActionLoading] = useState(false);

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Not supported
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn&apos;t support push notifications. Try using a
              modern browser like Chrome, Firefox, or Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Notification permission has been blocked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have blocked notifications for this site. To enable them,
              please update your browser&apos;s notification settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications for messages, appointments, and updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSubscribed && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are enabled. You&apos;ll receive updates for
              messages, appointment reminders, and more.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-toggle">Enable Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed
                ? 'You will receive notifications on this device'
                : 'Get notified about important updates'}
            </p>
          </div>
          {isLoading || actionLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Switch
              id="push-toggle"
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={!accessToken}
            />
          )}
        </div>

        {!accessToken && (
          <p className="text-sm text-muted-foreground">
            Please sign in to enable push notifications.
          </p>
        )}

        {!isSubscribed && accessToken && (
          <Button
            onClick={handleToggle}
            disabled={isLoading || actionLoading}
            className="w-full"
          >
            {actionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
