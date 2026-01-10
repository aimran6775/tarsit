'use client';

import * as React from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 11);
    const newToast = { ...props, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right-full ${
              t.variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-background text-foreground border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm">{t.title}</p>
                {t.description && (
                  <p className="text-sm opacity-90 mt-1">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="opacity-70 hover:opacity-100 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Return a no-op implementation if not wrapped in provider
    return {
      toast: ({ title, description, variant }: Omit<Toast, 'id'>) => {
        // Fallback to console if no provider
        if (variant === 'destructive') {
          console.error(`[Toast Error] ${title}: ${description || ''}`);
        } else {
          console.log(`[Toast] ${title}: ${description || ''}`);
        }
      },
      dismiss: () => {},
      toasts: [],
    };
  }
  return context;
}
