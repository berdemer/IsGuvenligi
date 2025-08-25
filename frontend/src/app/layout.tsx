import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'İş Güvenliği Sistemi',
  description: 'Kapsamlı iş güvenliği yönetim sistemi',
  keywords: 'iş güvenliği, safety, güvenlik yönetimi, keycloak',
  authors: [{ name: 'İş Güvenliği Ekibi' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <ReactQueryProvider>
              <AuthProvider>
                <TooltipProvider>
                  <ToastProvider />
                  {children}
                </TooltipProvider>
              </AuthProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}