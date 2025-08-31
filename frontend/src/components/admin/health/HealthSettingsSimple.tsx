'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HealthSettings() {
  const t = useTranslations()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('health.prometheus.healthSettings.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('health.prometheus.healthSettings.description')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('health.prometheus.healthSettings.thresholds.title')}</CardTitle>
          <CardDescription>
            {t('health.prometheus.healthSettings.thresholds.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('health.prometheus.healthSettings.comingSoon')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}