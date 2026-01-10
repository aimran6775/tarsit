'use client';

import { ErrorBoundary } from '@/components/shared/error-boundary';
import { GlobalTarsWidget } from '@/components/tars/GlobalTarsWidget';
import { AuthProvider } from '@/contexts/auth-context';
import { MessagesProvider } from '@/contexts/messages-context';
import { TarsProvider } from '@/contexts/TarsContext';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

function ThemedToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      richColors
      theme={theme}
      toastOptions={{
        style:
          theme === 'dark'
            ? {
                background: 'rgb(23 23 23)',
                border: '1px solid rgb(38 38 38)',
                color: 'white',
              }
            : {
                background: 'rgb(255 255 255)',
                border: '1px solid rgb(226 232 240)',
                color: 'rgb(15 23 42)',
              },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1, // Only retry once on failure
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MessagesProvider>
            <TarsProvider>
              <ErrorBoundary>{children}</ErrorBoundary>
              <GlobalTarsWidget />
              <ThemedToaster />
            </TarsProvider>
          </MessagesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
