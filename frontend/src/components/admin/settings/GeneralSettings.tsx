'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Palette,
  Database,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Flag
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface GeneralSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

interface GeneralConfig {
  // Basic Settings
  systemName: string
  systemDescription: string
  defaultLanguage: string
  timezone: string
  dateFormat: string
  currency: string
  
  // UI/UX Settings
  theme: 'light' | 'dark' | 'auto'
  compactMode: boolean
  animationsEnabled: boolean
  autoRefreshInterval: number
  itemsPerPage: number
  
  // Feature Flags
  features: {
    darkModeToggle: boolean
    advancedSearch: boolean
    exportFeatures: boolean
    betaFeatures: boolean
    analyticsTracking: boolean
    maintenanceMode: boolean
  }
  
  // Performance Settings
  cacheTimeout: number
  sessionTimeout: number
  maxFileSize: number
  enableCompression: boolean
}

const defaultConfig: GeneralConfig = {
  systemName: 'İş Güvenliği Sistemi',
  systemDescription: 'Comprehensive workplace safety management system',
  defaultLanguage: 'tr',
  timezone: 'Europe/Istanbul',
  dateFormat: 'DD/MM/YYYY',
  currency: 'TRY',
  
  theme: 'light',
  compactMode: false,
  animationsEnabled: true,
  autoRefreshInterval: 30,
  itemsPerPage: 25,
  
  features: {
    darkModeToggle: true,
    advancedSearch: true,
    exportFeatures: true,
    betaFeatures: false,
    analyticsTracking: true,
    maintenanceMode: false
  },
  
  cacheTimeout: 3600,
  sessionTimeout: 1800,
  maxFileSize: 10,
  enableCompression: true
}

export default function GeneralSettings({ onSettingsChange }: GeneralSettingsProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const [config, setConfig] = useState<GeneralConfig>(defaultConfig)
  const [initialConfig, setInitialConfig] = useState<GeneralConfig>(defaultConfig)
  const [loading, setLoading] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Check for changes
  useEffect(() => {
    const hasChanges = JSON.stringify(config) !== JSON.stringify(initialConfig)
    onSettingsChange(hasChanges)
  }, [config, initialConfig, onSettingsChange])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real implementation, fetch from API
      const settings = { ...defaultConfig }
      setConfig(settings)
      setInitialConfig(settings)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = (updates: Partial<GeneralConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
    
  }

  const updateFeatures = (featureKey: keyof GeneralConfig['features'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: value
      }
    }))
  }

  const resetToDefaults = () => {
    setConfig(defaultConfig)
  }

  const testConnection = async () => {
    // Simulate connection test
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
  }

  if (loading && JSON.stringify(config) === JSON.stringify(defaultConfig)) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('systemName')}
          </CardTitle>
          <CardDescription>
            {t('systemDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="systemName">{t('systemName')}</Label>
              <Input
                id="systemName"
                value={config.systemName}
                onChange={(e) => updateConfig({ systemName: e.target.value })}
                placeholder={tCommon('name')}
              />
            </div>
            
            <div className="space-y-2">
              <LanguageSwitcher variant="dropdown" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemDescription">{t('systemDescription')}</Label>
            <Textarea
              id="systemDescription"
              value={config.systemDescription}
              onChange={(e) => updateConfig({ systemDescription: e.target.value })}
              placeholder={t('enterSystemDescription')}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="timezone">{t('timezone')}</Label>
              <Select 
                value={config.timezone} 
                onValueChange={(value) => updateConfig({ timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Istanbul">{t('timezones.istanbul')}</SelectItem>
                  <SelectItem value="UTC">{t('timezones.utc')}</SelectItem>
                  <SelectItem value="Europe/London">{t('timezones.london')}</SelectItem>
                  <SelectItem value="America/New_York">{t('timezones.newYork')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">{t('dateFormat')}</Label>
              <Select 
                value={config.dateFormat} 
                onValueChange={(value) => updateConfig({ dateFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t('currency')}</Label>
              <Select 
                value={config.currency} 
                onValueChange={(value) => updateConfig({ currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">{t('currencies.try')}</SelectItem>
                  <SelectItem value="USD">{t('currencies.usd')}</SelectItem>
                  <SelectItem value="EUR">{t('currencies.eur')}</SelectItem>
                  <SelectItem value="GBP">{t('currencies.gbp')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Interface Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('interfaceSettings')}
          </CardTitle>
          <CardDescription>
            {t('interfaceDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="theme">{t('theme')}</Label>
              <Select 
                value={config.theme} 
                onValueChange={(value: 'light' | 'dark' | 'auto') => updateConfig({ theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('themes.light')}</SelectItem>
                  <SelectItem value="dark">{t('themes.dark')}</SelectItem>
                  <SelectItem value="auto">{t('themes.auto')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">{t('itemsPerPage')}</Label>
              <Select 
                value={config.itemsPerPage.toString()} 
                onValueChange={(value) => updateConfig({ itemsPerPage: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('compactMode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('compactModeDescription')}
                </p>
              </div>
              <Switch
                checked={config.compactMode}
                onCheckedChange={(checked) => updateConfig({ compactMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('animationsEnabled')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('animationsDescription')}
                </p>
              </div>
              <Switch
                checked={config.animationsEnabled}
                onCheckedChange={(checked) => updateConfig({ animationsEnabled: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoRefresh">{t('autoRefreshInterval')} (seconds)</Label>
            <Select 
              value={config.autoRefreshInterval.toString()} 
              onValueChange={(value) => updateConfig({ autoRefreshInterval: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">{t('intervals.10seconds')}</SelectItem>
                <SelectItem value="30">{t('intervals.30seconds')}</SelectItem>
                <SelectItem value="60">{t('intervals.1minute')}</SelectItem>
                <SelectItem value="300">{t('intervals.5minutes')}</SelectItem>
                <SelectItem value="0">{t('intervals.disabled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            {t('featureFlags.title')}
            <Badge variant="outline" className="ml-2">{t('featureFlags.beta')}</Badge>
          </CardTitle>
          <CardDescription>
            {t('featureFlags.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(config.features).map(([key, value]) => {
              const featureKey = key as keyof GeneralConfig['features']
              const featureLabels = {
                darkModeToggle: t('features.darkModeToggle'),
                advancedSearch: t('features.advancedSearch'),
                exportFeatures: t('features.exportFeatures'),
                betaFeatures: t('features.betaFeatures'),
                analyticsTracking: t('features.analyticsTracking'),
                maintenanceMode: t('features.maintenanceMode')
              }
              
              const featureDescriptions = {
                darkModeToggle: t('features.darkModeToggleDesc'),
                advancedSearch: t('features.advancedSearchDesc'),
                exportFeatures: t('features.exportFeaturesDesc'),
                betaFeatures: t('features.betaFeaturesDesc'),
                analyticsTracking: t('features.analyticsTrackingDesc'),
                maintenanceMode: t('features.maintenanceModeDesc')
              }

              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label>{featureLabels[featureKey]}</Label>
                      {featureKey === 'maintenanceMode' && value && (
                        <Badge variant="destructive" className="text-xs">{t('active')}</Badge>
                      )}
                      {featureKey === 'betaFeatures' && (
                        <Badge variant="outline" className="text-xs">{t('experimental')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {featureDescriptions[featureKey]}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updateFeatures(featureKey, checked)}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
{t('performance.title')}
          </CardTitle>
          <CardDescription>
            {t('performance.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cacheTimeout">{t('performance.cacheTimeout')}</Label>
              <Input
                id="cacheTimeout"
                type="number"
                value={config.cacheTimeout}
                onChange={(e) => updateConfig({ cacheTimeout: parseInt(e.target.value) || 0 })}
                placeholder="3600"
                min="0"
                max="86400"
              />
              <p className="text-xs text-muted-foreground">
                {t('performance.cacheTimeoutDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">{t('performance.sessionTimeout')}</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => updateConfig({ sessionTimeout: parseInt(e.target.value) || 0 })}
                placeholder="1800"
                min="300"
                max="86400"
              />
              <p className="text-xs text-muted-foreground">
                {t('performance.sessionTimeoutDesc')}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">{t('performance.maxFileSize')}</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={config.maxFileSize}
                onChange={(e) => updateConfig({ maxFileSize: parseInt(e.target.value) || 0 })}
                placeholder="10"
                min="1"
                max="100"
              />
              <p className="text-xs text-muted-foreground">
                {t('performance.maxFileSizeDesc')}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('performance.enableCompression')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('performance.enableCompressionDesc')}
                </p>
              </div>
              <Switch
                checked={config.enableCompression}
                onCheckedChange={(checked) => updateConfig({ enableCompression: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{t('performance.connectionTest')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('performance.connectionTestDesc')}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t('performance.testConnection')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset to Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <RefreshCw className="h-5 w-5" />
{t('reset.title')}
          </CardTitle>
          <CardDescription>
            {t('reset.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">{t('reset.resetToDefaults')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('reset.resetDescription')}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              {t('reset.resetAll')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}