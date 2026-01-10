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
import { Home, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { section: 'search' },
    });
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10">
            <Search className="h-7 w-7 text-purple-500" />
          </div>
          <CardTitle className="text-xl">Search Error</CardTitle>
          <CardDescription>
            We couldn&apos;t complete your search. Please try again with different terms.
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
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
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
