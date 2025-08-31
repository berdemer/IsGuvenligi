'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle2,
  Settings,
  Volume2,
  VolumeX,
  Send,
  Database,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NotificationSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

interface NotificationConfig {
  email: {
    enabled: boolean
    smtp: {
      host: string
      port: number
      secure: boolean
      username: string
      password: string
      from: string
      fromName: string
    }
    templates: {
      welcome: { enabled: boolean, subject: string }
      passwordReset: { enabled: boolean, subject: string }
      securityAlert: { enabled: boolean, subject: string }
      systemAlert: { enabled: boolean, subject: string }
      maintenance: { enabled: boolean, subject: string }
    }
  }
  
  push: {
    enabled: boolean
    vapidKeys: {
      publicKey: string
      privateKey: string
    }
    defaultIcon: string
    clickAction: string
  }
  
  sms: {
    enabled: boolean
    provider: 'twilio' | 'aws' | 'custom'
    apiKey: string
    apiSecret: string
    fromNumber: string
  }
  
  slack: {
    enabled: boolean
    webhookUrl: string
    channel: string
    username: string
    iconEmoji: string
  }
  
  system: {
    desktop: boolean
    browser: boolean
    sound: boolean
    vibration: boolean
    badge: boolean
  }
  
  preferences: {
    defaultChannels: string[]
    quietHours: {
      enabled: boolean
      start: string
      end: string
      timezone: string
    }
    priorities: {
      critical: string[]
      high: string[]
      normal: string[]
      low: string[]
    }
  }
}

const defaultConfig: NotificationConfig = {
  email: {
    enabled: true,
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: '',
      password: '',
      from: 'noreply@isguvenligi.com',
      fromName: 'İş Güvenliği Sistemi'
    },
    templates: {
      welcome: { enabled: true, subject: 'Welcome to İş Güvenliği Sistemi' },
      passwordReset: { enabled: true, subject: 'Password Reset Request' },
      securityAlert: { enabled: true, subject: 'Security Alert - Action Required' },
      systemAlert: { enabled: true, subject: 'System Alert Notification' },
      maintenance: { enabled: true, subject: 'Scheduled Maintenance Notice' }
    }
  },
  push: {
    enabled: false,
    vapidKeys: {
      publicKey: '',
      privateKey: ''
    },
    defaultIcon: '/icon-192x192.png',
    clickAction: '/'
  },
  sms: {
    enabled: false,
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    fromNumber: ''
  },
  slack: {
    enabled: false,
    webhookUrl: '',
    channel: '#alerts',
    username: 'İş Güvenliği Bot',
    iconEmoji: ':warning:'
  },
  system: {
    desktop: true,
    browser: true,
    sound: true,
    vibration: false,
    badge: true
  },
  preferences: {
    defaultChannels: ['email', 'system'],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'Europe/Istanbul'
    },
    priorities: {
      critical: ['email', 'sms', 'push', 'slack'],
      high: ['email', 'push', 'slack'],
      normal: ['email', 'system'],
      low: ['system']
    }
  }
}

export default function NotificationSettings({ onSettingsChange }: NotificationSettingsProps) {
  const { toast } = useToast()
  const t = useTranslations('notificationSettings')
  const [config, setConfig] = useState<NotificationConfig>(defaultConfig)
  const [initialConfig, setInitialConfig] = useState<NotificationConfig>(defaultConfig)
  const [loading, setLoading] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    const hasChanges = JSON.stringify(config) !== JSON.stringify(initialConfig)
    onSettingsChange(hasChanges)
  }, [config, initialConfig, onSettingsChange])

  const loadSettings = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const settings = { ...defaultConfig }
      setConfig(settings)
      setInitialConfig(settings)
    } catch (error) {
      console.error('Failed to load notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const testEmailSettings = async () => {
    try {
      setTestingEmail(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: t('toast.testEmailSent'),
        description: t('toast.testEmailSentDescription'),
      })
    } catch (error) {
      toast({
        title: t('toast.testEmailFailed'),
        description: t('toast.testEmailFailedDescription'),
        variant: "destructive"
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const updateEmail = (updates: Partial<NotificationConfig['email']>) => {
    setConfig(prev => ({
      ...prev,
      email: { ...prev.email, ...updates }
    }))
  }

  const updateSMTP = (updates: Partial<NotificationConfig['email']['smtp']>) => {
    setConfig(prev => ({
      ...prev,
      email: {
        ...prev.email,
        smtp: { ...prev.email.smtp, ...updates }
      }
    }))
  }

  const updateTemplate = (templateKey: keyof NotificationConfig['email']['templates'], updates: Partial<{ enabled: boolean, subject: string }>) => {
    setConfig(prev => ({
      ...prev,
      email: {
        ...prev.email,
        templates: {
          ...prev.email.templates,
          [templateKey]: { ...prev.email.templates[templateKey], ...updates }
        }
      }
    }))
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
      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="email">{t('tabs.email')}</TabsTrigger>
          <TabsTrigger value="push">{t('tabs.push')}</TabsTrigger>
          <TabsTrigger value="sms">{t('tabs.sms')}</TabsTrigger>
          <TabsTrigger value="integrations">{t('tabs.integrations')}</TabsTrigger>
          <TabsTrigger value="system">{t('tabs.system')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('tabs.preferences')}</TabsTrigger>
        </TabsList>

        {/* Email Configuration */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t('email.title')}
                {config.email.enabled ? (
                  <Badge variant="default" className="bg-green-500">{t('email.enabled')}</Badge>
                ) : (
                  <Badge variant="outline">{t('email.disabled')}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {t('email.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('email.enableEmailNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('email.enableEmailDescription')}
                  </p>
                </div>
                <Switch
                  checked={config.email.enabled}
                  onCheckedChange={(checked) => updateEmail({ enabled: checked })}
                />
              </div>

              {config.email.enabled && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">{t('email.smtpServerSettings')}</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">{t('email.smtpHost')}</Label>
                        <Input
                          id="smtpHost"
                          value={config.email.smtp.host}
                          onChange={(e) => updateSMTP({ host: e.target.value })}
                          placeholder={t('email.placeholders.smtpHost')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">{t('email.smtpPort')}</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={config.email.smtp.port}
                          onChange={(e) => updateSMTP({ port: parseInt(e.target.value) || 587 })}
                          placeholder={t('email.placeholders.smtpPort')}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">{t('email.username')}</Label>
                        <Input
                          id="smtpUsername"
                          value={config.email.smtp.username}
                          onChange={(e) => updateSMTP({ username: e.target.value })}
                          placeholder={t('email.placeholders.username')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">{t('email.password')}</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={config.email.smtp.password}
                          onChange={(e) => updateSMTP({ password: e.target.value })}
                          placeholder={t('email.placeholders.password')}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">{t('email.fromEmail')}</Label>
                        <Input
                          id="fromEmail"
                          value={config.email.smtp.from}
                          onChange={(e) => updateSMTP({ from: e.target.value })}
                          placeholder={t('email.placeholders.fromEmail')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fromName">{t('email.fromName')}</Label>
                        <Input
                          id="fromName"
                          value={config.email.smtp.fromName}
                          onChange={(e) => updateSMTP({ fromName: e.target.value })}
                          placeholder={t('email.placeholders.fromName')}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smtpSecure"
                        checked={config.email.smtp.secure}
                        onCheckedChange={(checked) => updateSMTP({ secure: checked })}
                      />
                      <Label htmlFor="smtpSecure">{t('email.useSslTls')}</Label>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={testEmailSettings}
                        disabled={testingEmail}
                        variant="outline"
                      >
                        {testingEmail ? (
                          <>{t('email.loading')}</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t('email.sendTestEmail')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">{t('email.emailTemplates')}</h4>
                    
                    <div className="space-y-4">
                      {Object.entries(config.email.templates).map(([key, template]) => {
                        const templateKey = key as keyof NotificationConfig['email']['templates']
                        const templateLabels = {
                          welcome: t('email.templates.welcome'),
                          passwordReset: t('email.templates.passwordReset'),
                          securityAlert: t('email.templates.securityAlert'),
                          systemAlert: t('email.templates.systemAlert'),
                          maintenance: t('email.templates.maintenance')
                        }
                        
                        return (
                          <div key={key} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="font-medium">{templateLabels[templateKey]}</Label>
                              <Switch
                                checked={template.enabled}
                                onCheckedChange={(checked) => updateTemplate(templateKey, { enabled: checked })}
                              />
                            </div>
                            {template.enabled && (
                              <div className="space-y-2">
                                <Label htmlFor={`${key}-subject`}>{t('email.subjectLine')}</Label>
                                <Input
                                  id={`${key}-subject`}
                                  value={template.subject}
                                  onChange={(e) => updateTemplate(templateKey, { subject: e.target.value })}
                                  placeholder={t('email.placeholders.subjectFor', { template: templateLabels[templateKey] })}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs with simplified content for now */}
        <TabsContent value="push" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('push.title')}
                <Badge variant="outline">{t('push.comingSoon')}</Badge>
              </CardTitle>
              <CardDescription>
                {t('push.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('push.comingSoonDescription')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('sms.title')}
                <Badge variant="outline">{t('sms.enterprise')}</Badge>
              </CardTitle>
              <CardDescription>
                {t('sms.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('sms.enterpriseDescription')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('integrations.title')}
              </CardTitle>
              <CardDescription>
                {t('integrations.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('integrations.configureHere')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                {t('system.title')}
              </CardTitle>
              <CardDescription>
                {t('system.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('system.desktopNotifications')}</Label>
                  <Switch
                    checked={config.system.desktop}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, desktop: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('system.browserNotifications')}</Label>
                  <Switch
                    checked={config.system.browser}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, browser: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('system.soundAlerts')}</Label>
                  <Switch
                    checked={config.system.sound}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, sound: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('system.badgeNotifications')}</Label>
                  <Switch
                    checked={config.system.badge}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, badge: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('preferences.title')}
              </CardTitle>
              <CardDescription>
                {t('preferences.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('preferences.quietHours')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('preferences.quietHoursDescription')}
                    </p>
                  </div>
                  <Switch
                    checked={config.preferences.quietHours.enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        quietHours: { ...prev.preferences.quietHours, enabled: checked }
                      }
                    }))}
                  />
                </div>

                {config.preferences.quietHours.enabled && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quietStart">{t('preferences.startTime')}</Label>
                      <Input
                        id="quietStart"
                        type="time"
                        value={config.preferences.quietHours.start}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            quietHours: { ...prev.preferences.quietHours, start: e.target.value }
                          }
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quietEnd">{t('preferences.endTime')}</Label>
                      <Input
                        id="quietEnd"
                        type="time"
                        value={config.preferences.quietHours.end}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            quietHours: { ...prev.preferences.quietHours, end: e.target.value }
                          }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}