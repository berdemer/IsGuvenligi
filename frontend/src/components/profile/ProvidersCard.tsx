"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Smartphone, Globe, QrCode, Key, Info, AlertTriangle, Chrome, Check, X } from "lucide-react"
import toast from "react-hot-toast"

interface ProfileData {
  mfa: {
    totp: boolean
    webauthn: boolean
  }
  providers: {
    google: boolean
    microsoft: boolean
  }
  [key: string]: any
}

interface ProvidersCardProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
}

export function ProvidersCard({ profileData, onUpdate }: ProvidersCardProps) {
  const t = useTranslations('profile.mfa')
  const tCommon = useTranslations('common')
  const [totpDialogOpen, setTotpDialogOpen] = useState(false)
  const [webauthnDialogOpen, setWebauthnDialogOpen] = useState(false)
  const [totpCode, setTotpCode] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock admin settings - in real app, this would come from API
  const adminSettings = {
    allowGoogleProvider: true,
    allowMicrosoftProvider: false,
    requireMfa: true
  }

  const handleTotpToggle = async (enabled: boolean) => {
    if (enabled) {
      setTotpDialogOpen(true)
    } else {
      if (adminSettings.requireMfa) {
        toast.error(t('totp.cannotDisable'))
        return
      }
      
      setLoading(true)
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const updatedData = {
          ...profileData,
          mfa: { ...profileData.mfa, totp: false }
        }
        onUpdate(updatedData)
        toast.success(t('totp.disabledSuccess'))
      } catch (error) {
        toast.error(t('totp.disableError'))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleTotpSetup = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error(t('totp.enterValidCode'))
      return
    }

    setLoading(true)
    try {
      // Mock API call to verify TOTP code
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const updatedData = {
        ...profileData,
        mfa: { ...profileData.mfa, totp: true }
      }
      onUpdate(updatedData)
      toast.success(t('totp.enabledSuccess'))
      setTotpDialogOpen(false)
      setTotpCode("")
    } catch (error) {
      toast.error(t('totp.invalidCode'))
    } finally {
      setLoading(false)
    }
  }

  const handleWebauthnToggle = async (enabled: boolean) => {
    if (enabled) {
      // Check browser compatibility
      if (!window.navigator.credentials) {
        toast.error(t('webauthn.notSupported'))
        return
      }
      
      setWebauthnDialogOpen(true)
    } else {
      setLoading(true)
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const updatedData = {
          ...profileData,
          mfa: { ...profileData.mfa, webauthn: false }
        }
        onUpdate(updatedData)
        toast.success(t('webauthn.disabledSuccess'))
      } catch (error) {
        toast.error(t('webauthn.setupError'))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleWebauthnSetup = async () => {
    setLoading(true)
    try {
      // Mock WebAuthn setup
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const updatedData = {
        ...profileData,
        mfa: { ...profileData.mfa, webauthn: true }
      }
      onUpdate(updatedData)
      toast.success(t('webauthn.enabledSuccess'))
      setWebauthnDialogOpen(false)
    } catch (error) {
      toast.error(t('webauthn.setupError'))
    } finally {
      setLoading(false)
    }
  }

  const handleProviderToggle = async (provider: 'google' | 'microsoft', enabled: boolean) => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedData = {
        ...profileData,
        providers: { ...profileData.providers, [provider]: enabled }
      }
      onUpdate(updatedData)
      const providerName = provider === 'google' ? t('google.title') : t('microsoft.title')
      const status = enabled ? tCommon('connected') : tCommon('disconnected')
      toast.success(`${providerName} ${status}`)
    } catch (error) {
      const providerName = provider === 'google' ? t('google.title') : t('microsoft.title')
      const action = enabled ? tCommon('connect') : tCommon('disconnect')
      toast.error(`${providerName} ${action} ${tCommon('failed')}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* MFA Section */}
        <div className="space-y-4">
          <h4 className="font-medium">{t('multiFactorAuth')}</h4>
          
          {adminSettings.requireMfa && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t('mfaRequired')}
              </AlertDescription>
            </Alert>
          )}

          {/* TOTP */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium">{t('totp.title')}</h5>
                  <Badge variant={profileData.mfa.totp ? "default" : "secondary"}>
                    {profileData.mfa.totp ? t('totp.enabled') : t('totp.disabled')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('totp.description')}
                </p>
              </div>
            </div>
            <Switch
              checked={profileData.mfa.totp}
              onCheckedChange={handleTotpToggle}
              disabled={loading || (profileData.mfa.totp && adminSettings.requireMfa)}
            />
          </div>

          {/* WebAuthn */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium">{t('webauthn.title')}</h5>
                  <Badge variant={profileData.mfa.webauthn ? "default" : "secondary"}>
                    {profileData.mfa.webauthn ? t('totp.enabled') : t('totp.disabled')}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{t('webauthn.description')}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Chrome className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('compatibleBrowsers')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            <Switch
              checked={profileData.mfa.webauthn}
              onCheckedChange={handleWebauthnToggle}
              disabled={loading}
            />
          </div>
        </div>

        <Separator />

        {/* Linked Providers Section */}
        <div className="space-y-4">
          <h4 className="font-medium">{t('linkedAccounts')}</h4>
          
          {/* Google */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium">{t('google.title')}</h5>
                  <Badge variant={profileData.providers.google ? "default" : "secondary"}>
                    {profileData.providers.google ? t('google.connected') : t('google.disconnected')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('google.description')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!adminSettings.allowGoogleProvider && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('google.disabledByAdmin')}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Switch
                checked={profileData.providers.google}
                onCheckedChange={(enabled) => handleProviderToggle('google', enabled)}
                disabled={loading || !adminSettings.allowGoogleProvider}
              />
            </div>
          </div>

          {/* Microsoft */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium">{t('microsoft.title')}</h5>
                  <Badge variant={profileData.providers.microsoft ? "default" : "secondary"}>
                    {profileData.providers.microsoft ? t('microsoft.connected') : t('microsoft.disconnected')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('microsoft.description')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!adminSettings.allowMicrosoftProvider && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('google.disabledByAdmin')}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Switch
                checked={profileData.providers.microsoft}
                onCheckedChange={(enabled) => handleProviderToggle('microsoft', enabled)}
                disabled={loading || !adminSettings.allowMicrosoftProvider}
              />
            </div>
          </div>
        </div>

        {/* TOTP Setup Dialog */}
        <Dialog open={totpDialogOpen} onOpenChange={setTotpDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>{t('totp.setup')}</span>
              </DialogTitle>
              <DialogDescription>
                {t('totp.setupDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('totp.qrCodePlaceholder')}
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{t('totp.instructions')}</p>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>{t('totp.step1')}</li>
                      <li>{t('totp.step2')}</li>
                      <li>{t('totp.step3')}</li>
                      <li>{t('totp.step4')}</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="totpCode">{t('totp.verificationCode')}</Label>
                <Input
                  id="totpCode"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-wider"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setTotpDialogOpen(false)}>
                {t('totp.cancel')}
              </Button>
              <Button onClick={handleTotpSetup} disabled={loading || totpCode.length !== 6}>
                {loading ? t('totp.verifying') : t('totp.enableTotp')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* WebAuthn Setup Dialog */}
        <Dialog open={webauthnDialogOpen} onOpenChange={setWebauthnDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>{t('webauthn.setup')}</span>
              </DialogTitle>
              <DialogDescription>
                {t('webauthn.setupDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{t('webauthn.supportedMethods')}</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>{t('webauthn.hardwareKeys')}</li>
                      <li>{t('webauthn.touchId')}</li>
                      <li>{t('webauthn.faceId')}</li>
                      <li>{t('webauthn.windowsHello')}</li>
                      <li>{t('webauthn.androidBiometric')}</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <Alert>
                <Chrome className="h-4 w-4" />
                <AlertDescription>
                  {t('webauthn.browserCompatibility')}
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setWebauthnDialogOpen(false)}>
                {t('webauthn.cancel')}
              </Button>
              <Button onClick={handleWebauthnSetup} disabled={loading}>
                {loading ? t('webauthn.settingUp') : t('webauthn.setupWebauthn')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}