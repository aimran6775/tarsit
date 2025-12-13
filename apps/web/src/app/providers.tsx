'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { ErrorBoundary } from '@/components/shared/error-boundary';

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
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}
