"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, Save, AlertTriangle, User } from "lucide-react"
import { useUsersStore, type User } from "@/stores/usersStore"
import toast from "react-hot-toast"

interface RoleManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

const AVAILABLE_ROLES = [
  { id: 'admin', name: 'admin', displayName: 'System Administrator' },
  { id: 'manager', name: 'manager', displayName: 'Security Manager' },
  { id: 'viewer', name: 'viewer', displayName: 'Read-Only User' },
]

export function RoleManagementDialog({ open, onOpenChange, user }: RoleManagementDialogProps) {
  const t = useTranslations('users.roles')
  const { updateUser } = useUsersStore()
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Update selected roles when user changes
  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || [])
    }
  }, [user])

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      updateUser(user.id, { roles: selectedRoles })
      toast.success(t('updateSuccess'))
      onOpenChange(false)
    } catch (error) {
      toast.error(t('updateError'))
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'viewer':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{t('title')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg font-medium">
                  {getInitials(user.fullName || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{user.fullName}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-sm text-gray-500">{user.department}</div>
              </div>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? t('active') : t('inactive')}
              </Badge>
            </div>
          </div>

          {/* Current Roles Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t('currentRoles')}</h3>
              <Badge variant="outline">
                {selectedRoles.length} {t('selected')}
              </Badge>
            </div>
            
            {selectedRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(roleId => {
                  const role = AVAILABLE_ROLES.find(r => r.id === roleId)
                  return role ? (
                    <Badge key={roleId} variant="secondary" className={getRoleBadgeColor(role.name)}>
                      {role.displayName}
                    </Badge>
                  ) : null
                })}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('noRolesWarning')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">{t('availableRoles')}</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_ROLES.map(role => {
                const isSelected = selectedRoles.includes(role.id)
                
                return (
                  <label
                    key={role.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                      disabled={loading}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={getRoleBadgeColor(role.name)}>
                          {role.name}
                        </Badge>
                        <span className="font-medium">{role.displayName}</span>
                      </div>
                      <p className="text-sm text-gray-600">{t(`roleDescriptions.${role.name}`)}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
{t('cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || selectedRoles.length === 0}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t('updating')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('saveChanges')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}