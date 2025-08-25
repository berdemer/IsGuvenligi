"use client"

import { useState } from "react"
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
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    setLoading(true)
    try {
      // Mock API call to initiate Keycloak password change
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real implementation, this would redirect to Keycloak
      window.open('/auth/change-password', '_blank')
      toast.success('Redirecting to secure password change...')
      setPasswordDialogOpen(false)
    } catch (error) {
      toast.error('Failed to initiate password change')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Security</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Password Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Manage your account password securely
              </p>
            </div>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Change Password</span>
                  </DialogTitle>
                  <DialogDescription>
                    You will be redirected to a secure password change page managed by our identity provider.
                  </DialogDescription>
                </DialogHeader>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Security Information:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Password changes are handled by our secure identity provider (Keycloak)</li>
                        <li>Your new password must meet security requirements</li>
                        <li>You will need to log in again after changing your password</li>
                        <li>All active sessions will be terminated for security</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword} disabled={loading}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {loading ? 'Opening...' : 'Open Secure Password Change'}
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
                <p className="font-medium">Password Security Tips:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Use a strong, unique password with at least 12 characters</li>
                  <li>Include a mix of uppercase, lowercase, numbers, and symbols</li>
                  <li>Avoid using personal information or common words</li>
                  <li>Consider using a password manager</li>
                  <li>Enable two-factor authentication for additional security</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}