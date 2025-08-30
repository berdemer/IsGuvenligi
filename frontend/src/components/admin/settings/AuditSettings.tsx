'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, FileText, Database, Shield, Clock, AlertTriangle } from 'lucide-react'

interface AuditSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

export default function AuditSettings({ onSettingsChange }: AuditSettingsProps) {
  const t = useTranslations('auditSettings')
  const [config, setConfig] = useState({
    general: {
      enabled: true,
      logLevel: 'INFO',
      retentionDays: 365,
      compression: true,
      encryption: false
    },
    events: {
      userActions: true,
      systemActions: true,
      authEvents: true,
      dataChanges: true,
      configChanges: true,
      errorEvents: true,
      performanceMetrics: false
    },
    storage: {
      location: 'database',
      maxFileSize: '10MB',
      rotationPolicy: 'daily',
      backupEnabled: true
    },
    alerts: {
      failedLogins: true,
      suspiciousActivity: true,
      dataExfiltration: true,
      configurationChanges: true,
      thresholdBreaches: false
    }
  })

  const updateGeneral = (key: string, value: boolean | string | number) => {
    setConfig(prev => ({
      ...prev,
      general: { ...prev.general, [key]: value }
    }))
    onSettingsChange(true)
  }

  const updateEvents = (key: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      events: { ...prev.events, [key]: value }
    }))
    onSettingsChange(true)
  }

  const updateStorage = (key: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      storage: { ...prev.storage, [key]: value }
    }))
    onSettingsChange(true)
  }

  const updateAlerts = (key: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      alerts: { ...prev.alerts, [key]: value }
    }))
    onSettingsChange(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('title')}
            {config.general.enabled ? (
              <Badge variant="default" className="bg-green-500">{t('enabled')}</Badge>
            ) : (
              <Badge variant="outline">{t('disabled')}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('enableAuditLogging')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('enableAuditLoggingDescription')}
              </p>
            </div>
            <Switch
              checked={config.general.enabled}
              onCheckedChange={(checked) => updateGeneral('enabled', checked)}
            />
          </div>

          {config.general.enabled && (
            <>
              <div className="space-y-4">
                <h4 className="font-medium">{t('general.title')}</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logLevel">{t('general.logLevel')}</Label>
                    <select
                      id="logLevel"
                      value={config.general.logLevel}
                      onChange={(e) => updateGeneral('logLevel', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="DEBUG">{t('general.logLevels.debug')}</option>
                      <option value="INFO">{t('general.logLevels.info')}</option>
                      <option value="WARN">{t('general.logLevels.warn')}</option>
                      <option value="ERROR">{t('general.logLevels.error')}</option>
                      <option value="CRITICAL">{t('general.logLevels.critical')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retentionDays">{t('general.retentionPeriod')}</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      min="30"
                      max="2555"
                      value={config.general.retentionDays}
                      onChange={(e) => updateGeneral('retentionDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compression"
                      checked={config.general.compression}
                      onCheckedChange={(checked) => updateGeneral('compression', checked)}
                    />
                    <Label htmlFor="compression">{t('general.enableCompression')}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encryption"
                      checked={config.general.encryption}
                      onCheckedChange={(checked) => updateGeneral('encryption', checked)}
                    />
                    <Label htmlFor="encryption">{t('general.enableEncryption')}</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('events.title')}
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('events.userActions')}</Label>
                      <Switch
                        checked={config.events.userActions}
                        onCheckedChange={(checked) => updateEvents('userActions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('events.systemActions')}</Label>
                      <Switch
                        checked={config.events.systemActions}
                        onCheckedChange={(checked) => updateEvents('systemActions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('events.authenticationEvents')}</Label>
                      <Switch
                        checked={config.events.authEvents}
                        onCheckedChange={(checked) => updateEvents('authEvents', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('events.dataChanges')}</Label>
                      <Switch
                        checked={config.events.dataChanges}
                        onCheckedChange={(checked) => updateEvents('dataChanges', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('events.configurationChanges')}</Label>
                      <Switch
                        checked={config.events.configChanges}
                        onCheckedChange={(checked) => updateEvents('configChanges', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('events.errorEvents')}</Label>
                      <Switch
                        checked={config.events.errorEvents}
                        onCheckedChange={(checked) => updateEvents('errorEvents', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('events.performanceMetrics')}</Label>
                      <Switch
                        checked={config.events.performanceMetrics}
                        onCheckedChange={(checked) => updateEvents('performanceMetrics', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  {t('storage.title')}
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('storage.storageLocation')}</Label>
                    <select
                      id="location"
                      value={config.storage.location}
                      onChange={(e) => updateStorage('location', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="database">{t('storage.locations.database')}</option>
                      <option value="file">{t('storage.locations.file')}</option>
                      <option value="both">{t('storage.locations.both')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">{t('storage.maxFileSize')}</Label>
                    <Input
                      id="maxFileSize"
                      value={config.storage.maxFileSize}
                      onChange={(e) => updateStorage('maxFileSize', e.target.value)}
                      placeholder="10MB"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rotationPolicy">{t('storage.rotationPolicy')}</Label>
                    <select
                      id="rotationPolicy"
                      value={config.storage.rotationPolicy}
                      onChange={(e) => updateStorage('rotationPolicy', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="hourly">{t('storage.rotations.hourly')}</option>
                      <option value="daily">{t('storage.rotations.daily')}</option>
                      <option value="weekly">{t('storage.rotations.weekly')}</option>
                      <option value="monthly">{t('storage.rotations.monthly')}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('storage.enableBackup')}</Label>
                    <Switch
                      checked={config.storage.backupEnabled}
                      onCheckedChange={(checked) => updateStorage('backupEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t('alerts.title')}
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('alerts.failedLoginAttempts')}</Label>
                      <Switch
                        checked={config.alerts.failedLogins}
                        onCheckedChange={(checked) => updateAlerts('failedLogins', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('alerts.suspiciousActivity')}</Label>
                      <Switch
                        checked={config.alerts.suspiciousActivity}
                        onCheckedChange={(checked) => updateAlerts('suspiciousActivity', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('alerts.dataExfiltration')}</Label>
                      <Switch
                        checked={config.alerts.dataExfiltration}
                        onCheckedChange={(checked) => updateAlerts('dataExfiltration', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('alerts.configurationChanges')}</Label>
                      <Switch
                        checked={config.alerts.configurationChanges}
                        onCheckedChange={(checked) => updateAlerts('configurationChanges', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('alerts.thresholdBreaches')}</Label>
                      <Switch
                        checked={config.alerts.thresholdBreaches}
                        onCheckedChange={(checked) => updateAlerts('thresholdBreaches', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}