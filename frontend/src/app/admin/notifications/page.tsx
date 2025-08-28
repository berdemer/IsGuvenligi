'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell, BellRing, Shield, AlertTriangle, Activity, 
  Users, Download, Check, Settings, RefreshCw,
  TrendingUp, TrendingDown, Clock, Filter
} from "lucide-react"
import { 
  Notification,
  NotificationType,
  NotificationSummaryResponse,
  NotificationAnalytics
} from "@/types/notification"
import { NotificationsList } from "@/components/admin/notifications/NotificationsList"
import NotificationSettings from "@/components/admin/notifications/NotificationSettings"
import toast from "react-hot-toast"

export default function NotificationsPage() {
  const t = useTranslations('notifications')
  const searchParams = useSearchParams()
  const highlightId = searchParams?.get('highlight')
  const tabParam = searchParams?.get('tab')
  
  const [activeTab, setActiveTab] = useState<'all' | NotificationType | 'settings'>(
    (tabParam as any) || 'all'
  )
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [summary, setSummary] = useState<NotificationSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock data generator
  const generateMockSummary = useCallback((): NotificationSummaryResponse => {
    return {
      totalNotifications: 1247,
      unreadNotifications: 89,
      securityAlerts: 23,
      systemHealthWarnings: 12,
      recentNotifications: [
        {
          id: 'notif-1',
          type: 'security',
          title: 'Multiple Login Failures Detected',
          description: 'User john.doe@company.com has 5 failed login attempts from IP 192.168.1.100',
          source: 'auth',
          severity: 'high',
          status: 'unread',
          relatedEntity: {
            type: 'user',
            id: 'user-123',
            name: 'John Doe',
            metadata: { email: 'john.doe@company.com', ipAddress: '192.168.1.100' }
          },
          userId: 'user-123',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          metadata: {
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            riskScore: 85,
            actionRequired: true
          }
        },
        {
          id: 'notif-2',
          type: 'system',
          title: 'Database Connection Pool Warning',
          description: 'PostgreSQL connection pool is at 85% capacity',
          source: 'system',
          severity: 'medium',
          status: 'unread',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          metadata: {
            systemComponent: 'database',
            autoResolvable: false
          }
        },
        {
          id: 'notif-3',
          type: 'risk',
          title: 'High Risk Score Alert',
          description: 'Employee Sarah Johnson exceeded risk threshold with score 78/100',
          source: 'risk_assessment',
          severity: 'high',
          status: 'read',
          relatedEntity: {
            type: 'user',
            id: 'user-456',
            name: 'Sarah Johnson'
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          readAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          metadata: {
            riskScore: 78,
            actionRequired: true
          }
        },
        {
          id: 'notif-4',
          type: 'user_activity',
          title: 'New Admin User Created',
          description: 'User Mike Chen has been granted administrator privileges',
          source: 'user_management',
          severity: 'medium',
          status: 'unread',
          relatedEntity: {
            type: 'user',
            id: 'user-789',
            name: 'Mike Chen'
          },
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          metadata: {
            actionRequired: false
          }
        },
        {
          id: 'notif-5',
          type: 'system',
          title: 'Keycloak Integration Healthy',
          description: 'Connection to Keycloak server restored successfully',
          source: 'keycloak',
          severity: 'low',
          status: 'read',
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          readAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
          metadata: {
            systemComponent: 'keycloak',
            autoResolvable: true
          }
        }
      ],
      trends: {
        notifications: { change: 12.5, trend: 'up' },
        security: { change: -8.3, trend: 'down' },
        system: { change: 15.7, trend: 'up' },
        unreadRate: { change: -5.2, trend: 'down' }
      }
    }
  }, [])

  const generateMockNotifications = useCallback((): Notification[] => {
    const baseNotifications = [
      // Security notifications
      {
        id: 'sec-1',
        type: 'security' as NotificationType,
        title: 'Suspicious Login Activity',
        description: 'Login attempt from unusual location: Tokyo, Japan',
        source: 'auth' as const,
        severity: 'high' as const,
        status: 'unread' as const,
        userId: 'user-001',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        relatedEntity: { type: 'user' as const, id: 'user-001', name: 'Alice Smith' },
        metadata: { ipAddress: '203.0.113.1', location: 'Tokyo, Japan', riskScore: 92 }
      },
      {
        id: 'sec-2',
        type: 'security' as NotificationType,
        title: 'MFA Bypass Attempt',
        description: 'User attempted to bypass multi-factor authentication',
        source: 'auth' as const,
        severity: 'critical' as const,
        status: 'unread' as const,
        userId: 'user-002',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        relatedEntity: { type: 'user' as const, id: 'user-002', name: 'Bob Wilson' },
        metadata: { actionRequired: true, autoResolvable: false }
      },
      {
        id: 'sec-3',
        type: 'security' as NotificationType,
        title: 'Session Revoked',
        description: 'User session terminated due to policy violation',
        source: 'access_policies' as const,
        severity: 'medium' as const,
        status: 'read' as const,
        userId: 'user-003',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        relatedEntity: { type: 'session' as const, id: 'sess-123', name: 'Session #123' }
      },

      // System notifications
      {
        id: 'sys-1',
        type: 'system' as NotificationType,
        title: 'High API Latency Detected',
        description: 'Authentication API response time increased to 2.3 seconds',
        source: 'system' as const,
        severity: 'medium' as const,
        status: 'unread' as const,
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        metadata: { systemComponent: 'auth-api', responseTime: 2300 }
      },
      {
        id: 'sys-2',
        type: 'system' as NotificationType,
        title: 'Database Backup Completed',
        description: 'Scheduled PostgreSQL backup completed successfully',
        source: 'system' as const,
        severity: 'low' as const,
        status: 'read' as const,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        metadata: { systemComponent: 'database', autoResolvable: true }
      },

      // Risk & Safety notifications
      {
        id: 'risk-1',
        type: 'risk' as NotificationType,
        title: 'Safety Incident Reported',
        description: 'New workplace incident reported in Manufacturing Area B',
        source: 'incidents' as const,
        severity: 'high' as const,
        status: 'unread' as const,
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        relatedEntity: { type: 'incident' as const, id: 'inc-456', name: 'Incident #456' },
        metadata: { affectedUsers: 3, actionRequired: true, riskScore: 75 }
      },
      {
        id: 'risk-2',
        type: 'risk' as NotificationType,
        title: 'Risk Threshold Exceeded',
        description: 'Department safety score dropped below acceptable threshold',
        source: 'risk_assessment' as const,
        severity: 'medium' as const,
        status: 'read' as const,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        metadata: { riskScore: 68, affectedUsers: 25 }
      },

      // User Activity notifications
      {
        id: 'user-1',
        type: 'user_activity' as NotificationType,
        title: 'Role Assignment Changed',
        description: 'User Emma Davis promoted to Safety Manager role',
        source: 'user_management' as const,
        severity: 'low' as const,
        status: 'unread' as const,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        relatedEntity: { type: 'user' as const, id: 'user-004', name: 'Emma Davis' },
        metadata: { actionRequired: false }
      },
      {
        id: 'user-2',
        type: 'user_activity' as NotificationType,
        title: 'Password Reset Completed',
        description: 'User David Brown successfully reset their password',
        source: 'auth' as const,
        severity: 'low' as const,
        status: 'read' as const,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        relatedEntity: { type: 'user' as const, id: 'user-005', name: 'David Brown' }
      }
    ]

    // Generate additional mock notifications to simulate large dataset
    const additionalNotifications = Array.from({ length: 100 }, (_, i) => ({
      id: `mock-${i}`,
      type: (['security', 'system', 'risk', 'user_activity'] as const)[i % 4],
      title: `Mock Notification ${i + 1}`,
      description: `This is a mock notification for testing purposes #${i + 1}`,
      source: (['auth', 'system', 'risk_assessment', 'user_management'] as const)[i % 4],
      severity: (['low', 'medium', 'high', 'critical'] as const)[i % 4],
      status: (i % 3 === 0 ? 'unread' : i % 3 === 1 ? 'read' : 'archived') as const,
      createdAt: new Date(Date.now() - (i + 1) * 30 * 60 * 1000).toISOString(),
      ...(i % 3 !== 0 && { readAt: new Date(Date.now() - (i + 1) * 15 * 60 * 1000).toISOString() }),
      ...(i % 3 === 2 && { archivedAt: new Date(Date.now() - (i + 1) * 10 * 60 * 1000).toISOString() })
    }))

    return [...baseNotifications, ...additionalNotifications]
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      // Mock API calls
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockSummary = generateMockSummary()
      const mockNotifications = generateMockNotifications()
      
      setSummary(mockSummary)
      setNotifications(mockNotifications)
      setLastUpdated(new Date())
    } catch (error) {
      toast.error(t('failedToLoad'))
    } finally {
      setLoading(false)
    }
  }, [generateMockSummary, generateMockNotifications])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMarkAllAsRead = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.status === 'unread' 
            ? { ...notif, status: 'read' as const, readAt: new Date().toISOString() }
            : notif
        )
      )
      
      setSummary(prev => prev ? { ...prev, unreadNotifications: 0 } : null)
      toast.success(t('allMarkedAsRead'))
    } catch (error) {
      toast.error(t('failedToMarkAsRead'))
    }
  }

  const handleExport = () => {
    toast.success(t('exportWouldStart'))
    // TODO: Export functionality
  }

  const getTabCount = (type: NotificationType) => {
    return notifications.filter(n => n.type === type).length
  }

  const getUnreadCount = (type?: NotificationType) => {
    return notifications.filter(n => 
      n.status === 'unread' && (type ? n.type === type : true)
    ).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>{t('loading')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
          <Button onClick={handleMarkAllAsRead} disabled={!summary?.unreadNotifications}>
            <Check className="h-4 w-4 mr-2" />
            {t('markAllRead')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalNotifications')}</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalNotifications || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {summary?.trends.notifications.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {summary?.trends.notifications.change > 0 ? '+' : ''}{summary?.trends.notifications.change}% {t('fromLastWeek')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('unread')}</CardTitle>
            <BellRing className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary?.unreadNotifications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && Math.round((summary.unreadNotifications / summary.totalNotifications) * 100)}% {t('unreadRate')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('securityAlerts')}</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary?.securityAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {summary?.trends.security.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              {summary?.trends.security.change > 0 ? '+' : ''}{summary?.trends.security.change}% {t('thisWeek')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('systemHealth')}</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.systemHealthWarnings || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {summary?.trends.system.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              {summary?.trends.system.change > 0 ? '+' : ''}{summary?.trends.system.change}% {t('thisWeek')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Alert */}
      {summary && summary.securityAlerts > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{summary.securityAlerts} {t('securityAlerts').toLowerCase()}</strong> {t('requireImmediateAttention')}. 
            {t('reviewSecurityTab')}.
          </AlertDescription>
        </Alert>
      )}

      {/* Last Updated Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>{t('lastUpdated')}: {lastUpdated.toLocaleString('en-US', { timeZone: 'UTC' })}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>{t('all')}</span>
            {getUnreadCount() > 0 && (
              <Badge variant="destructive">{getUnreadCount()}</Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>{t('security')}</span>
            <Badge variant="outline">{getTabCount('security')}</Badge>
            {getUnreadCount('security') > 0 && (
              <Badge variant="destructive" className="ml-1">{getUnreadCount('security')}</Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>{t('system')}</span>
            <Badge variant="outline">{getTabCount('system')}</Badge>
            {getUnreadCount('system') > 0 && (
              <Badge variant="destructive" className="ml-1">{getUnreadCount('system')}</Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="risk" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{t('riskAndSafety')}</span>
            <Badge variant="outline">{getTabCount('risk')}</Badge>
            {getUnreadCount('risk') > 0 && (
              <Badge variant="destructive" className="ml-1">{getUnreadCount('risk')}</Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="user_activity" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{t('userActivity')}</span>
            <Badge variant="outline">{getTabCount('user_activity')}</Badge>
            {getUnreadCount('user_activity') > 0 && (
              <Badge variant="destructive" className="ml-1">{getUnreadCount('user_activity')}</Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>{t('settings')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <NotificationsList 
            notifications={notifications}
            loading={loading}
            onNotificationUpdate={(notification) => {
              setNotifications(prev => 
                prev.map(n => n.id === notification.id ? notification : n)
              )
            }}
            onBulkAction={(action) => {
              toast.success(`Bulk ${action} ${t('bulkActionCompleted')}`)
              loadData() // Refresh data after bulk action
            }}
          />
        </TabsContent>

        <TabsContent value="security">
          <NotificationsList 
            notifications={notifications.filter(n => n.type === 'security')}
            loading={loading}
            onNotificationUpdate={(notification) => {
              setNotifications(prev => 
                prev.map(n => n.id === notification.id ? notification : n)
              )
            }}
            onBulkAction={(action) => {
              toast.success(`Bulk ${action} ${t('bulkActionCompleted')}`)
              loadData()
            }}
          />
        </TabsContent>

        <TabsContent value="system">
          <NotificationsList 
            notifications={notifications.filter(n => n.type === 'system')}
            loading={loading}
            onNotificationUpdate={(notification) => {
              setNotifications(prev => 
                prev.map(n => n.id === notification.id ? notification : n)
              )
            }}
            onBulkAction={(action) => {
              toast.success(`Bulk ${action} ${t('bulkActionCompleted')}`)
              loadData()
            }}
          />
        </TabsContent>

        <TabsContent value="risk">
          <NotificationsList 
            notifications={notifications.filter(n => n.type === 'risk')}
            loading={loading}
            onNotificationUpdate={(notification) => {
              setNotifications(prev => 
                prev.map(n => n.id === notification.id ? notification : n)
              )
            }}
            onBulkAction={(action) => {
              toast.success(`Bulk ${action} ${t('bulkActionCompleted')}`)
              loadData()
            }}
          />
        </TabsContent>

        <TabsContent value="user_activity">
          <NotificationsList 
            notifications={notifications.filter(n => n.type === 'user_activity')}
            loading={loading}
            onNotificationUpdate={(notification) => {
              setNotifications(prev => 
                prev.map(n => n.id === notification.id ? notification : n)
              )
            }}
            onBulkAction={(action) => {
              toast.success(`Bulk ${action} ${t('bulkActionCompleted')}`)
              loadData()
            }}
          />
        </TabsContent>

        <TabsContent value="settings">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}