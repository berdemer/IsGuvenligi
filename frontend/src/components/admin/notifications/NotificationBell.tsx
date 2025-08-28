'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bell,
  BellRing,
  Check,
  Eye,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  Settings
} from 'lucide-react'
import {
  Notification,
  NotificationSummaryResponse,
  NotificationSeverity
} from '@/types/notification'
import { useRouter } from 'next/navigation'
import toast from "react-hot-toast"

const SeverityIcon = ({ severity }: { severity: NotificationSeverity }) => {
  const colors = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-blue-500'
  }
  
  return <div className={`w-2 h-2 rounded-full bg-current ${colors[severity]}`} />
}

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return time.toLocaleDateString('en-US', { timeZone: 'UTC' })
}

// Mock data generator for notification bell
const generateMockSummary = (): NotificationSummaryResponse => ({
  totalNotifications: 47,
  unreadNotifications: 8,
  securityAlerts: 3,
  systemHealthWarnings: 2,
  recentNotifications: [
    {
      id: 'bell-1',
      type: 'security',
      title: 'Multiple Login Failures',
      description: 'User john.doe@company.com has 5 failed login attempts',
      source: 'auth',
      severity: 'high',
      status: 'unread',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      relatedEntity: { type: 'user' as const, id: 'user-123', name: 'John Doe' },
      metadata: { actionRequired: true }
    },
    {
      id: 'bell-2',
      type: 'system',
      title: 'Database Connection Warning',
      description: 'PostgreSQL connection pool at 85% capacity',
      source: 'system',
      severity: 'medium',
      status: 'unread',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      metadata: { systemComponent: 'database' }
    },
    {
      id: 'bell-3',
      type: 'risk',
      title: 'Safety Incident Reported',
      description: 'New incident in Manufacturing Area B',
      source: 'incidents',
      severity: 'high',
      status: 'unread',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      relatedEntity: { type: 'incident' as const, id: 'inc-456', name: 'Incident #456' },
      metadata: { actionRequired: true }
    },
    {
      id: 'bell-4',
      type: 'user_activity',
      title: 'New Admin User Created',
      description: 'User Mike Chen granted admin privileges',
      source: 'user_management',
      severity: 'medium',
      status: 'read',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      relatedEntity: { type: 'user' as const, id: 'user-789', name: 'Mike Chen' }
    },
    {
      id: 'bell-5',
      type: 'system',
      title: 'Backup Completed',
      description: 'Daily database backup completed successfully',
      source: 'system',
      severity: 'low',
      status: 'read',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      metadata: { autoResolvable: true }
    }
  ],
  trends: {
    notifications: { change: 8.5, trend: 'up' },
    security: { change: -12.3, trend: 'down' },
    system: { change: 5.2, trend: 'up' },
    unreadRate: { change: -3.1, trend: 'down' }
  }
})

interface NotificationBellProps {
  className?: string
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const [summary, setSummary] = useState<NotificationSummaryResponse | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Load notification summary
  useEffect(() => {
    loadSummary()
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly simulate new notifications
      if (Math.random() < 0.1 && summary) { // 10% chance every 30 seconds
        setSummary(prev => prev ? {
          ...prev,
          unreadNotifications: prev.unreadNotifications + 1,
          totalNotifications: prev.totalNotifications + 1
        } : null)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [summary])

  const loadSummary = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setSummary(generateMockSummary())
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (!summary) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setSummary(prev => {
        if (!prev) return null
        
        return {
          ...prev,
          unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
          recentNotifications: prev.recentNotifications.map(notif =>
            notif.id === notificationId 
              ? { ...notif, status: 'read' as const, readAt: new Date().toISOString() }
              : notif
          )
        }
      })
      
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!summary) return

    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSummary(prev => {
        if (!prev) return null
        
        return {
          ...prev,
          unreadNotifications: 0,
          recentNotifications: prev.recentNotifications.map(notif =>
            notif.status === 'unread' 
              ? { ...notif, status: 'read' as const, readAt: new Date().toISOString() }
              : notif
          )
        }
      })
      
      toast.success('All notifications marked as read')
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to mark all as read')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAll = () => {
    setIsOpen(false)
    router.push('/admin/notifications')
  }

  const handleViewNotification = (notification: Notification) => {
    setIsOpen(false)
    router.push(`/admin/notifications?highlight=${notification.id}`)
  }

  const unreadCount = summary?.unreadNotifications || 0
  const hasUnread = unreadCount > 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          disabled={isLoading}
        >
          {hasUnread ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {hasUnread && (
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSummary}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          {summary && (
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{summary.totalNotifications} total</span>
              {hasUnread && (
                <span className="text-orange-600 font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {summary?.recentNotifications && summary.recentNotifications.length > 0 ? (
            <div className="divide-y">
              {summary.recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.status === 'unread' ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleViewNotification(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <SeverityIcon severity={notification.severity} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-medium line-clamp-1">
                          {notification.title}
                        </h5>
                        <div className="flex items-center gap-1">
                          {notification.status === 'unread' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification.id)
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize"
                        >
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        {notification.metadata?.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </div>

        <Separator />
        
        <div className="p-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false)
              router.push('/admin/notifications?tab=settings')
            }}
          >
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}