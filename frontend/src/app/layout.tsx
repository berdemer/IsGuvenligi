import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { I18nErrorBoundary } from '@/i18n/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'İş Güvenliği Admin Panel',
  description: 'Comprehensive workplace safety management system',
  robots: {
    index: false,
    follow: false
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the locale from cookies on the server side
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = (cookieLocale && locales.includes(cookieLocale as Locale)) 
    ? cookieLocale as Locale 
    : defaultLocale;

  // Load initial messages for the detected locale
  let initialMessages = {};
  try {
    initialMessages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.warn(`Failed to load messages for ${locale}, falling back to ${defaultLocale}`);
    try {
      initialMessages = (await import(`../../messages/${defaultLocale}.json`)).default;
    } catch (fallbackError) {
      console.error('Failed to load fallback messages:', fallbackError);
    }
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <I18nErrorBoundary>
          <LocaleProvider 
            initialLocale={locale} 
            initialMessages={initialMessages}
          >
            <QueryProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </QueryProvider>
          </LocaleProvider>
        </I18nErrorBoundary>
      </body>
    </html>
  );
}