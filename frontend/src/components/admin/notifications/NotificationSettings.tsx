'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bell,
  Mail,
  Smartphone,
  Shield,
  Activity,
  AlertTriangle,
  Users,
  Clock,
  Volume2,
  VolumeX,
  Save,
  RefreshCw,
  Check,
  Info
} from 'lucide-react'
import {
  NotificationSettings as NotificationSettingsType,
  NotificationType,
  NotificationSeverity
} from '@/types/notification'
import toast from "react-hot-toast"
import { useToast } from '@/hooks/use-toast'

// Mock current user settings
const mockNotificationSettings = (): NotificationSettingsType => ({
  userId: 'current-user',
  channels: {
    inApp: true,
    email: true,
    sms: false,
    push: false
  },
  typeSettings: {
    security: {
      enabled: true,
      minSeverity: 'medium',
      channels: ['inApp', 'email']
    },
    system: {
      enabled: true,
      minSeverity: 'high',
      channels: ['inApp']
    },
    risk: {
      enabled: true,
      minSeverity: 'medium',
      channels: ['inApp', 'email']
    },
    user_activity: {
      enabled: false,
      minSeverity: 'low',
      channels: ['inApp']
    }
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'UTC'
  },
  digest: {
    enabled: false,
    frequency: 'daily',
    time: '09:00'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-08-25T10:00:00Z'
})

const getSeverityOptions = (t: any) => [
  { value: 'low', label: t('severity.low'), color: 'text-blue-600' },
  { value: 'medium', label: t('severity.medium'), color: 'text-yellow-600' },
  { value: 'high', label: t('severity.high'), color: 'text-orange-600' },
  { value: 'critical', label: t('severity.critical'), color: 'text-red-600' }
]

const getNotificationTypes = (t: any) => [
  {
    type: 'security' as NotificationType,
    label: t('types.security'),
    description: t('types.securityDescription'),
    icon: Shield,
    color: 'text-red-600'
  },
  {
    type: 'system' as NotificationType,
    label: t('types.system'),
    description: t('types.systemDescription'),
    icon: Activity,
    color: 'text-blue-600'
  },
  {
    type: 'risk' as NotificationType,
    label: t('types.risk'),
    description: t('types.riskDescription'),
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
  {
    type: 'user_activity' as NotificationType,
    label: t('types.userActivity'),
    description: t('types.userActivityDescription'),
    icon: Users,
    color: 'text-green-600'
  }
]

const getChannelOptions = (t: any) => [
  {
    key: 'inApp' as const,
    label: t('channels.inApp'),
    description: t('channels.inAppDescription'),
    icon: Bell,
    alwaysEnabled: true
  },
  {
    key: 'email' as const,
    label: t('channels.email'),
    description: t('channels.emailDescription'),
    icon: Mail,
    alwaysEnabled: false
  },
  {
    key: 'sms' as const,
    label: t('channels.sms'),
    description: t('channels.smsDescription'),
    icon: Smartphone,
    alwaysEnabled: false
  }
]

export default function NotificationSettings() {
  const t = useTranslations('notificationPreferences')
  const { toast: toastHook } = useToast()
  const [settings, setSettings] = useState<NotificationSettingsType>(mockNotificationSettings())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const severityOptions = getSeverityOptions(t)
  const notificationTypes = getNotificationTypes(t)
  const channelOptions = getChannelOptions(t)

  // Track changes
  useEffect(() => {
    const original = mockNotificationSettings()
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(original)
    setHasChanges(hasChanges)
  }, [settings])

  const updateChannelSetting = (channel: keyof NotificationSettingsType['channels'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: enabled
      }
    }))
  }

  const updateTypeSetting = (
    type: NotificationType, 
    field: 'enabled' | 'minSeverity' | 'channels', 
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      typeSettings: {
        ...prev.typeSettings,
        [type]: {
          ...prev.typeSettings[type],
          [field]: value
        }
      }
    }))
  }

  const updateQuietHours = (field: keyof NotificationSettingsType['quietHours'], value: any) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours!,
        [field]: value
      }
    }))
  }

  const updateDigest = (field: keyof NotificationSettingsType['digest'], value: any) => {
    setSettings(prev => ({
      ...prev,
      digest: {
        ...prev.digest!,
        [field]: value
      }
    }))
  }

  const toggleTypeChannel = (type: NotificationType, channel: string) => {
    const currentChannels = settings.typeSettings[type].channels
    const isEnabled = currentChannels.includes(channel as any)
    
    const newChannels = isEnabled
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel as any]
    
    updateTypeSetting(type, 'channels', newChannels)
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toastHook({ title: t('toast.settingsSaved') })
      setHasChanges(false)
    } catch (error) {
      toastHook({ title: t('toast.saveError'), variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const resetSettings = () => {
    setSettings(mockNotificationSettings())
    setHasChanges(false)
    toastHook({ title: t('toast.settingsReset') })
  }

  const testNotification = (type: NotificationType) => {
    toastHook({ title: t('toast.testNotification', { type }) })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{t('title')}</h3>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetSettings} disabled={isSaving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('reset')}
          </Button>
          <Button 
            onClick={saveSettings} 
            disabled={!hasChanges || isSaving}
            className={hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t('saveChanges')}
          </Button>
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t('unsavedChanges')}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels">{t('tabs.channels')}</TabsTrigger>
          <TabsTrigger value="types">{t('tabs.types')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('tabs.schedule')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('tabs.advanced')}</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('channels.title')}</CardTitle>
              <CardDescription>
                {t('channels.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {channelOptions.map((channel) => (
                <div key={channel.key} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <channel.icon className="h-5 w-5 mt-0.5 text-gray-500" />
                    <div>
                      <Label className="text-base font-medium">{channel.label}</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {channel.description}
                      </p>
                      {channel.key === 'inApp' && (
                        <Badge variant="secondary" className="mt-2">{t('channels.alwaysEnabled')}</Badge>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={settings.channels[channel.key]}
                    onCheckedChange={(checked) => updateChannelSetting(channel.key, checked)}
                    disabled={channel.alwaysEnabled}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('types.title')}</CardTitle>
              <CardDescription>
                {t('types.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notificationTypes.map((notifType) => {
                  const typeSettings = settings.typeSettings[notifType.type]
                  
                  return (
                    <div key={notifType.type} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <notifType.icon className={`h-5 w-5 ${notifType.color}`} />
                          <div>
                            <Label className="text-base font-medium">{notifType.label}</Label>
                            <p className="text-sm text-muted-foreground">
                              {notifType.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testNotification(notifType.type)}
                          >
                            {t('types.test')}
                          </Button>
                          <Switch
                            checked={typeSettings.enabled}
                            onCheckedChange={(checked) => updateTypeSetting(notifType.type, 'enabled', checked)}
                          />
                        </div>
                      </div>

                      {typeSettings.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('types.minimumSeverity')}</Label>
                            <Select 
                              value={typeSettings.minSeverity} 
                              onValueChange={(value) => updateTypeSetting(notifType.type, 'minSeverity', value as NotificationSeverity)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {severityOptions.map((severity) => (
                                  <SelectItem key={severity.value} value={severity.value}>
                                    <span className={severity.color}>{severity.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('types.deliveryChannels')}</Label>
                            <div className="flex flex-wrap gap-2">
                              {channelOptions.map((channel) => (
                                <Button
                                  key={channel.key}
                                  variant={typeSettings.channels.includes(channel.key as any) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleTypeChannel(notifType.type, channel.key)}
                                  disabled={!settings.channels[channel.key] && channel.key !== 'inApp'}
                                >
                                  <channel.icon className="h-3 w-3 mr-1" />
                                  {channel.key === 'inApp' ? t('types.app') : channel.key === 'email' ? t('types.email') : t('types.sms')}
                                </Button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t('types.onlyEnabledChannels')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {settings.quietHours?.enabled ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                  {t('quietHours.title')}
                </CardTitle>
                <CardDescription>
                  {t('quietHours.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('quietHours.enable')}</Label>
                  <Switch
                    checked={settings.quietHours?.enabled}
                    onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
                  />
                </div>
                
                {settings.quietHours?.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('quietHours.startTime')}</Label>
                        <Input
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) => updateQuietHours('start', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('quietHours.endTime')}</Label>
                        <Input
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) => updateQuietHours('end', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('quietHours.timezone')}</Label>
                      <Select
                        value={settings.quietHours.timezone}
                        onValueChange={(value) => updateQuietHours('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">{t('quietHours.timezones.utc')}</SelectItem>
                          <SelectItem value="America/New_York">{t('quietHours.timezones.easternTime')}</SelectItem>
                          <SelectItem value="America/Chicago">{t('quietHours.timezones.centralTime')}</SelectItem>
                          <SelectItem value="America/Denver">{t('quietHours.timezones.mountainTime')}</SelectItem>
                          <SelectItem value="America/Los_Angeles">{t('quietHours.timezones.pacificTime')}</SelectItem>
                          <SelectItem value="Europe/London">{t('quietHours.timezones.london')}</SelectItem>
                          <SelectItem value="Europe/Istanbul">{t('quietHours.timezones.istanbul')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Digest Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('digest.title')}
                </CardTitle>
                <CardDescription>
                  {t('digest.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('digest.enable')}</Label>
                  <Switch
                    checked={settings.digest?.enabled}
                    onCheckedChange={(checked) => updateDigest('enabled', checked)}
                  />
                </div>
                
                {settings.digest?.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>{t('digest.frequency')}</Label>
                      <Select
                        value={settings.digest.frequency}
                        onValueChange={(value: any) => updateDigest('frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">{t('digest.frequencies.daily')}</SelectItem>
                          <SelectItem value="weekly">{t('digest.frequencies.weekly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('digest.deliveryTime')}</Label>
                      <Input
                        type="time"
                        value={settings.digest.time}
                        onChange={(e) => updateDigest('time', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('advanced.title')}</CardTitle>
              <CardDescription>
                {t('advanced.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t('advanced.futureFeature')}
                </AlertDescription>
              </Alert>

              <div className="space-y-4 opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('advanced.autoMarkRead')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('advanced.autoMarkReadDescription')}
                    </p>
                  </div>
                  <Switch disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('advanced.groupSimilar')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('advanced.groupSimilarDescription')}
                    </p>
                  </div>
                  <Switch disabled />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>{t('advanced.retentionPeriod')}</Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder={t('advanced.retentionPlaceholder')} />
                    </SelectTrigger>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {t('advanced.retentionPeriodDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}