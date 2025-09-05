'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  Settings,
  Bell,
  Activity,
  FileText,
  ChevronDown,
  ChevronRight,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useState } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')

  // Navigation items with hierarchical structure
  const navigation = [
    {
      title: t('dashboard'),
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      badge: null,
    },
    {
      title: t('userMgmt'),
      icon: Users,
      items: [
        { title: t('users'), href: '/admin/users' },
        { title: t('roles'), href: '/admin/roles' },
        { title: t('departments'), href: '/admin/departments' },
      ],
    },
    {
      title: t('auth'),
      icon: KeyRound,
      items: [
        { title: t('oauthProviders'), href: '/admin/oauth-providers' },
        { title: t('authPolicies'), href: '/admin/auth/policy' },
        { title: t('activeSessions'), href: '/admin/auth/sessions' },
      ],
    },
    {
      title: t('accessPolicies'),
      icon: Shield,
      href: '/admin/policies',
    },
    {
      title: t('auditLogs'),
      icon: FileText,
      href: '/admin/audit',
      badge: tCommon('new'),
    },
    {
      title: t('notifications'),
      icon: Bell,
      href: '/admin/notifications',
      badge: '3',
    },
    {
      title: t('health'),
      icon: Activity,
      href: '/admin/health',
    },
    {
      title: t('settings'),
      icon: Settings,
      href: '/admin/settings',
    },
  ]

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <SidebarPrimitive side="left" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">İş Güvenliği</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {/* Quick actions */}
          <div className="px-4 py-2">
            <Button asChild size="sm" className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                {t('home')}
              </Link>
            </Button>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    // Expandable menu item
                    <div>
                      <SidebarMenuButton
                        onClick={() => toggleExpanded(item.title)}
                        className={cn(
                          'w-full justify-between',
                          expandedItems.includes(item.title) && 'bg-accent'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        {expandedItems.includes(item.title) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </SidebarMenuButton>
                      
                      {expandedItems.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.items.map((subItem) => (
                            <SidebarMenuButton
                              key={subItem.href}
                              asChild
                              size="sm"
                              isActive={pathname === subItem.href}
                            >
                              <Link href={subItem.href}>
                                {subItem.title}
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular menu item
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href || '#'}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </SidebarPrimitive>
  )
}