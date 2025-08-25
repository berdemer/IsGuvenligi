'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#363636',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: '400px',
        },
        success: {
          iconTheme: {
            primary: '#4caf50',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#f44336',
            secondary: '#fff',
          },
        },
        loading: {
          iconTheme: {
            primary: '#2196f3',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}