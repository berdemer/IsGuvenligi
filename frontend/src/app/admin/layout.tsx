'use client'

import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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