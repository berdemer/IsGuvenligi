'use client'

import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Root page - simple welcome page with link to admin dashboard
export default function RootPage() {
  const t = useTranslations('frontpage.homepage');
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
        <div className="space-x-4">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {t('goToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}