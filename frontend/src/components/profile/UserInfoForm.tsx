"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

interface ProfileData {
  firstName: string
  lastName: string
  username: string
  department: string
  phone: string
  email: string
  [key: string]: any
}

interface UserInfoFormProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
}

interface FormErrors {
  firstName?: string
  lastName?: string
  username?: string
  department?: string
  phone?: string
}

const departments = [
  "IT Security",
  "Information Technology",
  "Human Resources",
  "Finance",
  "Operations",
  "Legal",
  "Marketing",
  "Sales"
]

export function UserInfoForm({ profileData, onUpdate }: UserInfoFormProps) {
  const t = useTranslations('profile')
  const [formData, setFormData] = useState(profileData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setFormData(profileData)
  }, [profileData])

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return t('validation.firstNameRequired')
        if (value.length < 2) return t('validation.firstNameMin')
        if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value)) return t('validation.firstNameLetters')
        return undefined
      
      case 'lastName':
        if (!value.trim()) return t('validation.lastNameRequired')
        if (value.length < 2) return t('validation.lastNameMin')
        if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value)) return t('validation.lastNameLetters')
        return undefined
      
      case 'username':
        if (!value.trim()) return t('validation.usernameRequired')
        if (value.length < 3) return t('validation.usernameMin')
        if (!/^[a-zA-Z0-9._-]+$/.test(value)) return t('validation.usernameFormat')
        return undefined
      
      case 'department':
        if (!value.trim()) return t('validation.departmentRequired')
        return undefined
      
      case 'phone':
        if (!value.trim()) return t('validation.phoneRequired')
        if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) return t('validation.phoneValid')
        return undefined
      
      default:
        return undefined
    }
  }

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleBlur = (name: string, value: string) => {
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSave = async () => {
    const newErrors: FormErrors = {}
    let hasErrors = false

    Object.keys(formData).forEach(key => {
      if (['firstName', 'lastName', 'username', 'department', 'phone'].includes(key)) {
        const error = validateField(key, formData[key])
        if (error) {
          newErrors[key as keyof FormErrors] = error
          hasErrors = true
        }
      }
    })

    setErrors(newErrors)

    if (hasErrors) {
      toast.error(t('validation.fixErrors'))
      return
    }

    setSaving(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onUpdate(formData)
      toast.success(t('userInfo.updateSuccess'))
    } catch (error) {
      toast.error(t('userInfo.updateError'))
    } finally {
      setSaving(false)
    }
  }

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(profileData)
  const hasValidationErrors = Object.values(errors).some(error => error)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('userInfo.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 mt-6" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('userInfo.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              {t('userInfo.firstName')} <span className="text-red-500">{t('userInfo.required')}</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              onBlur={(e) => handleBlur('firstName', e.target.value)}
              className={errors.firstName ? 'border-red-500' : ''}
              placeholder={t('userInfo.firstNamePlaceholder')}
            />
            {errors.firstName && (
              <div className="flex items-center space-x-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.firstName}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              {t('userInfo.lastName')} <span className="text-red-500">{t('userInfo.required')}</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              onBlur={(e) => handleBlur('lastName', e.target.value)}
              className={errors.lastName ? 'border-red-500' : ''}
              placeholder={t('userInfo.lastNamePlaceholder')}
            />
            {errors.lastName && (
              <div className="flex items-center space-x-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.lastName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">
            {t('userInfo.username')} <span className="text-red-500">{t('userInfo.required')}</span>
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleFieldChange('username', e.target.value)}
            onBlur={(e) => handleBlur('username', e.target.value)}
            className={errors.username ? 'border-red-500' : ''}
            placeholder={t('userInfo.usernamePlaceholder')}
          />
          {errors.username && (
            <div className="flex items-center space-x-1 text-sm text-red-500">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.username}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">
            {t('userInfo.department')} <span className="text-red-500">{t('userInfo.required')}</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleFieldChange('department', value)}
          >
            <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
              <SelectValue placeholder={t('userInfo.departmentPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {t(`userInfo.departments.${dept}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && (
            <div className="flex items-center space-x-1 text-sm text-red-500">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.department}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            {t('phone')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            onBlur={(e) => handleBlur('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
            placeholder="+90 555 123 4567"
          />
          {errors.phone && (
            <div className="flex items-center space-x-1 text-sm text-red-500">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('userInfo.email')}</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            {t('userInfo.emailChangeNotice')}
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={!isFormDirty || hasValidationErrors || saving}
            className="min-w-[120px]"
          >
            {saving ? t('common.loading') : t('common.saveChanges')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}