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
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Settings,
  Globe,
  Clock,
  UserX,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Smartphone,
  Mail,
  Server,
  Database,
  Network
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SecuritySettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

interface KeycloakConfig {
  serverUrl: string
  realm: string
  clientId: string
  clientSecret: string
  adminUsername: string
  adminPassword: string
  enabled: boolean
  sslRequired: boolean
  publicClient: boolean
}

interface AuthConfig {
  // Basic Auth Settings
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    maxAge: number
    historyCount: number
  }
  
  // Session Management
  sessionTimeout: number
  maxConcurrentSessions: number
  rememberMeTimeout: number
  enableRememberMe: boolean
  
  // Multi-Factor Authentication
  mfaEnabled: boolean
  mfaMethods: {
    totp: boolean
    sms: boolean
    email: boolean
    backup: boolean
  }
  mfaRequired: boolean
  
  // Account Security
  maxLoginAttempts: number
  accountLockoutDuration: number
  enableCaptcha: boolean
  enableAccountVerification: boolean
  
  // API Security
  jwtSecret: string
  jwtExpiration: number
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
    burstLimit: number
  }
}

interface SecurityConfig {
  keycloak: KeycloakConfig
  auth: AuthConfig
  cors: {
    enabled: boolean
    origins: string[]
    methods: string[]
    credentials: boolean
  }
  encryption: {
    algorithm: string
    keyRotationDays: number
    enableFieldEncryption: boolean
  }
  audit: {
    logFailedLogins: boolean
    logSuccessfulLogins: boolean
    logPasswordChanges: boolean
    logPermissionChanges: boolean
    retentionDays: number
  }
}

const defaultConfig: SecurityConfig = {
  keycloak: {
    serverUrl: 'http://localhost:8080',
    realm: 'isguvenligi',
    clientId: 'admin-console',
    clientSecret: '',
    adminUsername: 'admin',
    adminPassword: '',
    enabled: true,
    sslRequired: false,
    publicClient: false
  },
  auth: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90,
      historyCount: 5
    },
    sessionTimeout: 1800,
    maxConcurrentSessions: 3,
    rememberMeTimeout: 2592000,
    enableRememberMe: true,
    mfaEnabled: true,
    mfaMethods: {
      totp: true,
      sms: false,
      email: true,
      backup: true
    },
    mfaRequired: false,
    maxLoginAttempts: 5,
    accountLockoutDuration: 900,
    enableCaptcha: true,
    enableAccountVerification: true,
    jwtSecret: '',
    jwtExpiration: 3600,
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 100,
      burstLimit: 20
    }
  },
  cors: {
    enabled: true,
    origins: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  },
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotationDays: 90,
    enableFieldEncryption: true
  },
  audit: {
    logFailedLogins: true,
    logSuccessfulLogins: true,
    logPasswordChanges: true,
    logPermissionChanges: true,
    retentionDays: 365
  }
}

export default function SecuritySettings({ onSettingsChange }: SecuritySettingsProps) {
  const { toast } = useToast()
  const t = useTranslations('security')
  const [config, setConfig] = useState<SecurityConfig>(defaultConfig)
  const [initialConfig, setInitialConfig] = useState<SecurityConfig>(defaultConfig)
  const [loading, setLoading] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')

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
      console.error('Failed to load security settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const testKeycloakConnection = async () => {
    try {
      setLoading(true)
      setConnectionStatus('unknown')
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success/failure
      const success = Math.random() > 0.3
      if (success) {
        setConnectionStatus('connected')
        toast({
          title: t('toast.connectionSuccessful'),
          description: t('keycloak.successfullyConnected'),
        })
      } else {
        setConnectionStatus('error')
        toast({
          title: t('toast.connectionFailed'),
          description: t('keycloak.couldNotConnect'),
          variant: "destructive"
        })
      }
    } catch (error) {
      setConnectionStatus('error')
      toast({
        title: t('toast.connectionError'),
        description: t('keycloak.errorOccurred'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateJwtSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let result = ''
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setConfig(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        jwtSecret: result
      }
    }))
    toast({
      title: t('toast.jwtSecretGenerated'),
      description: t('apiSecurity.newJwtSecretGenerated'),
    })
  }

  const updateKeycloak = (updates: Partial<KeycloakConfig>) => {
    setConfig(prev => ({
      ...prev,
      keycloak: { ...prev.keycloak, ...updates }
    }))
  }

  const updateAuth = (updates: Partial<AuthConfig>) => {
    setConfig(prev => ({
      ...prev,
      auth: { ...prev.auth, ...updates }
    }))
  }

  const updatePasswordPolicy = (updates: Partial<AuthConfig['passwordPolicy']>) => {
    setConfig(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        passwordPolicy: { ...prev.auth.passwordPolicy, ...updates }
      }
    }))
  }

  const updateMfaMethods = (method: keyof AuthConfig['mfaMethods'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        mfaMethods: {
          ...prev.auth.mfaMethods,
          [method]: value
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
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="keycloak" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="keycloak">{t('tabs.keycloak')}</TabsTrigger>
          <TabsTrigger value="authentication">{t('tabs.authentication')}</TabsTrigger>
          <TabsTrigger value="mfa">{t('tabs.mfa')}</TabsTrigger>
          <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
          <TabsTrigger value="audit">{t('tabs.audit')}</TabsTrigger>
        </TabsList>

        {/* Keycloak Configuration */}
        <TabsContent value="keycloak" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('keycloak.title')}
                {config.keycloak.enabled ? (
                  <Badge variant="default" className="bg-green-500">{t('keycloak.enabled')}</Badge>
                ) : (
                  <Badge variant="outline">{t('keycloak.disabled')}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {t('keycloak.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label>{t('keycloak.enableIntegration')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('keycloak.enableIntegrationDescription')}
                  </p>
                </div>
                <Switch
                  checked={config.keycloak.enabled}
                  onCheckedChange={(checked) => updateKeycloak({ enabled: checked })}
                />
              </div>

              {config.keycloak.enabled && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="serverUrl">{t('keycloak.serverUrl')}</Label>
                      <Input
                        id="serverUrl"
                        value={config.keycloak.serverUrl}
                        onChange={(e) => updateKeycloak({ serverUrl: e.target.value })}
                        placeholder="http://localhost:8080"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="realm">{t('keycloak.realm')}</Label>
                      <Input
                        id="realm"
                        value={config.keycloak.realm}
                        onChange={(e) => updateKeycloak({ realm: e.target.value })}
                        placeholder="isguvenligi"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">{t('keycloak.clientId')}</Label>
                      <Input
                        id="clientId"
                        value={config.keycloak.clientId}
                        onChange={(e) => updateKeycloak({ clientId: e.target.value })}
                        placeholder="admin-console"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientSecret">{t('keycloak.clientSecret')}</Label>
                      <div className="flex gap-2">
                        <Input
                          id="clientSecret"
                          type={showSecrets ? "text" : "password"}
                          value={config.keycloak.clientSecret}
                          onChange={(e) => updateKeycloak({ clientSecret: e.target.value })}
                          placeholder={t('keycloak.clientSecretPlaceholder')}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowSecrets(!showSecrets)}
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="adminUsername">{t('keycloak.adminUsername')}</Label>
                      <Input
                        id="adminUsername"
                        value={config.keycloak.adminUsername}
                        onChange={(e) => updateKeycloak({ adminUsername: e.target.value })}
                        placeholder="admin"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">{t('keycloak.adminPassword')}</Label>
                      <Input
                        id="adminPassword"
                        type={showSecrets ? "text" : "password"}
                        value={config.keycloak.adminPassword}
                        onChange={(e) => updateKeycloak({ adminPassword: e.target.value })}
                        placeholder={t('keycloak.adminPasswordPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sslRequired"
                        checked={config.keycloak.sslRequired}
                        onCheckedChange={(checked) => updateKeycloak({ sslRequired: checked })}
                      />
                      <Label htmlFor="sslRequired">{t('keycloak.requireSsl')}</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="publicClient"
                        checked={config.keycloak.publicClient}
                        onCheckedChange={(checked) => updateKeycloak({ publicClient: checked })}
                      />
                      <Label htmlFor="publicClient">{t('keycloak.publicClient')}</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getConnectionIcon()}
                      <div>
                        <h4 className="font-medium">{t('keycloak.connectionTest')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {connectionStatus === 'connected' && t('keycloak.connectionSuccessful')}
                          {connectionStatus === 'error' && t('keycloak.connectionFailed')}
                          {connectionStatus === 'unknown' && t('keycloak.connectionUnknown')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={testKeycloakConnection}
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Network className="h-4 w-4 mr-2" />
                      )}
                      {t('keycloak.testConnection')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Settings */}
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t('passwordPolicy.title')}
              </CardTitle>
              <CardDescription>
                {t('passwordPolicy.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minLength">{t('passwordPolicy.minLength')}</Label>
                  <Input
                    id="minLength"
                    type="number"
                    min="6"
                    max="32"
                    value={config.auth.passwordPolicy.minLength}
                    onChange={(e) => updatePasswordPolicy({ minLength: parseInt(e.target.value) || 8 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAge">{t('passwordPolicy.maxAge')}</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    min="30"
                    max="365"
                    value={config.auth.passwordPolicy.maxAge}
                    onChange={(e) => updatePasswordPolicy({ maxAge: parseInt(e.target.value) || 90 })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('passwordPolicy.requireUppercase')}</Label>
                  <Switch
                    checked={config.auth.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => updatePasswordPolicy({ requireUppercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('passwordPolicy.requireLowercase')}</Label>
                  <Switch
                    checked={config.auth.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => updatePasswordPolicy({ requireLowercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('passwordPolicy.requireNumbers')}</Label>
                  <Switch
                    checked={config.auth.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => updatePasswordPolicy({ requireNumbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('passwordPolicy.requireSpecialChars')}</Label>
                  <Switch
                    checked={config.auth.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => updatePasswordPolicy({ requireSpecialChars: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="historyCount">{t('passwordPolicy.historyCount')}</Label>
                <Input
                  id="historyCount"
                  type="number"
                  min="0"
                  max="10"
                  value={config.auth.passwordPolicy.historyCount}
                  onChange={(e) => updatePasswordPolicy({ historyCount: parseInt(e.target.value) || 5 })}
                />
                <p className="text-xs text-muted-foreground">
                  {t('passwordPolicy.historyCountDescription')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('sessionManagement.title')}
              </CardTitle>
              <CardDescription>
                {t('sessionManagement.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">{t('sessionManagement.sessionTimeout')}</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="300"
                    max="86400"
                    value={config.auth.sessionTimeout}
                    onChange={(e) => updateAuth({ sessionTimeout: parseInt(e.target.value) || 1800 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxConcurrentSessions">{t('sessionManagement.maxConcurrentSessions')}</Label>
                  <Input
                    id="maxConcurrentSessions"
                    type="number"
                    min="1"
                    max="10"
                    value={config.auth.maxConcurrentSessions}
                    onChange={(e) => updateAuth({ maxConcurrentSessions: parseInt(e.target.value) || 3 })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('sessionManagement.enableRememberMe')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('sessionManagement.enableRememberMeDescription')}
                  </p>
                </div>
                <Switch
                  checked={config.auth.enableRememberMe}
                  onCheckedChange={(checked) => updateAuth({ enableRememberMe: checked })}
                />
              </div>

              {config.auth.enableRememberMe && (
                <div className="space-y-2">
                  <Label htmlFor="rememberMeTimeout">{t('sessionManagement.rememberMeTimeout')}</Label>
                  <Input
                    id="rememberMeTimeout"
                    type="number"
                    min="86400"
                    max="31536000"
                    value={config.auth.rememberMeTimeout}
                    onChange={(e) => updateAuth({ rememberMeTimeout: parseInt(e.target.value) || 2592000 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('sessionManagement.defaultDuration')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                {t('accountSecurity.title')}
              </CardTitle>
              <CardDescription>
                {t('accountSecurity.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">{t('accountSecurity.maxLoginAttempts')}</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={config.auth.maxLoginAttempts}
                    onChange={(e) => updateAuth({ maxLoginAttempts: parseInt(e.target.value) || 5 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountLockoutDuration">{t('accountSecurity.lockoutDuration')}</Label>
                  <Input
                    id="accountLockoutDuration"
                    type="number"
                    min="300"
                    max="3600"
                    value={config.auth.accountLockoutDuration}
                    onChange={(e) => updateAuth({ accountLockoutDuration: parseInt(e.target.value) || 900 })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('accountSecurity.enableCaptcha')}</Label>
                  <Switch
                    checked={config.auth.enableCaptcha}
                    onCheckedChange={(checked) => updateAuth({ enableCaptcha: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('accountSecurity.enableAccountVerification')}</Label>
                  <Switch
                    checked={config.auth.enableAccountVerification}
                    onCheckedChange={(checked) => updateAuth({ enableAccountVerification: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Factor Authentication */}
        <TabsContent value="mfa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                {t('mfa.title')}
                {config.auth.mfaEnabled ? (
                  <Badge variant="default" className="bg-green-500">{t('keycloak.enabled')}</Badge>
                ) : (
                  <Badge variant="outline">{t('keycloak.disabled')}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {t('mfa.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('mfa.enableMfa')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('mfa.enableMfaDescription')}
                  </p>
                </div>
                <Switch
                  checked={config.auth.mfaEnabled}
                  onCheckedChange={(checked) => updateAuth({ mfaEnabled: checked })}
                />
              </div>

              {config.auth.mfaEnabled && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">{t('mfa.authenticationMethods')}</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-blue-500" />
                          <div>
                            <Label>{t('mfa.totpAuthenticator')}</Label>
                            <p className="text-sm text-muted-foreground">
                              {t('mfa.totpDescription')}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={config.auth.mfaMethods.totp}
                          onCheckedChange={(checked) => updateMfaMethods('totp', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-green-500" />
                          <div>
                            <Label>{t('mfa.emailVerification')}</Label>
                            <p className="text-sm text-muted-foreground">
                              {t('mfa.emailDescription')}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={config.auth.mfaMethods.email}
                          onCheckedChange={(checked) => updateMfaMethods('email', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-purple-500" />
                          <div>
                            <Label>{t('mfa.smsVerification')}</Label>
                            <p className="text-sm text-muted-foreground">
                              {t('mfa.smsDescription')}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={config.auth.mfaMethods.sms}
                          onCheckedChange={(checked) => updateMfaMethods('sms', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-orange-500" />
                          <div>
                            <Label>{t('mfa.backupCodes')}</Label>
                            <p className="text-sm text-muted-foreground">
                              {t('mfa.backupDescription')}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={config.auth.mfaMethods.backup}
                          onCheckedChange={(checked) => updateMfaMethods('backup', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('mfa.requireMfaForAllUsers')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('mfa.requireMfaDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={config.auth.mfaRequired}
                      onCheckedChange={(checked) => updateAuth({ mfaRequired: checked })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('apiSecurity.title')}
              </CardTitle>
              <CardDescription>
                {t('apiSecurity.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="jwtSecret">{t('apiSecurity.jwtSecretKey')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateJwtSecret}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('apiSecurity.generateNew')}
                  </Button>
                </div>
                <Input
                  id="jwtSecret"
                  type={showSecrets ? "text" : "password"}
                  value={config.auth.jwtSecret}
                  onChange={(e) => updateAuth({ jwtSecret: e.target.value })}
                  placeholder={t('apiSecurity.jwtSecretPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('apiSecurity.jwtSecretDescription')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jwtExpiration">{t('apiSecurity.jwtExpiration')}</Label>
                <Input
                  id="jwtExpiration"
                  type="number"
                  min="300"
                  max="86400"
                  value={config.auth.jwtExpiration}
                  onChange={(e) => updateAuth({ jwtExpiration: parseInt(e.target.value) || 3600 })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('apiSecurity.enableRateLimiting')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('apiSecurity.rateLimitingDescription')}
                    </p>
                  </div>
                  <Switch
                    checked={config.auth.rateLimiting.enabled}
                    onCheckedChange={(checked) => updateAuth({
                      rateLimiting: { ...config.auth.rateLimiting, enabled: checked }
                    })}
                  />
                </div>

                {config.auth.rateLimiting.enabled && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="requestsPerMinute">{t('apiSecurity.requestsPerMinute')}</Label>
                      <Input
                        id="requestsPerMinute"
                        type="number"
                        min="10"
                        max="1000"
                        value={config.auth.rateLimiting.requestsPerMinute}
                        onChange={(e) => updateAuth({
                          rateLimiting: {
                            ...config.auth.rateLimiting,
                            requestsPerMinute: parseInt(e.target.value) || 100
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="burstLimit">{t('apiSecurity.burstLimit')}</Label>
                      <Input
                        id="burstLimit"
                        type="number"
                        min="5"
                        max="100"
                        value={config.auth.rateLimiting.burstLimit}
                        onChange={(e) => updateAuth({
                          rateLimiting: {
                            ...config.auth.rateLimiting,
                            burstLimit: parseInt(e.target.value) || 20
                          }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('corsConfiguration.title')}
              </CardTitle>
              <CardDescription>
                {t('corsConfiguration.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('corsConfiguration.enableCors')}</Label>
                <Switch
                  checked={config.cors.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    cors: { ...prev.cors, enabled: checked }
                  }))}
                />
              </div>

              {config.cors.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="corsOrigins">{t('corsConfiguration.allowedOrigins')}</Label>
                    <Input
                      id="corsOrigins"
                      value={config.cors.origins.join(', ')}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        cors: {
                          ...prev.cors,
                          origins: e.target.value.split(',').map(s => s.trim())
                        }
                      }))}
                      placeholder="http://localhost:3000, https://yourdomain.com"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('corsConfiguration.allowCredentials')}</Label>
                    <Switch
                      checked={config.cors.credentials}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        cors: { ...prev.cors, credentials: checked }
                      }))}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Settings */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t('auditLogging.title')}
              </CardTitle>
              <CardDescription>
                {t('auditLogging.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('auditLogging.logFailedLogins')}</Label>
                  <Switch
                    checked={config.audit.logFailedLogins}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      audit: { ...prev.audit, logFailedLogins: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('auditLogging.logSuccessfulLogins')}</Label>
                  <Switch
                    checked={config.audit.logSuccessfulLogins}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      audit: { ...prev.audit, logSuccessfulLogins: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('auditLogging.logPasswordChanges')}</Label>
                  <Switch
                    checked={config.audit.logPasswordChanges}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      audit: { ...prev.audit, logPasswordChanges: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t('auditLogging.logPermissionChanges')}</Label>
                  <Switch
                    checked={config.audit.logPermissionChanges}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      audit: { ...prev.audit, logPermissionChanges: checked }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retentionDays">{t('auditLogging.logRetention')}</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  min="30"
                  max="2555"
                  value={config.audit.retentionDays}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    audit: { ...prev.audit, retentionDays: parseInt(e.target.value) || 365 }
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('auditLogging.logRetentionDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}