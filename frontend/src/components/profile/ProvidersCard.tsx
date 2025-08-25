"use client"

import { useState } from "react"
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
        toast.error('MFA is required by your organization and cannot be disabled')
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
        toast.success('TOTP authentication disabled')
      } catch (error) {
        toast.error('Failed to disable TOTP authentication')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleTotpSetup = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
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
      toast.success('TOTP authentication enabled successfully')
      setTotpDialogOpen(false)
      setTotpCode("")
    } catch (error) {
      toast.error('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWebauthnToggle = async (enabled: boolean) => {
    if (enabled) {
      // Check browser compatibility
      if (!window.navigator.credentials) {
        toast.error('WebAuthn is not supported in this browser')
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
        toast.success('WebAuthn disabled')
      } catch (error) {
        toast.error('Failed to disable WebAuthn')
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
      toast.success('WebAuthn enabled successfully')
      setWebauthnDialogOpen(false)
    } catch (error) {
      toast.error('WebAuthn setup failed. Please try again.')
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
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} ${enabled ? 'connected' : 'disconnected'}`)
    } catch (error) {
      toast.error(`Failed to ${enabled ? 'connect' : 'disconnect'} ${provider}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Multi-Factor Authentication & Providers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* MFA Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Multi-Factor Authentication</h4>
          
          {adminSettings.requireMfa && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Multi-factor authentication is required by your organization for enhanced security.
              </AlertDescription>
            </Alert>
          )}

          {/* TOTP */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium">Authenticator App (TOTP)</h5>
                  <Badge variant={profileData.mfa.totp ? "default" : "secondary"}>
                    {profileData.mfa.totp ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use Google Authenticator, Authy, or similar apps
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
                  <h5 className="font-medium">Security Keys (WebAuthn)</h5>
                  <Badge variant={profileData.mfa.webauthn ? "default" : "secondary"}>
                    {profileData.mfa.webauthn ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Hardware keys, Touch ID, Face ID</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Chrome className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Compatible browsers: Chrome, Firefox, Safari, Edge</p>
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
          <h4 className="font-medium">Linked Accounts</h4>
          
          {/* Google */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium">Google</h5>
                  <Badge variant={profileData.providers.google ? "default" : "secondary"}>
                    {profileData.providers.google ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sign in with your Google account
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
                    <p>Disabled by administrator</p>
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
                  <h5 className="font-medium">Microsoft</h5>
                  <Badge variant={profileData.providers.microsoft ? "default" : "secondary"}>
                    {profileData.providers.microsoft ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sign in with your Microsoft account
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
                    <p>Disabled by administrator</p>
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
                <span>Set up TOTP Authentication</span>
              </DialogTitle>
              <DialogDescription>
                Follow these steps to set up two-factor authentication with your authenticator app.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  QR Code placeholder - scan with your authenticator app
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                      <li>Scan the QR code above with your app</li>
                      <li>Enter the 6-digit code from your app below</li>
                      <li>Click "Enable TOTP" to complete setup</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="totpCode">Verification Code</Label>
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
                Cancel
              </Button>
              <Button onClick={handleTotpSetup} disabled={loading || totpCode.length !== 6}>
                {loading ? 'Verifying...' : 'Enable TOTP'}
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
                <span>Set up WebAuthn</span>
              </DialogTitle>
              <DialogDescription>
                Set up hardware security keys, Touch ID, Face ID, or Windows Hello for authentication.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Supported Methods:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Hardware security keys (YubiKey, etc.)</li>
                      <li>Touch ID on Mac</li>
                      <li>Face ID on iPhone/iPad</li>
                      <li>Windows Hello</li>
                      <li>Android fingerprint/face unlock</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <Alert>
                <Chrome className="h-4 w-4" />
                <AlertDescription>
                  Make sure you're using a compatible browser: Chrome, Firefox, Safari, or Edge.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setWebauthnDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleWebauthnSetup} disabled={loading}>
                {loading ? 'Setting up...' : 'Set up WebAuthn'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}