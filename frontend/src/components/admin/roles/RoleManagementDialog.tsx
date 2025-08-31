"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, AlertTriangle, Save, Shield, Settings, Users, Database, Eye, Edit, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface Role {
  id?: string
  name: string
  displayName: string
  description?: string
  permissions: string[]
  createdAt?: string
  updatedAt?: string
  userCount?: number
}

interface RoleManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role
  onSave: (role: Role) => void
}

const AVAILABLE_PERMISSIONS = [
  { category: 'user', permissions: ['user:read', 'user:write', 'user:delete'] },
  { category: 'role', permissions: ['role:read', 'role:write', 'role:delete'] },
  { category: 'oauth', permissions: ['oauth:read', 'oauth:write'] },
  { category: 'audit', permissions: ['audit:read', 'audit:write'] },
  { category: 'system', permissions: ['system:read', 'system:write'] },
  { category: 'settings', permissions: ['settings:read', 'settings:write'] },
]

const PERMISSION_ICONS: { [key: string]: any } = {
  user: Users,
  role: Shield,
  oauth: Settings,
  audit: Database,
  system: Settings,
  settings: Settings,
}

export function RoleManagementDialog({ open, onOpenChange, role, onSave }: RoleManagementDialogProps) {
  const t = useTranslations('admin.roles.dialog')
  const [formData, setFormData] = useState<Role>({
    name: role?.name || '',
    displayName: role?.displayName || '',
    description: role?.description || '',
    permissions: role?.permissions || [],
    ...role
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const isEdit = !!role?.id

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired')
    } else if (!/^[a-z_][a-z0-9_]*$/.test(formData.name)) {
      newErrors.name = t('validation.nameFormat')
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = t('validation.displayNameRequired')
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = t('validation.permissionsRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(t('validation.fixErrors'))
      return
    }

    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onSave(formData)
      toast.success(isEdit ? t('updateSuccess') : t('createSuccess'))
      onOpenChange(false)
      
      // Reset form if creating new role
      if (!isEdit) {
        setFormData({
          name: '',
          displayName: '',
          description: '',
          permissions: [],
        })
      }
    } catch (error) {
      toast.error(isEdit ? t('updateError') : t('createError'))
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleCategoryToggle = (category: string, categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p))
    
    if (allSelected) {
      // Remove all permissions from this category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }))
    } else {
      // Add all permissions from this category
      const newPermissions = [
        ...formData.permissions.filter(p => !categoryPermissions.includes(p)),
        ...categoryPermissions
      ]
      setFormData(prev => ({
        ...prev,
        permissions: newPermissions
      }))
    }
  }

  const getPermissionLevel = (permission: string) => {
    const [, action] = permission.split(':')
    return action
  }

  const getPermissionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return Eye
      case 'write':
        return Edit
      case 'delete':
        return Trash2
      default:
        return Shield
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{isEdit ? t('editTitle') : t('createTitle')}</span>
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('basicInformation')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('fields.name')} *</Label>
                <Input
                  id="name"
                  placeholder={t('placeholders.name')}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={loading}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">{t('fields.displayName')} *</Label>
                <Input
                  id="displayName"
                  placeholder={t('placeholders.displayName')}
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  disabled={loading}
                  className={errors.displayName ? "border-red-500" : ""}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-500">{errors.displayName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('fields.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('placeholders.description')}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t('permissions.title')}</h3>
              <Badge variant="outline">
                {formData.permissions.length} {t('permissions.selected')}
              </Badge>
            </div>

            {errors.permissions && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.permissions}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {AVAILABLE_PERMISSIONS.map(({ category, permissions }) => {
                const Icon = PERMISSION_ICONS[category] || Shield
                const allSelected = permissions.every(p => formData.permissions.includes(p))
                const someSelected = permissions.some(p => formData.permissions.includes(p))

                return (
                  <div key={category} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={allSelected}
                        ref={(ref: HTMLButtonElement | null) => {
                          if (ref) {
                            (ref as any).indeterminate = someSelected && !allSelected
                          }
                        }}
                        onCheckedChange={() => handleCategoryToggle(category, permissions)}
                        disabled={loading}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium capitalize">{t(`permissions.categories.${category}`)}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {permissions.filter(p => formData.permissions.includes(p)).length}/{permissions.length}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 ml-8">
                      {permissions.map(permission => {
                        const action = getPermissionLevel(permission)
                        const ActionIcon = getPermissionIcon(action)
                        const isSelected = formData.permissions.includes(permission)

                        return (
                          <label
                            key={permission}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handlePermissionToggle(permission)}
                              disabled={loading}
                            />
                            <ActionIcon className={`h-4 w-4 ${
                              action === 'read' ? 'text-green-600' :
                              action === 'write' ? 'text-blue-600' :
                              action === 'delete' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                            <span className="text-sm capitalize">{t(`permissions.actions.${action}`)}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Role Preview */}
          {(formData.name || formData.displayName) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('preview.title')}</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="font-mono">
                      {formData.name || t('preview.roleName')}
                    </Badge>
                    <span className="font-medium">
                      {formData.displayName || t('preview.displayName')}
                    </span>
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-600">{formData.description}</p>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span>{formData.permissions.length} {t('preview.permissions')}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isEdit ? t('updating') : t('creating')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? t('update') : t('create')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}