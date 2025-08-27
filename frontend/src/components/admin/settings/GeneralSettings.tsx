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
            <Label htmlFor="systemDescription">System Description</Label>
            <Textarea
              id="systemDescription"
              value={config.systemDescription}
              onChange={(e) => updateConfig({ systemDescription: e.target.value })}
              placeholder="Enter system description"
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
                  <SelectItem value="Europe/Istanbul">Istanbul (UTC+3)</SelectItem>
                  <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                  <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                  <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
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
                  <SelectItem value="TRY">Turkish Lira (₺)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
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
            {tCommon('settings')}
          </CardTitle>
          <CardDescription>
            {t('systemDescription')}
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
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
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
                  Reduce spacing and padding for more content
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
                  Enable smooth transitions and animations
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
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="0">Disabled</SelectItem>
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
            Feature Flags
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Enable or disable system features and experimental functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(config.features).map(([key, value]) => {
              const featureKey = key as keyof GeneralConfig['features']
              const featureLabels = {
                darkModeToggle: 'Dark Mode Toggle',
                advancedSearch: 'Advanced Search',
                exportFeatures: 'Export Features',
                betaFeatures: 'Beta Features',
                analyticsTracking: 'Analytics Tracking',
                maintenanceMode: 'Maintenance Mode'
              }
              
              const featureDescriptions = {
                darkModeToggle: 'Allow users to switch between light and dark themes',
                advancedSearch: 'Enable advanced filtering and search capabilities',
                exportFeatures: 'Allow data export to various formats',
                betaFeatures: 'Enable experimental and beta features',
                analyticsTracking: 'Collect anonymous usage analytics',
                maintenanceMode: 'Put system in maintenance mode'
              }

              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label>{featureLabels[featureKey]}</Label>
                      {featureKey === 'maintenanceMode' && value && (
                        <Badge variant="destructive" className="text-xs">Active</Badge>
                      )}
                      {featureKey === 'betaFeatures' && (
                        <Badge variant="outline" className="text-xs">Experimental</Badge>
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
            Performance & Caching
          </CardTitle>
          <CardDescription>
            Configure system performance and caching behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cacheTimeout">Cache Timeout (seconds)</Label>
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
                How long to keep data in cache (0 = no cache)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
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
                User session expiration time
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
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
                Maximum file upload size
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Compression</Label>
                <p className="text-sm text-muted-foreground">
                  Compress responses to reduce bandwidth
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
              <h4 className="font-medium">Connection Test</h4>
              <p className="text-sm text-muted-foreground">
                Test system connectivity and performance
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
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset to Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <RefreshCw className="h-5 w-5" />
            Reset Settings
          </CardTitle>
          <CardDescription>
            Reset all general settings to their default values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Reset to Defaults</p>
                <p className="text-sm text-muted-foreground">
                  This will reset all general settings to their default values. This action cannot be undone.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}