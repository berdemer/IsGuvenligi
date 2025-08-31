'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  HardDrive,
  Clock,
  Shield
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DataManagementSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

export default function DataManagementSettings({ onSettingsChange }: DataManagementSettingsProps) {
  const { toast } = useToast()
  const t = useTranslations('dataManagement')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 30,
      compression: true,
      encryption: true
    },
    cache: {
      enabled: true,
      defaultTtl: 3600,
      maxSize: '1GB',
      cleanupInterval: 300
    },
    cleanup: {
      enabled: true,
      logRetention: 90,
      tempFileCleanup: true,
      sessionCleanup: true
    }
  })

  const handleExport = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: t('toast.exportCompleted'),
        description: t('toast.exportCompletedDescription'),
      })
    } catch (error) {
      toast({
        title: t('toast.exportFailed'),
        description: t('toast.exportFailedDescription'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: t('toast.cacheCleared'),
        description: t('toast.cacheClearedDescription'),
      })
    } catch (error) {
      toast({
        title: t('toast.clearFailed'),
        description: t('toast.clearFailedDescription'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t('backup.title')}
          </CardTitle>
          <CardDescription>
            {t('backup.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('backup.enableAutomatedBackups')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('backup.enableAutomatedBackupsDescription')}
              </p>
            </div>
            <Switch
              checked={config.backup.enabled}
              onCheckedChange={(checked) => {
                setConfig(prev => ({ ...prev, backup: { ...prev.backup, enabled: checked } }))
                onSettingsChange(true)
              }}
            />
          </div>

          {config.backup.enabled && (
            <div className="space-y-4 border-l-2 border-blue-200 pl-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="frequency">{t('backup.backupFrequency')}</Label>
                  <select
                    id="frequency"
                    value={config.backup.frequency}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, backup: { ...prev.backup, frequency: e.target.value } }))
                      onSettingsChange(true)
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="hourly">{t('backup.frequencies.hourly')}</option>
                    <option value="daily">{t('backup.frequencies.daily')}</option>
                    <option value="weekly">{t('backup.frequencies.weekly')}</option>
                    <option value="monthly">{t('backup.frequencies.monthly')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">{t('backup.retentionPeriod')}</Label>
                  <Input
                    id="retention"
                    type="number"
                    min="7"
                    max="365"
                    value={config.backup.retention}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, backup: { ...prev.backup, retention: parseInt(e.target.value) } }))
                      onSettingsChange(true)
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compression"
                    checked={config.backup.compression}
                    onCheckedChange={(checked) => {
                      setConfig(prev => ({ ...prev, backup: { ...prev.backup, compression: checked } }))
                      onSettingsChange(true)
                    }}
                  />
                  <Label htmlFor="compression">{t('backup.enableCompression')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="encryption"
                    checked={config.backup.encryption}
                    onCheckedChange={(checked) => {
                      setConfig(prev => ({ ...prev, backup: { ...prev.backup, encryption: checked } }))
                      onSettingsChange(true)
                    }}
                  />
                  <Label htmlFor="encryption">{t('backup.enableEncryption')}</Label>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('backup.manualDataExport')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('backup.manualDataExportDescription')}
              </p>
            </div>
            <Button onClick={handleExport} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {t('backup.exportData')}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('backup.importData')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('backup.importDataDescription')}
              </p>
            </div>
            <Button variant="outline" disabled>
              <Upload className="h-4 w-4 mr-2" />
              {t('backup.importData')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t('cache.title')}
            {config.cache.enabled ? (
              <Badge variant="default" className="bg-green-500">{t('cache.active')}</Badge>
            ) : (
              <Badge variant="outline">{t('cache.inactive')}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {t('cache.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('cache.enableRedisCache')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('cache.enableRedisCacheDescription')}
              </p>
            </div>
            <Switch
              checked={config.cache.enabled}
              onCheckedChange={(checked) => {
                setConfig(prev => ({ ...prev, cache: { ...prev.cache, enabled: checked } }))
                onSettingsChange(true)
              }}
            />
          </div>

          {config.cache.enabled && (
            <div className="space-y-4 border-l-2 border-red-200 pl-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultTtl">{t('cache.defaultTtl')}</Label>
                  <Input
                    id="defaultTtl"
                    type="number"
                    min="60"
                    max="86400"
                    value={config.cache.defaultTtl}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, cache: { ...prev.cache, defaultTtl: parseInt(e.target.value) } }))
                      onSettingsChange(true)
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSize">{t('cache.maxCacheSize')}</Label>
                  <Input
                    id="maxSize"
                    value={config.cache.maxSize}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, cache: { ...prev.cache, maxSize: e.target.value } }))
                      onSettingsChange(true)
                    }}
                    placeholder="1GB"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cleanupInterval">{t('cache.cleanupInterval')}</Label>
                <Input
                  id="cleanupInterval"
                  type="number"
                  min="60"
                  max="3600"
                  value={config.cache.cleanupInterval}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, cache: { ...prev.cache, cleanupInterval: parseInt(e.target.value) } }))
                    onSettingsChange(true)
                  }}
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('cache.clearCache')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('cache.clearCacheDescription')}
              </p>
            </div>
            <Button 
              onClick={handleClearCache} 
              disabled={loading || !config.cache.enabled}
              variant="outline"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t('cache.clearCache')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('cleanup.title')}
          </CardTitle>
          <CardDescription>
            {t('cleanup.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('cleanup.enableAutomaticCleanup')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('cleanup.enableAutomaticCleanupDescription')}
                </p>
              </div>
              <Switch
                checked={config.cleanup.enabled}
                onCheckedChange={(checked) => {
                  setConfig(prev => ({ ...prev, cleanup: { ...prev.cleanup, enabled: checked } }))
                  onSettingsChange(true)
                }}
              />
            </div>

            {config.cleanup.enabled && (
              <div className="space-y-4 border-l-2 border-yellow-200 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="logRetention">{t('cleanup.logRetention')}</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    min="7"
                    max="365"
                    value={config.cleanup.logRetention}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, cleanup: { ...prev.cleanup, logRetention: parseInt(e.target.value) } }))
                      onSettingsChange(true)
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t('cleanup.cleanTemporaryFiles')}</Label>
                    <Switch
                      checked={config.cleanup.tempFileCleanup}
                      onCheckedChange={(checked) => {
                        setConfig(prev => ({ ...prev, cleanup: { ...prev.cleanup, tempFileCleanup: checked } }))
                        onSettingsChange(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('cleanup.cleanExpiredSessions')}</Label>
                    <Switch
                      checked={config.cleanup.sessionCleanup}
                      onCheckedChange={(checked) => {
                        setConfig(prev => ({ ...prev, cleanup: { ...prev.cleanup, sessionCleanup: checked } }))
                        onSettingsChange(true)
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}