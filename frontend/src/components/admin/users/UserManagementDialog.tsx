"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserPlus, Save, AlertTriangle, Mail, Phone, Shield, User, Building, Check, ChevronsUpDown } from "lucide-react"
import { useDepartmentsStore } from '@/stores/departmentsStore'
import toast from "react-hot-toast"

interface User {
  id?: string
  email: string
  firstName: string
  lastName: string
  username: string
  department: string
  phone: string
  isActive: boolean
  roles: string[]
  createdAt?: string
  updatedAt?: string
}

interface UserManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
  onSave: (user: User) => void
}

const AVAILABLE_ROLES = [
  { id: 'admin', name: 'admin', displayName: 'System Administrator' },
  { id: 'manager', name: 'manager', displayName: 'Security Manager' },
  { id: 'viewer', name: 'viewer', displayName: 'Read-Only User' },
]

// DEPARTMENTS will be loaded dynamically from store

export function UserManagementDialog({ open, onOpenChange, user, onSave }: UserManagementDialogProps) {
  const t = useTranslations('users.dialog')
  const { getActiveDepartments, departments } = useDepartmentsStore()
  const activeDepartments = getActiveDepartments()
  
  // Debug: Log when departments change
  useEffect(() => {
    console.log('🏢 UserManagementDialog - Active departments updated:', activeDepartments.length, activeDepartments.map(d => d.name));
  }, [activeDepartments])
  const [formData, setFormData] = useState<User>({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    department: user?.department || '',
    phone: user?.phone || '',
    isActive: user?.isActive ?? true,
    roles: user?.roles || [],
    ...user
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [departmentOpen, setDepartmentOpen] = useState(false)

  const isEdit = !!user?.id

  // Update form data when user prop changes
  useEffect(() => {
    console.log('Dialog useEffect triggered - user:', user, 'open:', open);
    if (user) {
      const newFormData = {
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        department: user.department || '',
        phone: user.phone || '',
        isActive: user.isActive ?? true,
        roles: user.roles || [],
        ...user
      };
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
    } else {
      // Reset form for new user
      console.log('Resetting form for new user');
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        department: '',
        phone: '',
        isActive: true,
        roles: [],
      });
    }
    // Clear errors when user changes
    setErrors({});
  }, [user, open])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailValid')
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired')
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = t('validation.firstNameMin')
    } else if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(formData.firstName)) {
      newErrors.firstName = t('validation.firstNameLetters')
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.lastNameRequired')
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = t('validation.lastNameMin')
    } else if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(formData.lastName)) {
      newErrors.lastName = t('validation.lastNameLetters')
    }

    if (!formData.username.trim()) {
      newErrors.username = t('validation.usernameRequired')
    } else if (formData.username.length < 3) {
      newErrors.username = t('validation.usernameMin')
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      newErrors.username = t('validation.usernameFormat')
    }

    if (!formData.department) {
      newErrors.department = t('validation.departmentRequired')
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('validation.phoneRequired')
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = t('validation.phoneValid')
    }

    if (formData.roles.length === 0) {
      newErrors.roles = t('validation.rolesRequired')
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
      
      // Reset form if creating new user
      if (!isEdit) {
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          username: '',
          department: '',
          phone: '',
          isActive: true,
          roles: [],
        })
      }
    } catch (error) {
      toast.error(isEdit ? t('updateError') : t('createError'))
    } finally {
      setLoading(false)
    }
  }

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }))
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>{isEdit ? t('editTitle') : t('createTitle')}</span>
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('personalInformation')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('fields.firstName')} *</Label>
                <Input
                  id="firstName"
                  placeholder={t('placeholders.firstName')}
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={loading}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t('fields.lastName')} *</Label>
                <Input
                  id="lastName"
                  placeholder={t('placeholders.lastName')}
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={loading}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('accountInformation')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('placeholders.email')}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={loading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t('fields.username')} *</Label>
                <Input
                  id="username"
                  placeholder={t('placeholders.username')}
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={loading}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('contactInformation')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('fields.phone')} *</Label>
                <Input
                  id="phone"
                  placeholder={t('placeholders.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={loading}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">{t('fields.department')} *</Label>
                <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={departmentOpen}
                      className={`w-full justify-between ${errors.department ? "border-red-500" : ""}`}
                      disabled={loading}
                    >
                      {formData.department || t('placeholders.department')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder={t('placeholders.searchDepartment') || "Departman ara..."} 
                        className="h-9"
                      />
                      <CommandEmpty>Departman bulunamadı.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {activeDepartments.map((dept) => (
                          <CommandItem
                            key={dept.id}
                            value={dept.name}
                            onSelect={(value: string) => {
                              setFormData(prev => ({ ...prev, department: value === formData.department ? "" : value }))
                              setDepartmentOpen(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.department === dept.name ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <Building className="mr-2 h-4 w-4 text-gray-500" />
                            {dept.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.department && (
                  <p className="text-sm text-red-500">{errors.department}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Role Assignment */}
          <div className="space-y-4" data-role-section>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t('roles.title')}</h3>
              <Badge variant="outline">
                {formData.roles.length} {t('roles.selected')}
              </Badge>
            </div>

            {errors.roles && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.roles}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_ROLES.map(role => {
                const isSelected = formData.roles.includes(role.id)
                
                return (
                  <label
                    key={role.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                      disabled={loading}
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={getRoleBadgeColor(role.name)}>
                            {role.name}
                          </Badge>
                          <span className="font-medium">{role.displayName}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Account Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('accountStatus.title')}</h3>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <span className="font-medium">{t('accountStatus.active')}</span>
                  <p className="text-sm text-gray-500">{t('accountStatus.description')}</p>
                </div>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                disabled={loading}
              />
            </div>
          </div>

          {/* User Preview */}
          {(formData.firstName || formData.lastName || formData.email) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('preview.title')}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg font-medium">
                        {getInitials(formData.firstName || 'U', formData.lastName || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {formData.firstName} {formData.lastName}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {formData.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{formData.email}</span>
                          </div>
                        )}
                        {formData.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{formData.phone}</span>
                          </div>
                        )}
                        {formData.department && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{formData.department}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {formData.roles.map(roleId => {
                          const role = AVAILABLE_ROLES.find(r => r.id === roleId)
                          return role ? (
                            <Badge key={roleId} variant="secondary" className={`text-xs ${getRoleBadgeColor(role.name)}`}>
                              {role.displayName}
                            </Badge>
                          ) : null
                        })}
                        <Badge variant={formData.isActive ? 'default' : 'secondary'} className="text-xs">
                          {formData.isActive ? t('preview.active') : t('preview.inactive')}
                        </Badge>
                      </div>
                    </div>
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