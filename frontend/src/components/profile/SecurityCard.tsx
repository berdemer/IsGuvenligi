"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { KeyRound, ExternalLink, Shield, Info } from "lucide-react"
import toast from "react-hot-toast"

interface ProfileData {
  mfa: {
    totp: boolean
    webauthn: boolean
  }
  [key: string]: any
}

interface SecurityCardProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
}

export function SecurityCard({ profileData, onUpdate }: SecurityCardProps) {
  const t = useTranslations('profile.security')
  const tCommon = useTranslations('common')
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    setLoading(true)
    try {
      // Mock API call to initiate Keycloak password change
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real implementation, this would redirect to Keycloak
      window.open('/auth/change-password', '_blank')
      toast.success(t('changePasswordDialog.redirecting'))
      setPasswordDialogOpen(false)
    } catch (error) {
      toast.error(t('changePasswordDialog.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>{t('securityTitle')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Password Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('passwordManagement')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('managePasswordSecurely')}
              </p>
            </div>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t('changePassword')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>{t('changePasswordDialog.title')}</span>
                  </DialogTitle>
                  <DialogDescription>
                    {t('changePasswordDialog.description')}
                  </DialogDescription>
                </DialogHeader>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{t('changePasswordDialog.securityInfo')}</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>{t('changePasswordDialog.info1')}</li>
                        <li>{t('changePasswordDialog.info2')}</li>
                        <li>{t('changePasswordDialog.info3')}</li>
                        <li>{t('changePasswordDialog.info4')}</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                    {t('changePasswordDialog.cancel')}
                  </Button>
                  <Button onClick={handleChangePassword} disabled={loading}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {loading ? t('changePasswordDialog.opening') : t('changePasswordDialog.openSecurePasswordChange')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="border-t pt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{t('passwordSecurityTips')}</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>{t('tip1')}</li>
                  <li>{t('tip2')}</li>
                  <li>{t('tip3')}</li>
                  <li>{t('tip4')}</li>
                  <li>{t('tip5')}</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}