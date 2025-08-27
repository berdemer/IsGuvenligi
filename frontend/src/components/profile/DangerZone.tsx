"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, LogOut, UserX, Shield, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface ProfileData {
  email: string
  firstName: string
  lastName: string
  [key: string]: any
}

interface DangerZoneProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
}

export function DangerZone({ profileData }: DangerZoneProps) {
  const t = useTranslations('profile.dangerZone')
  const router = useRouter()
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock admin settings - in real app, this would come from API/user permissions
  const userPermissions = {
    canDeactivate: false, // Most users cannot deactivate their own account
    canRevokeAllSessions: true
  }

  const handleRevokeAllSessions = async () => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(t('revokeAllSessions.successMessage'))
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      
      setRevokeDialogOpen(false)
    } catch (error) {
      toast.error(t('revokeAllSessions.errorMessage'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateAccount = async () => {
    if (confirmationText !== 'DEACTIVATE') {
      toast.error(t('deactivateAccount.confirmationError'))
      return
    }

    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      toast.success(t('deactivateAccount.successMessage'))
      
      // Redirect to login after deactivation
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      
      setDeactivateDialogOpen(false)
    } catch (error) {
      toast.error(t('deactivateAccount.errorMessage'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('irreversibleWarning')}
          </AlertDescription>
        </Alert>

        {/* Revoke All Sessions */}
        <div className="p-4 border border-destructive/20 rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-destructive">{t('revokeAllSessions.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('revokeAllSessions.description')}
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t('revokeAllSessions.info1')}</p>
                <p>{t('revokeAllSessions.info2')}</p>
                <p>{t('revokeAllSessions.info3')}</p>
              </div>
            </div>
            <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!userPermissions.canRevokeAllSessions}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('revokeAllSessions.button')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>{t('revokeAllSessions.dialogTitle')}</span>
                  </DialogTitle>
                  <DialogDescription>
                    {t('revokeAllSessions.dialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{t('revokeAllSessions.actionWillTitle')}</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>{t('revokeAllSessions.action1')}</li>
                        <li>{t('revokeAllSessions.action2')}</li>
                        <li>{t('revokeAllSessions.action3')}</li>
                        <li>{t('revokeAllSessions.action4')}</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setRevokeDialogOpen(false)}
                    disabled={loading}
                  >
                    {t('revokeAllSessions.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRevokeAllSessions}
                    disabled={loading}
                  >
                    {loading ? t('revokeAllSessions.revoking') : t('revokeAllSessions.confirmButton')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator />

        {/* Deactivate Account */}
        <div className="p-4 border border-destructive/20 rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-destructive">{t('deactivateAccount.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('deactivateAccount.description')}
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t('deactivateAccount.info1')}</p>
                <p>{t('deactivateAccount.info2')}</p>
                <p>{t('deactivateAccount.info3')}</p>
                <p>{t('deactivateAccount.info4')}</p>
              </div>
            </div>
            <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!userPermissions.canDeactivate}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  {t('deactivateAccount.button')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <UserX className="h-5 w-5" />
                    <span>{t('deactivateAccount.dialogTitle')}</span>
                  </DialogTitle>
                  <DialogDescription>
                    {t('deactivateAccount.dialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{t('deactivateAccount.warningTitle')}</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>{t('deactivateAccount.warning1')}</li>
                        <li>{t('deactivateAccount.warning2')}</li>
                        <li>{t('deactivateAccount.warning3')}</li>
                        <li>{t('deactivateAccount.warning4')}</li>
                        <li>{t('deactivateAccount.warning5')}</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    {t('deactivateAccount.confirmationLabel', { code: 'DEACTIVATE' }).split('DEACTIVATE')[0]}<code className="text-destructive font-mono">DEACTIVATE</code>{t('deactivateAccount.confirmationLabel', { code: 'DEACTIVATE' }).split('DEACTIVATE')[1]}
                  </Label>
                  <Input
                    id="confirmation"
                    placeholder={t('deactivateAccount.confirmationPlaceholder')}
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeactivateDialogOpen(false)
                      setConfirmationText("")
                    }}
                    disabled={loading}
                  >
                    {t('deactivateAccount.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeactivateAccount}
                    disabled={loading || confirmationText !== 'DEACTIVATE'}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {loading ? t('deactivateAccount.deactivating') : t('deactivateAccount.confirmButton')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {!userPermissions.canDeactivate && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('deactivateAccount.restrictedMessage')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}