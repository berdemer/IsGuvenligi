"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { apiService } from '@/services/api'
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { UserInfoForm } from "@/components/profile/UserInfoForm"
import { SecurityCard } from "@/components/profile/SecurityCard"
import { ProvidersCard } from "@/components/profile/ProvidersCard"
import { PreferencesForm } from "@/components/profile/PreferencesForm"
import { ActivityTable } from "@/components/profile/ActivityTable"
import { SessionsCard } from "@/components/profile/SessionsCard"
import { DangerZone } from "@/components/profile/DangerZone"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ProfileData {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  department: string
  phone: string
  role: string
  lastLoginAt: string
  lastLoginIp: string
  lastLoginDevice: string
  mfa: {
    totp: boolean
    webauthn: boolean
  }
  providers: {
    google: boolean
    microsoft: boolean
  }
  preferences: {
    language: string
    timezone: string
    theme: string
    notifications: {
      email: boolean
      sms: boolean
      app: boolean
    }
  }
}

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { user, isAuthenticated } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get user profile from backend API
      const backendProfile = await apiService.getProfile()
      
      // Transform backend data to match ProfileData interface
      const transformedData: ProfileData = {
        id: backendProfile.id || user?.id || "unknown",
        email: backendProfile.email || user?.email || "",
        firstName: backendProfile.firstName || user?.firstName || "",
        lastName: backendProfile.lastName || user?.lastName || "",
        username: backendProfile.username || user?.username || "",
        department: backendProfile.department?.name || "Bilinmiyor",
        phone: backendProfile.phoneNumber || "Belirtilmemiş",
        role: backendProfile.roles?.[0] || user?.roles?.[0] || "user",
        lastLoginAt: backendProfile.lastLoginAt || new Date().toISOString(),
        lastLoginIp: "192.168.1.100", // Mock data for now
        lastLoginDevice: "Chrome on Windows", // Mock data for now
        mfa: {
          totp: false, // Mock data - implement when MFA is available
          webauthn: false
        },
        providers: {
          google: false, // Mock data - implement when social providers are integrated
          microsoft: false
        },
        preferences: {
          language: "tr",
          timezone: "Europe/Istanbul",
          theme: "system",
          notifications: {
            email: true,
            sms: false,
            app: true
          }
        }
      }
      
      setProfileData(transformedData)
    } catch (err: any) {
      console.error('Profile fetch error:', err)
      setError(err.message || t('common.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData()
    }
  }, [isAuthenticated])

  const handleRetry = () => {
    fetchProfileData()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="flex items-center space-x-4 mb-6">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-10 w-32" />
            </Card>
            
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
          
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-8 w-full" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('common.noDataAvailable')}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileHeader 
            profileData={profileData}
            onUpdate={setProfileData}
          />
          
          <UserInfoForm 
            profileData={profileData}
            onUpdate={setProfileData}
          />
          
          <SecurityCard 
            profileData={profileData}
            onUpdate={setProfileData}
          />
          
          <ProvidersCard 
            profileData={profileData}
            onUpdate={setProfileData}
          />
          
          <PreferencesForm 
            profileData={profileData}
            onUpdate={setProfileData}
          />
          
          <DangerZone 
            profileData={profileData}
            onUpdate={setProfileData}
          />
        </div>
        
        {/* Right Column - Activity & Sessions */}
        <div className="space-y-6">
          <ActivityTable />
          <SessionsCard />
        </div>
      </div>
    </div>
  )
}