'use client'

import React, { useState, useEffect } from 'react'
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

const severityOptions = [
  { value: 'low', label: 'Low', color: 'text-blue-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-600' }
]

const notificationTypes = [
  {
    type: 'security' as NotificationType,
    label: 'Security Alerts',
    description: 'Login failures, suspicious activity, policy violations',
    icon: Shield,
    color: 'text-red-600'
  },
  {
    type: 'system' as NotificationType,
    label: 'System Health',
    description: 'System errors, performance issues, service status',
    icon: Activity,
    color: 'text-blue-600'
  },
  {
    type: 'risk' as NotificationType,
    label: 'Risk & Safety',
    description: 'Safety incidents, risk threshold alerts',
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
  {
    type: 'user_activity' as NotificationType,
    label: 'User Activity',
    description: 'Role changes, account modifications',
    icon: Users,
    color: 'text-green-600'
  }
]

const channelOptions = [
  {
    key: 'inApp' as const,
    label: 'In-App Notifications',
    description: 'Show notifications in the admin panel',
    icon: Bell,
    alwaysEnabled: true
  },
  {
    key: 'email' as const,
    label: 'Email Notifications',
    description: 'Send notifications to your email address',
    icon: Mail,
    alwaysEnabled: false
  },
  {
    key: 'sms' as const,
    label: 'SMS Notifications',
    description: 'Send critical alerts via text message',
    icon: Smartphone,
    alwaysEnabled: false
  }
]

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>(mockNotificationSettings())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

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
      toast.success('Notification settings saved successfully')
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to save notification settings')
    } finally {
      setIsSaving(false)
    }
  }

  const resetSettings = () => {
    setSettings(mockNotificationSettings())
    setHasChanges(false)
    toast.success('Settings reset to defaults')
  }

  const testNotification = (type: NotificationType) => {
    toast.success(`Test ${type} notification sent!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Notification Settings</h3>
          <p className="text-muted-foreground">
            Configure how and when you receive notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetSettings} disabled={isSaving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
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
            Save Changes
          </Button>
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your notification preferences.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels">Delivery Channels</TabsTrigger>
          <TabsTrigger value="types">Notification Types</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Timing</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Channels</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications. In-app notifications are always enabled.
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
                        <Badge variant="secondary" className="mt-2">Always Enabled</Badge>
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
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>
                Configure settings for each type of notification
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
                            Test
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
                            <Label className="text-sm font-medium">Minimum Severity</Label>
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
                            <Label className="text-sm font-medium">Delivery Channels</Label>
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
                                  {channel.key === 'inApp' ? 'App' : channel.key === 'email' ? 'Email' : 'SMS'}
                                </Button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Only enabled channels can be selected
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
                  Quiet Hours
                </CardTitle>
                <CardDescription>
                  Disable non-critical notifications during specified hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable quiet hours</Label>
                  <Switch
                    checked={settings.quietHours?.enabled}
                    onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
                  />
                </div>
                
                {settings.quietHours?.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) => updateQuietHours('start', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) => updateQuietHours('end', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={settings.quietHours.timezone}
                        onValueChange={(value) => updateQuietHours('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Istanbul">Istanbul</SelectItem>
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
                  Notification Digest
                </CardTitle>
                <CardDescription>
                  Receive a summary of notifications instead of individual alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable digest mode</Label>
                  <Switch
                    checked={settings.digest?.enabled}
                    onCheckedChange={(checked) => updateDigest('enabled', checked)}
                  />
                </div>
                
                {settings.digest?.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={settings.digest.frequency}
                        onValueChange={(value: any) => updateDigest('frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
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
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Additional notification configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Advanced settings will be available in future releases. Currently showing placeholder configuration options.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-mark notifications as read</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically mark notifications as read after viewing
                    </p>
                  </div>
                  <Switch disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Group similar notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Combine similar notifications into groups
                    </p>
                  </div>
                  <Switch disabled />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Retention period</Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="30 days" />
                    </SelectTrigger>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    How long to keep read notifications
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