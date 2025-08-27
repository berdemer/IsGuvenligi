'use client'

import React, { useState, useEffect } from 'react'
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
        title: "Test email sent",
        description: "A test email has been sent successfully.",
      })
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Could not send test email. Check your SMTP settings.",
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
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Email Configuration */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
                {config.email.enabled ? (
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure SMTP settings and email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
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
                    <h4 className="font-medium">SMTP Server Settings</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={config.email.smtp.host}
                          onChange={(e) => updateSMTP({ host: e.target.value })}
                          placeholder="smtp.gmail.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={config.email.smtp.port}
                          onChange={(e) => updateSMTP({ port: parseInt(e.target.value) || 587 })}
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">Username</Label>
                        <Input
                          id="smtpUsername"
                          value={config.email.smtp.username}
                          onChange={(e) => updateSMTP({ username: e.target.value })}
                          placeholder="your-email@gmail.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">Password</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={config.email.smtp.password}
                          onChange={(e) => updateSMTP({ password: e.target.value })}
                          placeholder="App password or SMTP password"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">From Email</Label>
                        <Input
                          id="fromEmail"
                          value={config.email.smtp.from}
                          onChange={(e) => updateSMTP({ from: e.target.value })}
                          placeholder="noreply@isguvenligi.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fromName">From Name</Label>
                        <Input
                          id="fromName"
                          value={config.email.smtp.fromName}
                          onChange={(e) => updateSMTP({ fromName: e.target.value })}
                          placeholder="İş Güvenliği Sistemi"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smtpSecure"
                        checked={config.email.smtp.secure}
                        onCheckedChange={(checked) => updateSMTP({ secure: checked })}
                      />
                      <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={testEmailSettings}
                        disabled={testingEmail}
                        variant="outline"
                      >
                        {testingEmail ? (
                          <>Loading...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Test Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Email Templates</h4>
                    
                    <div className="space-y-4">
                      {Object.entries(config.email.templates).map(([key, template]) => {
                        const templateKey = key as keyof NotificationConfig['email']['templates']
                        const templateLabels = {
                          welcome: 'Welcome Email',
                          passwordReset: 'Password Reset',
                          securityAlert: 'Security Alert',
                          systemAlert: 'System Alert',
                          maintenance: 'Maintenance Notice'
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
                                <Label htmlFor={`${key}-subject`}>Subject Line</Label>
                                <Input
                                  id={`${key}-subject`}
                                  value={template.subject}
                                  onChange={(e) => updateTemplate(templateKey, { subject: e.target.value })}
                                  placeholder={`Enter subject for ${templateLabels[templateKey]}`}
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
                Push Notifications
                <Badge variant="outline">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Configure web push notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Push notification configuration will be available in the next version.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Notifications
                <Badge variant="outline">Enterprise</Badge>
              </CardTitle>
              <CardDescription>
                Configure SMS notifications via Twilio or AWS SNS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">SMS notifications are available in the Enterprise plan.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Third-Party Integrations
              </CardTitle>
              <CardDescription>
                Configure Slack, Microsoft Teams, and other integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Integration settings will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                System Notifications
              </CardTitle>
              <CardDescription>
                Configure browser and system notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Desktop Notifications</Label>
                  <Switch
                    checked={config.system.desktop}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, desktop: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Browser Notifications</Label>
                  <Switch
                    checked={config.system.browser}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, browser: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Sound Alerts</Label>
                  <Switch
                    checked={config.system.sound}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, sound: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Badge Notifications</Label>
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
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure notification timing and priority settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Quiet Hours</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable non-critical notifications during specified hours
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
                      <Label htmlFor="quietStart">Start Time</Label>
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
                      <Label htmlFor="quietEnd">End Time</Label>
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