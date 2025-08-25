"use client"

import { useState } from "react"
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
      
      toast.success("All sessions revoked successfully. You will be redirected to login.")
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      
      setRevokeDialogOpen(false)
    } catch (error) {
      toast.error("Failed to revoke all sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateAccount = async () => {
    if (confirmationText !== 'DEACTIVATE') {
      toast.error('Please type DEACTIVATE to confirm')
      return
    }

    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      toast.success("Account deactivated successfully")
      
      // Redirect to login after deactivation
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      
      setDeactivateDialogOpen(false)
    } catch (error) {
      toast.error("Failed to deactivate account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Danger Zone</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            These actions are irreversible. Proceed with caution.
          </AlertDescription>
        </Alert>

        {/* Revoke All Sessions */}
        <div className="p-4 border border-destructive/20 rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-destructive">Revoke All Sessions</h4>
              <p className="text-sm text-muted-foreground">
                Sign out from all devices and browsers immediately. This will terminate all active sessions except the current one.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• All other devices will be signed out</p>
                <p>• You will remain signed in on this device</p>
                <p>• You'll need to sign in again on other devices</p>
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
                  Revoke All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Revoke All Sessions</span>
                  </DialogTitle>
                  <DialogDescription>
                    This will immediately sign you out of all other devices and browsers.
                  </DialogDescription>
                </DialogHeader>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">This action will:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Terminate all active sessions on other devices</li>
                        <li>Require re-authentication on those devices</li>
                        <li>Keep you signed in on this current device</li>
                        <li>Take effect immediately</li>
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
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRevokeAllSessions}
                    disabled={loading}
                  >
                    {loading ? 'Revoking...' : 'Revoke All Sessions'}
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
              <h4 className="font-medium text-destructive">Deactivate Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently deactivate your account. This action cannot be undone without administrator intervention.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Account will be immediately disabled</p>
                <p>• Data will be retained for compliance</p>
                <p>• Requires administrator approval to reactivate</p>
                <p>• All sessions will be terminated</p>
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
                  Deactivate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <UserX className="h-5 w-5" />
                    <span>Deactivate Account</span>
                  </DialogTitle>
                  <DialogDescription>
                    This will permanently deactivate your account. This action cannot be undone without administrator help.
                  </DialogDescription>
                </DialogHeader>
                
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Warning: This action is irreversible</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Your account will be immediately deactivated</li>
                        <li>You will lose access to all systems</li>
                        <li>Data will be retained for compliance purposes</li>
                        <li>Only administrators can reactivate your account</li>
                        <li>All active sessions will be terminated</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    Type <code className="text-destructive font-mono">DEACTIVATE</code> to confirm:
                  </Label>
                  <Input
                    id="confirmation"
                    placeholder="Type DEACTIVATE"
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
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeactivateAccount}
                    disabled={loading || confirmationText !== 'DEACTIVATE'}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {loading ? 'Deactivating...' : 'Deactivate Account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {!userPermissions.canDeactivate && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Account deactivation is restricted by your organization's security policy. 
                Contact your administrator if you need to deactivate your account.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}