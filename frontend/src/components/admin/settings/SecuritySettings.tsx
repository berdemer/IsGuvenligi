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
          title: "Connection successful",
          description: "Successfully connected to Keycloak server.",
        })
      } else {
        setConnectionStatus('error')
        toast({
          title: "Connection failed",
          description: "Could not connect to Keycloak server. Check your settings.",
          variant: "destructive"
        })
      }
    } catch (error) {
      setConnectionStatus('error')
      toast({
        title: "Connection error",
        description: "An error occurred while testing the connection.",
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
      title: "JWT Secret Generated",
      description: "A new JWT secret has been generated.",
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
          <TabsTrigger value="keycloak">Keycloak</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="mfa">Multi-Factor</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        {/* Keycloak Configuration */}
        <TabsContent value="keycloak" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Keycloak Configuration
                {config.keycloak.enabled ? (
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure Keycloak integration for authentication and authorization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label>Enable Keycloak Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Use Keycloak for user authentication and management
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
                      <Label htmlFor="serverUrl">Server URL</Label>
                      <Input
                        id="serverUrl"
                        value={config.keycloak.serverUrl}
                        onChange={(e) => updateKeycloak({ serverUrl: e.target.value })}
                        placeholder="http://localhost:8080"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="realm">Realm</Label>
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
                      <Label htmlFor="clientId">Client ID</Label>
                      <Input
                        id="clientId"
                        value={config.keycloak.clientId}
                        onChange={(e) => updateKeycloak({ clientId: e.target.value })}
                        placeholder="admin-console"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientSecret">Client Secret</Label>
                      <div className="flex gap-2">
                        <Input
                          id="clientSecret"
                          type={showSecrets ? "text" : "password"}
                          value={config.keycloak.clientSecret}
                          onChange={(e) => updateKeycloak({ clientSecret: e.target.value })}
                          placeholder="Enter client secret"
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
                      <Label htmlFor="adminUsername">Admin Username</Label>
                      <Input
                        id="adminUsername"
                        value={config.keycloak.adminUsername}
                        onChange={(e) => updateKeycloak({ adminUsername: e.target.value })}
                        placeholder="admin"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Admin Password</Label>
                      <Input
                        id="adminPassword"
                        type={showSecrets ? "text" : "password"}
                        value={config.keycloak.adminPassword}
                        onChange={(e) => updateKeycloak({ adminPassword: e.target.value })}
                        placeholder="Enter admin password"
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
                      <Label htmlFor="sslRequired">Require SSL</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="publicClient"
                        checked={config.keycloak.publicClient}
                        onCheckedChange={(checked) => updateKeycloak({ publicClient: checked })}
                      />
                      <Label htmlFor="publicClient">Public Client</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getConnectionIcon()}
                      <div>
                        <h4 className="font-medium">Connection Test</h4>
                        <p className="text-sm text-muted-foreground">
                          {connectionStatus === 'connected' && 'Connected successfully'}
                          {connectionStatus === 'error' && 'Connection failed'}
                          {connectionStatus === 'unknown' && 'Test connection to Keycloak server'}
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
                      Test Connection
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
                Password Policy
              </CardTitle>
              <CardDescription>
                Configure password requirements and security rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Length</Label>
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
                  <Label htmlFor="maxAge">Password Age (days)</Label>
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
                  <Label>Require Uppercase Letters</Label>
                  <Switch
                    checked={config.auth.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => updatePasswordPolicy({ requireUppercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Require Lowercase Letters</Label>
                  <Switch
                    checked={config.auth.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => updatePasswordPolicy({ requireLowercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Require Numbers</Label>
                  <Switch
                    checked={config.auth.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => updatePasswordPolicy({ requireNumbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Require Special Characters</Label>
                  <Switch
                    checked={config.auth.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => updatePasswordPolicy({ requireSpecialChars: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="historyCount">Password History Count</Label>
                <Input
                  id="historyCount"
                  type="number"
                  min="0"
                  max="10"
                  value={config.auth.passwordPolicy.historyCount}
                  onChange={(e) => updatePasswordPolicy({ historyCount: parseInt(e.target.value) || 5 })}
                />
                <p className="text-xs text-muted-foreground">
                  Number of previous passwords to remember
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Management
              </CardTitle>
              <CardDescription>
                Configure user session behavior and timeouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
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
                  <Label htmlFor="maxConcurrentSessions">Max Concurrent Sessions</Label>
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
                  <Label>Enable Remember Me</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to stay logged in for extended periods
                  </p>
                </div>
                <Switch
                  checked={config.auth.enableRememberMe}
                  onCheckedChange={(checked) => updateAuth({ enableRememberMe: checked })}
                />
              </div>

              {config.auth.enableRememberMe && (
                <div className="space-y-2">
                  <Label htmlFor="rememberMeTimeout">Remember Me Duration (seconds)</Label>
                  <Input
                    id="rememberMeTimeout"
                    type="number"
                    min="86400"
                    max="31536000"
                    value={config.auth.rememberMeTimeout}
                    onChange={(e) => updateAuth({ rememberMeTimeout: parseInt(e.target.value) || 2592000 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: 30 days (2592000 seconds)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Configure account protection and security measures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
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
                  <Label htmlFor="accountLockoutDuration">Lockout Duration (seconds)</Label>
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
                  <Label>Enable CAPTCHA</Label>
                  <Switch
                    checked={config.auth.enableCaptcha}
                    onCheckedChange={(checked) => updateAuth({ enableCaptcha: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Account Verification</Label>
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
                Multi-Factor Authentication
                {config.auth.mfaEnabled ? (
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure multi-factor authentication methods and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require additional authentication factors for enhanced security
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
                    <h4 className="font-medium">Authentication Methods</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-blue-500" />
                          <div>
                            <Label>TOTP Authenticator</Label>
                            <p className="text-sm text-muted-foreground">
                              Google Authenticator, Authy, etc.
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
                            <Label>Email Verification</Label>
                            <p className="text-sm text-muted-foreground">
                              Send codes via email
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
                            <Label>SMS Verification</Label>
                            <p className="text-sm text-muted-foreground">
                              Send codes via SMS
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
                            <Label>Backup Codes</Label>
                            <p className="text-sm text-muted-foreground">
                              One-time backup codes
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
                      <Label>Require MFA for All Users</Label>
                      <p className="text-sm text-muted-foreground">
                        Make MFA mandatory for all user accounts
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
                API Security
              </CardTitle>
              <CardDescription>
                Configure API authentication and rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="jwtSecret">JWT Secret Key</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateJwtSecret}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New
                  </Button>
                </div>
                <Input
                  id="jwtSecret"
                  type={showSecrets ? "text" : "password"}
                  value={config.auth.jwtSecret}
                  onChange={(e) => updateAuth({ jwtSecret: e.target.value })}
                  placeholder="JWT secret key"
                />
                <p className="text-xs text-muted-foreground">
                  Secret key used for signing JWT tokens
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jwtExpiration">JWT Expiration (seconds)</Label>
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
                    <Label>Enable Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit API requests to prevent abuse
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
                      <Label htmlFor="requestsPerMinute">Requests Per Minute</Label>
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
                      <Label htmlFor="burstLimit">Burst Limit</Label>
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
                CORS Configuration
              </CardTitle>
              <CardDescription>
                Configure Cross-Origin Resource Sharing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable CORS</Label>
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
                    <Label htmlFor="corsOrigins">Allowed Origins</Label>
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
                    <Label>Allow Credentials</Label>
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
                Security Audit Logging
              </CardTitle>
              <CardDescription>
                Configure what security events to log and monitor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Log Failed Login Attempts</Label>
                  <Switch
                    checked={config.audit.logFailedLogins}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      audit: { ...prev.audit, logFailedLogins: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Log Successful Logins</Label>
                  <Switch
                    checked={config.audit.logSuccessfulLogins}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      audit: { ...prev.audit, logSuccessfulLogins: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Log Password Changes</Label>
                  <Switch
                    checked={config.audit.logPasswordChanges}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      audit: { ...prev.audit, logPasswordChanges: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Log Permission Changes</Label>
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
                <Label htmlFor="retentionDays">Log Retention (days)</Label>
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
                  How long to keep audit logs (minimum 30 days)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}