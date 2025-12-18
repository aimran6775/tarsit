'use client';

import { ErrorBoundary } from '@/components/shared/error-boundary';
import { GlobalTarsWidget } from '@/components/tars/GlobalTarsWidget';
import { AuthProvider } from '@/contexts/auth-context';
import { TarsProvider } from '@/contexts/TarsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TarsProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
          <GlobalTarsWidget />
          <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgb(23 23 23)',
                border: '1px solid rgb(38 38 38)',
                color: 'white',
              },
            }}
          />
        </TarsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
