'use client'

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function GlobalNotFound() {
  const t = useTranslations('frontpage.notFound');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">{t('title')}</h1>
          <h2 className="text-2xl font-semibold">{t('heading')}</h2>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/admin/dashboard">
              {t('dashboardButton')}
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              {t('homeButton')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}