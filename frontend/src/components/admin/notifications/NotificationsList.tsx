'use client'

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Archive,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  AlertCircle,
  Shield,
  Activity,
  Users,
  Info,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import {
  Notification,
  NotificationStatus,
  NotificationSeverity,
  NotificationSource,
  NotificationFilters,
  BulkNotificationAction
} from '@/types/notification'
import { NotificationDetail } from './NotificationDetail'
import { DateRange } from "react-day-picker"

interface NotificationsListProps {
  notifications: Notification[]
  loading: boolean
  onNotificationUpdate: (notification: Notification) => void
  onBulkAction: (action: string) => void
  highlightId?: string | null
}

const SeverityIcon = ({ severity }: { severity: NotificationSeverity }) => {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'high':
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    case 'medium':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'low':
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

const SeverityBadge = ({ severity, t }: { severity: NotificationSeverity, t: any }) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  return (
    <Badge variant="outline" className={colors[severity]}>
      <SeverityIcon severity={severity} />
      <span className="ml-1">{t(`notifications.list.severityLabels.${severity}`)}</span>
    </Badge>
  )
}

const TypeIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'security':
      return <Shield className="h-4 w-4 text-red-500" />
    case 'system':
      return <Activity className="h-4 w-4 text-blue-500" />
    case 'risk':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    case 'user_activity':
      return <Users className="h-4 w-4 text-green-500" />
  }
}

const StatusBadge = ({ status, t }: { status: NotificationStatus, t: any }) => {
  const colors = {
    unread: 'bg-orange-100 text-orange-800 border-orange-200',
    read: 'bg-green-100 text-green-800 border-green-200',
    archived: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  
  return (
    <Badge variant="outline" className={colors[status]}>
      {status === 'unread' && '●'}
      {status === 'read' && '✓'}
      {status === 'archived' && '📁'}
      <span className="ml-1">{t(`notifications.list.statusLabels.${status}`)}</span>
    </Badge>
  )
}

const formatTimeAgo = (timestamp: string, t: any): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return t('notifications.list.justNow')
  if (diffMins < 60) return t('notifications.list.minutesAgo', { minutes: diffMins })
  if (diffHours < 24) return t('notifications.list.hoursAgo', { hours: diffHours })
  if (diffDays < 7) return t('notifications.list.daysAgo', { days: diffDays })
  return time.toLocaleDateString()
}

export const NotificationsList = ({ 
  notifications, 
  loading, 
  onNotificationUpdate, 
  onBulkAction 
}: NotificationsListProps) => {
  const t = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<NotificationSeverity | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<NotificationSource | 'all'>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [sortBy, setSortBy] = useState<'createdAt' | 'severity' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedNotificationForDetail, setSelectedNotificationForDetail] = useState<Notification | null>(null)
  const [showNotificationDetail, setShowNotificationDetail] = useState(false)

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = !searchTerm || 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.source.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || notification.status === statusFilter
      const matchesSeverity = severityFilter === 'all' || notification.severity === severityFilter
      const matchesSource = sourceFilter === 'all' || notification.source === sourceFilter
      
      const matchesDateRange = !dateRange?.from || !dateRange?.to || 
        (new Date(notification.createdAt) >= dateRange.from && new Date(notification.createdAt) <= dateRange.to)
      
      return matchesSearch && matchesStatus && matchesSeverity && matchesSource && matchesDateRange
    })
  }, [notifications, searchTerm, statusFilter, severityFilter, sourceFilter, dateRange])

  // Sort notifications
  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          comparison = severityOrder[a.severity] - severityOrder[b.severity]
          break
        case 'status':
          const statusOrder = { unread: 1, read: 2, archived: 3 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
  }, [filteredNotifications, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedNotifications.length / pageSize)
  const paginatedNotifications = sortedNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(paginatedNotifications.map(n => n.id))
    } else {
      setSelectedNotifications([])
    }
  }

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId])
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId))
    }
  }

  const handleNotificationAction = (notification: Notification, action: 'read' | 'archive' | 'delete') => {
    let updatedNotification = { ...notification }
    
    switch (action) {
      case 'read':
        updatedNotification = {
          ...notification,
          status: 'read',
          readAt: new Date().toISOString()
        }
        break
      case 'archive':
        updatedNotification = {
          ...notification,
          status: 'archived',
          archivedAt: new Date().toISOString()
        }
        break
      case 'delete':
        // In real implementation, this would delete from backend
        return
    }
    
    onNotificationUpdate(updatedNotification)
  }

  const handleBulkAction = (action: 'mark_read' | 'archive' | 'delete') => {
    if (selectedNotifications.length === 0) return
    
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id)
      if (notification) {
        switch (action) {
          case 'mark_read':
            handleNotificationAction(notification, 'read')
            break
          case 'archive':
            handleNotificationAction(notification, 'archive')
            break
          case 'delete':
            handleNotificationAction(notification, 'delete')
            break
        }
      }
    })
    
    setSelectedNotifications([])
    onBulkAction(action)
  }

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotificationForDetail(notification)
    setShowNotificationDetail(true)
  }

  const handleNotificationDetailAction = (action: 'read' | 'archive' | 'delete' | 'follow-up') => {
    if (!selectedNotificationForDetail) return
    
    if (action === 'follow-up') {
      // Handle follow-up action based on notification type
      return
    }
    
    handleNotificationAction(selectedNotificationForDetail, action as 'read' | 'archive' | 'delete')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSeverityFilter('all')
    setSourceFilter('all')
    setDateRange(undefined)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('notifications.list.filtersAndSearch')}
            </span>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t('notifications.list.clearAll')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('notifications.list.search')}</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('notifications.list.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('notifications.list.status')}</label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications.list.allStatus')}</SelectItem>
                  <SelectItem value="unread">{t('notifications.list.statusLabels.unread')}</SelectItem>
                  <SelectItem value="read">{t('notifications.list.statusLabels.read')}</SelectItem>
                  <SelectItem value="archived">{t('notifications.list.statusLabels.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('notifications.list.severity')}</label>
              <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications.list.allSeverity')}</SelectItem>
                  <SelectItem value="critical">{t('notifications.list.severityLabels.critical')}</SelectItem>
                  <SelectItem value="high">{t('notifications.list.severityLabels.high')}</SelectItem>
                  <SelectItem value="medium">{t('notifications.list.severityLabels.medium')}</SelectItem>
                  <SelectItem value="low">{t('notifications.list.severityLabels.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('notifications.list.source')}</label>
              <Select value={sourceFilter} onValueChange={(value: any) => setSourceFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications.list.allSources')}</SelectItem>
                  <SelectItem value="auth">{t('notifications.list.sources.auth')}</SelectItem>
                  <SelectItem value="access_policies">{t('notifications.list.sources.access_policies')}</SelectItem>
                  <SelectItem value="health">{t('notifications.list.sources.health')}</SelectItem>
                  <SelectItem value="keycloak">{t('notifications.list.sources.keycloak')}</SelectItem>
                  <SelectItem value="system">{t('notifications.list.sources.system')}</SelectItem>
                  <SelectItem value="user_management">{t('notifications.list.sources.user_management')}</SelectItem>
                  <SelectItem value="risk_assessment">{t('notifications.list.sources.risk_assessment')}</SelectItem>
                  <SelectItem value="incidents">{t('notifications.list.sources.incidents')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('notifications.list.dateRange')}</label>
              <DatePickerWithRange
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredNotifications.length !== notifications.length 
                ? t('notifications.list.showingWithTotal', {
                    showing: paginatedNotifications.length,
                    filtered: filteredNotifications.length,
                    total: notifications.length
                  })
                : t('notifications.list.showingOf', {
                    showing: paginatedNotifications.length,
                    total: filteredNotifications.length
                  })
              }
            </span>
            <div className="flex items-center gap-2">
              <label className="text-sm">{t('notifications.list.sortBy')}</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">{t('notifications.list.date')}</SelectItem>
                  <SelectItem value="severity">{t('notifications.list.severity')}</SelectItem>
                  <SelectItem value="status">{t('notifications.list.status')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('notifications.list.selected', { count: selectedNotifications.length })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('mark_read')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {t('notifications.list.markRead')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  {t('notifications.list.archive')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t('notifications.list.delete')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNotifications([])}
                >
                  {t('notifications.list.clearSelection')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedNotifications.length === paginatedNotifications.length && paginatedNotifications.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('notifications.list.type')}</TableHead>
                <TableHead>{t('notifications.list.titleAndDescription')}</TableHead>
                <TableHead>{t('notifications.list.source')}</TableHead>
                <TableHead>{t('notifications.list.severity')}</TableHead>
                <TableHead>{t('notifications.list.status')}</TableHead>
                <TableHead>{t('notifications.list.time')}</TableHead>
                <TableHead className="w-[50px]">{t('notifications.list.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNotifications.map((notification) => (
                <TableRow 
                  key={notification.id} 
                  className={`hover:bg-gray-50 ${notification.status === 'unread' ? 'bg-blue-50' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={(checked) => 
                        handleSelectNotification(notification.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TypeIcon type={notification.type} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-md">
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {notification.description}
                      </div>
                      {notification.relatedEntity && (
                        <Badge variant="secondary" className="text-xs">
                          {notification.relatedEntity.type}: {notification.relatedEntity.name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {notification.source.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={notification.severity} t={t} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={notification.status} t={t} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    <div>{formatTimeAgo(notification.createdAt, t)}</div>
                    {notification.readAt && (
                      <div className="text-xs">{t('notifications.list.read')} {formatTimeAgo(notification.readAt, t)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('notifications.list.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(notification)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('notifications.list.viewDetails')}
                        </DropdownMenuItem>
                        {notification.status === 'unread' && (
                          <DropdownMenuItem onClick={() => handleNotificationAction(notification, 'read')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t('notifications.list.markAsRead')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleNotificationAction(notification, 'archive')}>
                          <Archive className="h-4 w-4 mr-2" />
                          {t('notifications.list.archive')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleNotificationAction(notification, 'delete')}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('notifications.list.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {paginatedNotifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p>{t('notifications.list.noNotificationsFound')}</p>
              <p className="text-sm">{t('notifications.list.tryAdjustingFilters')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t('notifications.list.showingEntries', {
              from: ((currentPage - 1) * pageSize) + 1,
              to: Math.min(currentPage * pageSize, filteredNotifications.length),
              total: filteredNotifications.length
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {t('notifications.list.previous')}
            </Button>
            <span className="text-sm">
              {t('notifications.list.pageOf', { current: currentPage, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {t('notifications.list.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Notification Detail Drawer */}
      <NotificationDetail
        notification={selectedNotificationForDetail}
        open={showNotificationDetail}
        onClose={() => {
          setShowNotificationDetail(false)
          setSelectedNotificationForDetail(null)
        }}
        onAction={handleNotificationDetailAction}
      />
    </div>
  )
}