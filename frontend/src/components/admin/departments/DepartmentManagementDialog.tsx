"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building, Save, AlertTriangle, Mail, Users } from "lucide-react"
import { useDepartmentsStore, type Department } from '@/stores/departmentsStore'
import toast from "react-hot-toast"

interface DepartmentDialogData {
  id?: string;
  name: string;
  description: string;
  managerEmail?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface DepartmentManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: DepartmentDialogData
}

export function DepartmentManagementDialog({ open, onOpenChange, department }: DepartmentManagementDialogProps) {
  const t = useTranslations('departments.dialog')
  const { addDepartment, updateDepartment } = useDepartmentsStore()
  const [formData, setFormData] = useState<DepartmentDialogData>({
    name: department?.name || '',
    description: department?.description || '',
    managerEmail: department?.managerEmail || '',
    isActive: department?.isActive ?? true,
    ...department
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const isEdit = !!department?.id

  // Update form data when department prop changes
  useEffect(() => {
    console.log('Dialog useEffect triggered - department:', department, 'open:', open);
    if (department) {
      const newFormData = {
        name: department.name || '',
        description: department.description || '',
        managerEmail: department.managerEmail || '',
        isActive: department.isActive ?? true,
        ...department
      };
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
    } else {
      // Reset form for new department
      console.log('Resetting form for new department');
      setFormData({
        name: '',
        description: '',
        managerEmail: '',
        isActive: true,
      });
    }
    // Clear errors when department changes
    setErrors({});
  }, [department, open])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired')
    } else if (formData.name.length < 2) {
      newErrors.name = t('validation.nameMin')
    }

    if (!formData.description.trim()) {
      newErrors.description = t('validation.descriptionRequired')
    } else if (formData.description.length < 10) {
      newErrors.description = t('validation.descriptionMin')
    }

    if (formData.managerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.managerEmail)) {
      newErrors.managerEmail = t('validation.managerEmailValid')
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
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (isEdit && department?.id) {
        updateDepartment(department.id, {
          name: formData.name,
          description: formData.description,
          managerEmail: formData.managerEmail,
          isActive: formData.isActive
        })
        toast.success(t('updateSuccess'))
      } else {
        addDepartment({
          name: formData.name,
          description: formData.description,
          managerEmail: formData.managerEmail,
          isActive: formData.isActive
        })
        toast.success(t('createSuccess'))
      }
      
      onOpenChange(false)
      
      // Reset form if creating new department
      if (!isEdit) {
        setFormData({
          name: '',
          description: '',
          managerEmail: '',
          isActive: true,
        })
      }
    } catch (error) {
      toast.error(isEdit ? t('updateError') : t('createError'))
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
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
            
            <div className="grid grid-cols-1 gap-4">
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
                <Label htmlFor="description">{t('fields.description')} *</Label>
                <Textarea
                  id="description"
                  placeholder={t('placeholders.description')}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={loading}
                  className={errors.description ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerEmail">{t('fields.managerEmail')}</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  placeholder={t('placeholders.managerEmail')}
                  value={formData.managerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerEmail: e.target.value }))}
                  disabled={loading}
                  className={errors.managerEmail ? "border-red-500" : ""}
                />
                {errors.managerEmail && (
                  <p className="text-sm text-red-500">{errors.managerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('status.title')}</h3>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-600" />
                <div>
                  <span className="font-medium">{t('status.active')}</span>
                  <p className="text-sm text-gray-500">{t('status.description')}</p>
                </div>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                disabled={loading}
              />
            </div>
          </div>

          {/* Department Preview */}
          {(formData.name || formData.description) && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">{t('preview.title')}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg font-medium">
                        {getInitials(formData.name || 'Dept')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {formData.name || t('preview.defaultName')}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formData.description || t('preview.defaultDescription')}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        {formData.managerEmail && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{formData.managerEmail}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>0 {t('preview.employees')}</span>
                        </div>
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