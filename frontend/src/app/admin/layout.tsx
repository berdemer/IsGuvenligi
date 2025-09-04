'use client'

import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, checkAuth, isLoading } = useAuth()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isInitializing && !isAuthenticated && !isLoading) {
      // Redirect to login page if not authenticated
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [isAuthenticated, isLoading, isInitializing, router])

  // Show loading spinner while checking authentication
  if (isInitializing || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Kimlik doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <Header />
          
          {/* Page Content */}
          <main className="flex-1 p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}