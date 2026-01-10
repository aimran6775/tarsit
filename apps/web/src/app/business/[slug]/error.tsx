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
import { RefreshCw, Search, Store } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function BusinessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { section: 'business' },
    });
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10">
            <Store className="h-7 w-7 text-orange-500" />
          </div>
          <CardTitle className="text-xl">Unable to load business</CardTitle>
          <CardDescription>
            We couldn&apos;t load the business information. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error.digest && (
            <p className="text-center text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Browse Businesses
            </Link>
          </Button>
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
