'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ErrorBoundary from './ErrorBoundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  Users,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Database,
  Shield
} from 'lucide-react'
import { 
  HealthIncident, 
  IncidentSeverity, 
  IncidentStatus, 
  IncidentEvent,
  ServiceHealth 
} from '@/types/health'
import toast from 'react-hot-toast'

interface IncidentsTrackingProps {
  loading: boolean
  timeRange: string
}

// COMPREHENSIVE INCIDENT RESOLUTION DATA - Updated with Keycloak Research 2025-08-26
const generateMockIncidents = (t: any): HealthIncident[] => [
  {
    id: 'inc-001',
    serviceId: 'keycloak-auth',
    serviceName: 'Keycloak SSO',
    title: t('mockData.incidents.authDegradation.title'),
    description: t('mockData.incidents.authDegradation.description'),
    severity: 'high' as const,
    status: 'resolved' as const,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: 125, // minutes (resolved)
    resolvedAt: new Date().toISOString(), // Just resolved
    impact: {
      affectedServices: ['keycloak-auth', 'api-gateway'],
      userImpact: 'moderate' as const,
      estimatedUsers: 250
    },
    timeline: [
      {
        id: 'evt-001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'detected' as const,
        message: t('mockData.timeline.alertTriggered'),
        automated: true
      },
      {
        id: 'evt-002',
        timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        type: 'investigating' as const,
        message: t('mockData.timeline.investigationStarted'),
        author: { userId: 'eng-001', username: 'john.doe' },
        automated: false
      },
      {
        id: 'evt-003',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        type: 'update' as const,
        message: t('mockData.timeline.rootCauseIdentified'),
        author: { userId: 'eng-001', username: 'john.doe' },
        automated: false
      },
      {
        id: 'evt-004',
        timestamp: new Date().toISOString(),
        type: 'resolved' as const,
        message: t('mockData.timeline.serviceRestarted'),
        author: { userId: 'sys-admin', username: 'claude.ai' },
        automated: true
      }
    ],
    metrics: {
      errorSpike: 450,
      downtimeMinutes: 0,
      responseTimeIncrease: 350
    },
    rootCause: t('mockData.rootCauses.connectionPool'),
    resolution: t('mockData.resolutions.serviceRestart'),
    preventionSteps: [
      t('mockData.preventionSteps.keycloakMemory'),
      t('mockData.preventionSteps.dbConnections'),  
      t('mockData.preventionSteps.proactiveMonitoring'),
      t('mockData.preventionSteps.autoRestart'),
      t('mockData.preventionSteps.dockerOptimization')
    ]
  },
  {
    id: 'inc-002',
    serviceId: 'postgres-primary',
    serviceName: 'PostgreSQL Primary',
    title: t('mockData.incidents.backupFailure.title'),
    description: t('mockData.incidents.backupFailure.description'),
    severity: 'medium' as const,
    status: 'resolved' as const,
    startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    impact: {
      affectedServices: ['postgres-primary'],
      userImpact: 'none' as const,
      estimatedUsers: 0
    },
    resolvedBy: {
      userId: 'eng-002',
      username: 'jane.smith',
      method: 'manual' as const
    },
    timeline: [
      {
        id: 'evt-004',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        type: 'detected' as const,
        message: t('mockData.timeline.backupFailed'),
        automated: true
      },
      {
        id: 'evt-005',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        type: 'investigating' as const,
        message: t('mockData.timeline.backupInvestigation'),
        author: { userId: 'eng-002', username: 'jane.smith' },
        automated: false
      },
      {
        id: 'evt-006',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        type: 'resolved' as const,
        message: t('mockData.timeline.backupFixed'),
        author: { userId: 'eng-002', username: 'jane.smith' },
        automated: false
      }
    ],
    rootCause: t('mockData.rootCauses.logRotation'),
    resolution: t('mockData.resolutions.diskCleanup'),
    preventionSteps: [
      t('mockData.preventionSteps.diskCleanupScript'),
      t('mockData.preventionSteps.proactiveAuto'),
      t('mockData.preventionSteps.dailyCleanup'),
      t('mockData.preventionSteps.diskAlerts')
    ]
  },
  {
    id: 'inc-003',
    serviceId: 'redis-cache',
    serviceName: 'Redis Cache',
    title: t('mockData.incidents.cacheWarning.title'),
    description: t('mockData.incidents.cacheWarning.description'),
    severity: 'low' as const,
    status: 'resolved' as const,
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    impact: {
      affectedServices: ['redis-cache'],
      userImpact: 'minimal' as const,
      estimatedUsers: 50
    },
    resolvedBy: {
      userId: 'system',
      username: 'auto-resolver',
      method: 'auto' as const
    },
    timeline: [
      {
        id: 'evt-007',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        type: 'detected' as const,
        message: t('mockData.timeline.memoryThreshold'),
        automated: true
      },
      {
        id: 'evt-008',
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        type: 'resolved' as const,
        message: t('mockData.timeline.cacheCleanup'),
        automated: true
      }
    ],
    rootCause: t('mockData.rootCauses.highTraffic'),
    resolution: t('mockData.resolutions.redisOptimization'),
    preventionSteps: [
      t('mockData.preventionSteps.redisMemoryOpt'),
      t('mockData.preventionSteps.enhancedMonitoring'),
      t('mockData.preventionSteps.autoCacheCleanup'),
      t('mockData.preventionSteps.connectionPoolOpt')
    ]
  }
]

const getSeverityIcon = (severity: IncidentSeverity) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    case 'medium':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-blue-500" />
  }
}

const getSeverityBadge = (severity: IncidentSeverity, t: any) => {
  const variants = {
    critical: 'destructive',
    high: 'destructive',
    medium: 'secondary',
    low: 'outline'
  } as const

  return (
    <Badge variant={variants[severity]} className="capitalize">
      {t(`severity.${severity}`)}
    </Badge>
  )
}

const getStatusIcon = (status: IncidentStatus) => {
  switch (status) {
    case 'resolved':
    case 'closed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'investigating':
      return <Activity className="h-4 w-4 text-yellow-500" />
    default:
      return <Clock className="h-4 w-4 text-red-500" />
  }
}

const getStatusBadge = (status: IncidentStatus, t: any) => {
  const variants = {
    open: 'destructive',
    investigating: 'secondary',
    resolved: 'default',
    closed: 'outline'
  } as const

  return (
    <Badge variant={variants[status]} className="capitalize">
      {t(`status.${status}`)}
    </Badge>
  )
}

const formatDuration = (minutes: number, t: any): string => {
  if (minutes < 60) return `${Math.round(minutes)}${t('durations.minutes')}`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}${t('durations.hours')} ${mins}${t('durations.minutes')}`
}

const formatTimeAgo = (timestamp: string, t: any): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}${t('durations.minutesAgo')}`
  if (diffHours < 24) return `${diffHours}${t('durations.hoursAgo')}`
  return `${diffDays}${t('durations.daysAgo')}`
}

interface IncidentTimelineProps {
  incident: HealthIncident
}

const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ incident }) => {
  const t = useTranslations('health.incidentsTracking')
  return (
    <div className="space-y-4">
      {incident.timeline.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-full border-2 ${
              event.type === 'resolved' ? 'bg-green-50 border-green-200' :
              event.type === 'detected' ? 'bg-red-50 border-red-200' :
              event.type === 'investigating' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              {event.type === 'resolved' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : event.type === 'detected' ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : event.type === 'investigating' ? (
                <Activity className="h-4 w-4 text-yellow-600" />
              ) : (
                <MessageSquare className="h-4 w-4 text-blue-600" />
              )}
            </div>
            {index < incident.timeline.length - 1 && (
              <div className="w-0.5 h-8 bg-gray-200 mt-2" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm capitalize">
                {event.type.replace('_', ' ')}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(event.timestamp, t)}
              </span>
              {event.automated && (
                <Badge variant="outline" className="text-xs">
                  {t('timeline.auto')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {event.message}
            </p>
            {event.author && (
              <p className="text-xs text-muted-foreground">
                {t('timeline.by')} {event.author.username}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

interface CreateIncidentDialogProps {
  onClose: () => void
  onCreate: (incident: Partial<HealthIncident>) => void
}

const CreateIncidentDialog: React.FC<CreateIncidentDialogProps> = ({ onClose, onCreate }) => {
  const t = useTranslations('health.incidentsTracking')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as IncidentSeverity,
    serviceId: 'none',
    userImpact: 'minimal' as const
  })

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error(t('toast.titleRequired'))
      return
    }

    onCreate({
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      serviceId: formData.serviceId === 'none' ? undefined : formData.serviceId || undefined,
      impact: {
        affectedServices: formData.serviceId && formData.serviceId !== 'none' ? [formData.serviceId] : [],
        userImpact: formData.userImpact,
        estimatedUsers: 0
      }
    })

    onClose()
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{t('dialog.createTitle')}</DialogTitle>
        <DialogDescription>
          {t('dialog.createDescription')}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('dialog.fields.title')}</label>
          <Input
            placeholder={t('dialog.placeholders.title')}
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('dialog.fields.description')}</label>
          <Textarea
            placeholder={t('dialog.placeholders.description')}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('dialog.fields.severity')}</label>
            <Select 
              value={formData.severity} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as IncidentSeverity }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('severity.low')}</SelectItem>
                <SelectItem value="medium">{t('severity.medium')}</SelectItem>
                <SelectItem value="high">{t('severity.high')}</SelectItem>
                <SelectItem value="critical">{t('severity.critical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('dialog.fields.userImpact')}</label>
            <Select 
              value={formData.userImpact} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, userImpact: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('userImpact.none')}</SelectItem>
                <SelectItem value="minimal">{t('userImpact.minimal')}</SelectItem>
                <SelectItem value="moderate">{t('userImpact.moderate')}</SelectItem>
                <SelectItem value="severe">{t('userImpact.severe')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('dialog.fields.affectedService')}</label>
          <Select 
            value={formData.serviceId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('dialog.placeholders.selectService')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('services.none')}</SelectItem>
              <SelectItem value="api-gateway">{t('services.apiGateway')}</SelectItem>
              <SelectItem value="postgres-primary">{t('services.postgresqlPrimary')}</SelectItem>
              <SelectItem value="redis-cache">{t('services.redisCache')}</SelectItem>
              <SelectItem value="keycloak-auth">{t('services.keycloakSSO')}</SelectItem>
              <SelectItem value="notification-service">{t('services.notificationService')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t('buttons.cancel')}
        </Button>
        <Button onClick={handleSubmit}>
          {t('buttons.createIncident')}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function IncidentsTracking({ loading, timeRange }: IncidentsTrackingProps) {
  const t = useTranslations('health.incidentsTracking')
  const [incidents, setIncidents] = useState<HealthIncident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<HealthIncident | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Memoized filtered incidents to prevent unnecessary re-renders
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const matchesSearch = !searchTerm || 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
      const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
      
      return matchesSearch && matchesStatus && matchesSeverity
    })
  }, [incidents, searchTerm, statusFilter, severityFilter])

  useEffect(() => {
    loadIncidents()
  }, [timeRange])


  const loadIncidents = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockIncidents = generateMockIncidents(t)
      setIncidents(mockIncidents)
    } catch (error) {
      toast.error(t('toast.loadFailed'))
    }
  }

  const handleCreateIncident = async (incidentData: Partial<HealthIncident>) => {
    try {
      toast.loading(t('toast.creating'), { id: 'create-incident' })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newIncident: HealthIncident = {
        id: `inc-${Date.now()}`,
        serviceId: incidentData.serviceId,
        serviceName: incidentData.serviceId ? 
          incidentData.serviceId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
          undefined,
        title: incidentData.title!,
        description: incidentData.description!,
        severity: incidentData.severity!,
        status: 'open',
        startedAt: new Date().toISOString(),
        impact: incidentData.impact!,
        timeline: [{
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'detected',
          message: t('mockData.timeline.manualReport'),
          automated: false,
          author: { userId: 'current-user', username: 'admin' }
        }]
      }
      
      setIncidents(prev => [newIncident, ...prev])
      toast.success(t('toast.createSuccess'), { id: 'create-incident' })
    } catch (error) {
      toast.error(t('toast.createFailed'), { id: 'create-incident' })
    }
  }

  const handleExportReport = async () => {
    try {
      toast.loading(t('toast.exporting'), { id: 'export' })
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(t('toast.exportSuccess'), { id: 'export' })
    } catch (error) {
      toast.error(t('toast.exportFailed'), { id: 'export' })
    }
  }

  const getIncidentStats = () => {
    const total = incidents.length
    const open = incidents.filter(i => i.status === 'open').length
    const investigating = incidents.filter(i => i.status === 'investigating').length
    const resolved = incidents.filter(i => i.status === 'resolved').length
    const avgResolutionTime = incidents
      .filter(i => i.resolvedAt && i.duration)
      .reduce((acc, i) => acc + (i.duration || 0), 0) / 
      (incidents.filter(i => i.resolvedAt).length || 1)

    return { total, open, investigating, resolved, avgResolutionTime }
  }

  const stats = getIncidentStats()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-3/4" />
                </div>
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="incidents-tracking-wrapper">
      <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">{t('stats.totalIncidents')}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
              <div className="text-xs text-muted-foreground">{t('stats.open')}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.investigating}</div>
              <div className="text-xs text-muted-foreground">{t('stats.investigating')}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-xs text-muted-foreground">{t('stats.resolved')}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatDuration(stats.avgResolutionTime, t)}</div>
              <div className="text-xs text-muted-foreground">{t('stats.avgResolution')}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-80"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('search.allStatus')}</SelectItem>
              <SelectItem value="open">{t('status.open')}</SelectItem>
              <SelectItem value="investigating">{t('status.investigating')}</SelectItem>
              <SelectItem value="resolved">{t('status.resolved')}</SelectItem>
              <SelectItem value="closed">{t('status.closed')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('search.allSeverity')}</SelectItem>
              <SelectItem value="critical">{t('severity.critical')}</SelectItem>
              <SelectItem value="high">{t('severity.high')}</SelectItem>
              <SelectItem value="medium">{t('severity.medium')}</SelectItem>
              <SelectItem value="low">{t('severity.low')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            {t('buttons.exportReport')}
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('buttons.newIncident')}
              </Button>
            </DialogTrigger>
            <CreateIncidentDialog 
              onClose={() => setShowCreateDialog(false)}
              onCreate={handleCreateIncident}
            />
          </Dialog>
        </div>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.headers.incident')}</TableHead>
                <TableHead>{t('table.headers.service')}</TableHead>
                <TableHead>{t('table.headers.severity')}</TableHead>
                <TableHead>{t('table.headers.status')}</TableHead>
                <TableHead>{t('table.headers.duration')}</TableHead>
                <TableHead>{t('table.headers.impact')}</TableHead>
                <TableHead>{t('table.headers.started')}</TableHead>
                <TableHead>{t('table.headers.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{incident.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {incident.description}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {incident.serviceName ? (
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{incident.serviceName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t('impact.systemWide')}</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(incident.severity)}
                      {getSeverityBadge(incident.severity, t)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(incident.status)}
                      {getStatusBadge(incident.status, t)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {incident.duration ? formatDuration(incident.duration, t) : t('durations.ongoing')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div className="capitalize">{t(`userImpact.${incident.impact.userImpact}`)}</div>
                      {incident.impact.estimatedUsers > 0 && (
                        <div className="text-xs text-muted-foreground">
                          ~{incident.impact.estimatedUsers} {t('impact.users')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {formatTimeAgo(incident.startedAt, t)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t('buttons.details')}
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {selectedIncident && getSeverityIcon(selectedIncident.severity)}
                            {selectedIncident?.title}
                          </DialogTitle>
                          <DialogDescription>
                            Incident #{selectedIncident?.id} • Started {selectedIncident && formatTimeAgo(selectedIncident.startedAt, t)}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedIncident && (
                          <div className="space-y-6">
                            {/* Status and Metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground">{t('detail.sections.status')}</div>
                                <div className="flex items-center gap-1 mt-1">
                                  {getStatusIcon(selectedIncident.status)}
                                  {getStatusBadge(selectedIncident.status, t)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">{t('detail.sections.severity')}</div>
                                <div className="flex items-center gap-1 mt-1">
                                  {getSeverityIcon(selectedIncident.severity)}
                                  {getSeverityBadge(selectedIncident.severity, t)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">{t('detail.sections.duration')}</div>
                                <div className="font-medium mt-1">
                                  {selectedIncident.duration ? formatDuration(selectedIncident.duration, t) : t('durations.ongoing')}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">{t('detail.sections.impact')}</div>
                                <div className="font-medium mt-1 capitalize">
                                  {t(`userImpact.${selectedIncident.impact.userImpact}`)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Description */}
                            <div>
                              <h4 className="font-medium mb-2">{t('detail.sections.description')}</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedIncident.description}
                              </p>
                            </div>
                            
                            {/* Root Cause & Resolution */}
                            {(selectedIncident.rootCause || selectedIncident.resolution) && (
                              <div className="space-y-4">
                                {selectedIncident.rootCause && (
                                  <div>
                                    <h4 className="font-medium mb-2">{t('detail.sections.rootCause')}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedIncident.rootCause}
                                    </p>
                                  </div>
                                )}
                                
                                {selectedIncident.resolution && (
                                  <div>
                                    <h4 className="font-medium mb-2">{t('detail.sections.resolution')}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedIncident.resolution}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Timeline */}
                            <div>
                              <h4 className="font-medium mb-4">{t('detail.sections.timeline')}</h4>
                              <IncidentTimeline incident={selectedIncident} />
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredIncidents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('empty.noIncidents')}</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' ? 
                  t('empty.tryFilters') : 
                  t('empty.noReported')
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}