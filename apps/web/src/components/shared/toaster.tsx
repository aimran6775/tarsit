'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        style: {
          background: 'white',
          color: 'rgb(15 23 42)',
          border: '1px solid rgb(226 232 240)',
        },
        className: 'dark:bg-slate-900 dark:text-white dark:border-slate-800',
      }}
    />
  );
}
