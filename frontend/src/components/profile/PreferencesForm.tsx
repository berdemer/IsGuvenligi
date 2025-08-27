"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Globe, Clock, Moon, Sun, Monitor, Mail, Smartphone, Bell } from "lucide-react"
import toast from "react-hot-toast"

interface ProfileData {
  preferences: {
    language: string
    timezone: string
    theme: string
    notifications: {
      email: boolean
      sms: boolean
      app: boolean
    }
  }
  [key: string]: any
}

interface PreferencesFormProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
}

const languages = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' }
]

const timezones = [
  { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' }
]

const themes = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon }
]

const getThemeLabel = (value: string, t: any) => {
  switch(value) {
    case 'system': return t('system')
    case 'light': return t('light')
    case 'dark': return t('dark')
    default: return value
  }
}

export function PreferencesForm({ profileData, onUpdate }: PreferencesFormProps) {
  const t = useTranslations('profile.preferences')
  const tCommon = useTranslations('common')
  const [preferences, setPreferences] = useState(profileData.preferences)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPreferences(profileData.preferences)
  }, [profileData.preferences])

  const handlePreferenceChange = async (key: string, value: any) => {
    const updatedPreferences = { ...preferences, [key]: value }
    setPreferences(updatedPreferences)

    // Save immediately on change
    setSaving(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedData = {
        ...profileData,
        preferences: updatedPreferences
      }
      onUpdate(updatedData)
      toast.success(t('preferenceUpdateSuccess'))
    } catch (error) {
      toast.error(t('preferenceUpdateError'))
      // Revert on error
      setPreferences(profileData.preferences)
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = async (key: keyof typeof preferences.notifications, value: boolean) => {
    const updatedNotifications = { ...preferences.notifications, [key]: value }
    const updatedPreferences = { ...preferences, notifications: updatedNotifications }
    setPreferences(updatedPreferences)

    // Save immediately on change
    setSaving(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedData = {
        ...profileData,
        preferences: updatedPreferences
      }
      onUpdate(updatedData)
      toast.success(t('notificationUpdateSuccess'))
    } catch (error) {
      toast.error(t('notificationUpdateError'))
      // Revert on error
      setPreferences(profileData.preferences)
    } finally {
      setSaving(false)
    }
  }

  const getThemeIcon = (themeValue: string) => {
    const theme = themes.find(t => t.value === themeValue)
    return theme ? theme.icon : Monitor
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language & Localization */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>{t('language')}</span>
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">{t('language')}</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => handlePreferenceChange('language', value)}
                disabled={saving}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">{t('timeZone')}</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => handlePreferenceChange('timezone', value)}
                disabled={saving}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{tz.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Theme */}
        <div className="space-y-4">
          <h4 className="font-medium">{t('theme')}</h4>
          
          <div className="space-y-2">
            <Label htmlFor="theme">{t('appearance')}</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => handlePreferenceChange('theme', value)}
              disabled={saving}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => {
                  const Icon = theme.icon
                  return (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{getThemeLabel(theme.value, t)}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('systemThemeDescription')}
            </p>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>{t('notifications.title')}</span>
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h5 className="font-medium">{t('notifications.email')}</h5>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.emailDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h5 className="font-medium">{t('notifications.sms')}</h5>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.smsDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications.sms}
                onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h5 className="font-medium">{t('notifications.app')}</h5>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.appDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications.app}
                onCheckedChange={(checked) => handleNotificationChange('app', checked)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {saving && (
          <div className="text-center text-sm text-muted-foreground">
            {t('savingPreferences')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}