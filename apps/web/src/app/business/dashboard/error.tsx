'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import * as Sentry from '@sentry/nextjs';
import { LayoutDashboard, LogOut, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { section: 'dashboard' },
    });
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <LayoutDashboard className="h-7 w-7 text-blue-500" />
          </div>
          <CardTitle className="text-xl">Dashboard Error</CardTitle>
          <CardDescription>
            There was a problem loading your dashboard. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="rounded-md bg-muted p-3 mb-3">
              <p className="text-sm text-destructive">{error.message}</p>
            </div>
          )}
          {error.digest && (
            <p className="text-center text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />
              Exit Dashboard
            </Link>
          </Button>
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
