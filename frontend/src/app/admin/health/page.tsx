'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  Settings as SettingsIcon,
  Monitor,
  Server,
  Database,
  Shield,
  Wifi,
  HardDrive,
  WifiOff,
  BarChart3
} from 'lucide-react'
import { 
  SystemOverview, 
  HealthTabType, 
  ServiceStatus,
  TrendData,
  HealthPageState,
  HealthAlert,
  HealthIncident,
  ServiceHealth
} from '@/types/health'
import OverviewDashboard from '@/components/admin/health/OverviewDashboard'
import ServicesMonitoring from '@/components/admin/health/ServicesMonitoring'
import InfrastructureMonitoring from '@/components/admin/health/InfrastructureMonitoring'
import IncidentsTracking from '@/components/admin/health/IncidentsTracking'
import HealthSettings from '@/components/admin/health/HealthSettingsSimple'
import PrometheusGrafanaIntegration from '@/components/admin/health/PrometheusGrafanaIntegration'
import { useHealthMonitoring } from '@/hooks/useHealthMonitoring'
import toast from 'react-hot-toast'

// Mock data generator for system overview
const generateMockOverview = (): SystemOverview => ({
  timestamp: new Date().toISOString(),
  healthScore: 94,
  uptime: 99.97,
  avgResponseTime: 145,
  errorRate: 0.12,
  criticalAlerts: 2,
  totalServices: 8,
  healthyServices: 6,
  services: [
    {
      id: 'api-gateway',
      name: 'API Gateway',
      type: 'api' as const,
      status: 'healthy' as const,
      uptime: 99.98,
      avgLatency: 89,
      errorRate: 0.05,
      lastCheck: new Date(Date.now() - 30000).toISOString(),
      healthScore: 98,
      version: 'v2.1.4',
      endpoint: '/api/health',
      dependencies: ['postgres-primary', 'redis-cache'],
      metrics: {
        responseTime: {
          timestamp: new Date().toISOString(),
          value: 89,
          unit: 'ms',
          threshold: { warning: 200, critical: 500 }
        },
        errorRate: {
          timestamp: new Date().toISOString(),
          value: 0.05,
          unit: '%'
        }
      }
    },
    {
      id: 'postgres-primary',
      name: 'PostgreSQL Primary',
      type: 'database' as const,
      status: 'healthy' as const,
      uptime: 99.99,
      avgLatency: 12,
      errorRate: 0.01,
      lastCheck: new Date(Date.now() - 15000).toISOString(),
      healthScore: 99,
      dependencies: [],
      metrics: {
        responseTime: {
          timestamp: new Date().toISOString(),
          value: 12,
          unit: 'ms'
        }
      }
    },
    {
      id: 'redis-cache',
      name: 'Redis Cache',
      type: 'redis' as const,
      status: 'warning' as const,
      uptime: 99.85,
      avgLatency: 8,
      errorRate: 0.18,
      lastCheck: new Date(Date.now() - 45000).toISOString(),
      healthScore: 87,
      dependencies: [],
      metrics: {
        memory: {
          timestamp: new Date().toISOString(),
          value: 78,
          unit: '%',
          threshold: { warning: 75, critical: 90 }
        }
      }
    },
    {
      id: 'keycloak-auth',
      name: 'Keycloak SSO',
      type: 'keycloak' as const,
      status: 'critical' as const,
      uptime: 98.92,
      avgLatency: 450,
      errorRate: 2.1,
      lastCheck: new Date(Date.now() - 120000).toISOString(),
      healthScore: 65,
      dependencies: ['postgres-primary'],
      metrics: {
        responseTime: {
          timestamp: new Date().toISOString(),
          value: 450,
          unit: 'ms',
          threshold: { warning: 200, critical: 400 }
        },
        errorRate: {
          timestamp: new Date().toISOString(),
          value: 2.1,
          unit: '%'
        }
      },
      lastIncident: {
        id: 'inc-001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        impact: 'high' as const
      }
    },
    {
      id: 'notification-service',
      name: 'Notification Service',
      type: 'notification' as const,
      status: 'healthy' as const,
      uptime: 99.95,
      avgLatency: 156,
      errorRate: 0.08,
      lastCheck: new Date(Date.now() - 20000).toISOString(),
      healthScore: 96,
      dependencies: ['redis-cache'],
      metrics: {
        throughput: {
          timestamp: new Date().toISOString(),
          value: 1245,
          unit: 'req/min'
        }
      }
    },
    {
      id: 'background-queue',
      name: 'Background Queue',
      type: 'queue' as const,
      status: 'healthy' as const,
      uptime: 99.88,
      avgLatency: 203,
      errorRate: 0.15,
      lastCheck: new Date(Date.now() - 10000).toISOString(),
      healthScore: 93,
      dependencies: ['redis-cache'],
      metrics: {}
    },
    {
      id: 'file-worker',
      name: 'File Processing Worker',
      type: 'worker' as const,
      status: 'warning' as const,
      uptime: 99.42,
      avgLatency: 2340,
      errorRate: 0.45,
      lastCheck: new Date(Date.now() - 60000).toISOString(),
      healthScore: 82,
      dependencies: ['postgres-primary'],
      metrics: {}
    },
    {
      id: 'backup-service',
      name: 'Backup Service',
      type: 'worker' as const,
      status: 'healthy' as const,
      uptime: 99.97,
      avgLatency: 5600,
      errorRate: 0.02,
      lastCheck: new Date(Date.now() - 300000).toISOString(),
      healthScore: 97,
      dependencies: ['postgres-primary'],
      metrics: {}
    }
  ],
  topAlerts: [
    {
      id: 'alert-001',
      serviceId: 'keycloak-auth',
      serviceName: 'Keycloak SSO',
      type: 'response_time' as const,
      severity: 'critical' as const,
      message: 'Response time exceeded critical threshold',
      value: 450,
      threshold: 400,
      unit: 'ms',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      acknowledged: false,
      resolved: false
    },
    {
      id: 'alert-002',
      serviceId: 'redis-cache',
      serviceName: 'Redis Cache',
      type: 'memory' as const,
      severity: 'medium' as const,
      message: 'Memory usage approaching limit',
      value: 78,
      threshold: 75,
      unit: '%',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      acknowledged: true,
      resolved: false,
      acknowledgedBy: {
        userId: 'admin-001',
        username: 'admin',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      }
    }
  ],
  trends: {
    healthScore: {
      current: 94,
      previous: 91,
      change: 3.3,
      trend: 'up' as const,
      period: '24h'
    },
    responseTime: {
      current: 145,
      previous: 132,
      change: 9.8,
      trend: 'up' as const,
      period: '24h'
    },
    errorRate: {
      current: 0.12,
      previous: 0.18,
      change: -33.3,
      trend: 'down' as const,
      period: '24h'
    },
    uptime: {
      current: 99.97,
      previous: 99.95,
      change: 0.02,
      trend: 'up' as const,
      period: '24h'
    }
  },
  sla: {
    target: 99.9,
    current: 99.97,
    monthToDate: 99.94,
    breach: false
  }
})

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  trend?: TrendData
  status?: ServiceStatus
  icon: React.ReactNode
  loading?: boolean
  onClick?: () => void
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  unit = '', 
  trend, 
  status, 
  icon, 
  loading = false,
  onClick 
}) => {
  const getStatusColor = (status?: ServiceStatus) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend?: TrendData) => {
    if (!trend) return null
    
    switch (trend.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        onClick ? 'hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={getStatusColor(status)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
              ) : (
                `${value}${unit}`
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(trend)}
                <span className={`text-xs ${
                  trend.trend === 'up' ? 'text-green-600' : 
                  trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {Math.abs(trend.change)}% from {trend.period}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HealthMonitoringPage() {
  const t = useTranslations('health')
  console.log('🏥 HealthMonitoringPage component mounted')
  
  
  const [pageState, setPageState] = useState<HealthPageState>({
    activeTab: 'overview',
    timeRange: '24h',
    autoRefresh: true,
    refreshInterval: 10,
    filters: {
      services: [],
      severities: [],
      metrics: [],
      showUnhealthyOnly: false
    }
  })

  console.log('🏥 HealthMonitoringPage calling useHealthMonitoring hook')
  // Use the real-time health monitoring hook
  const {
    overview,
    services,
    infrastructure,
    incidents,
    alerts,
    loading,
    connected,
    lastUpdate,
    error,
    refresh,
    connect,
    disconnect,
    isLoading,
    hasError,
    isConnected
  } = useHealthMonitoring({
    autoRefresh: pageState.autoRefresh,
    refreshInterval: pageState.refreshInterval,
    enableRealtime: true,
    onAlert: (alert: HealthAlert) => {
      toast.error(`${t('newAlert')} ${alert.severity} ${alert.severity === 'critical' ? t('criticalAlerts').toLowerCase() : 'alert'}: ${alert.message}`)
    },
    onIncident: (incident: HealthIncident) => {
      toast.error(`${t('newIncident')}: ${incident.title}`)
    },
    onServiceStatusChange: (service: ServiceHealth) => {
      toast.success(`${service.name} ${t('serviceStatusUpdated')}`)
    }
  })

  const handleTabChange = (tab: HealthTabType) => {
    setPageState(prev => ({ ...prev, activeTab: tab }))
  }

  const handleExportMetrics = async () => {
    try {
      toast.loading(t('generatingHealthReport'), { id: 'export' })
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(t('healthReportExported'), { id: 'export' })
    } catch (error) {
      toast.error(t('failedToExportReport'), { id: 'export' })
    }
  }

  const handleViewReports = () => {
    setPageState(prev => ({ ...prev, activeTab: 'incidents' }))
  }

  const handleToggleRealtime = () => {
    if (isConnected) {
      disconnect()
      toast.success(t('realtimeMonitoringDisconnected'))
    } else {
      connect()
      toast.success(t('realtimeMonitoringConnected'))
    }
  }

  const getOverallStatus = (overview: SystemOverview): ServiceStatus => {
    if (overview.healthScore >= 95) return 'healthy'
    if (overview.healthScore >= 85) return 'warning'
    return 'critical'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('overview')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('autoRefresh')}</span>
            <Switch
              checked={pageState.autoRefresh}
              onCheckedChange={(checked) => 
                setPageState(prev => ({ ...prev, autoRefresh: checked }))
              }
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className={`flex items-center gap-1 ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span className="text-xs">
                {isConnected ? t('live') : t('offline')}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                {t('updated')} {new Date(lastUpdate).toLocaleTimeString('en-US', { timeZone: 'UTC' })}
              </span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleRealtime}
          >
            {isConnected ? (
              <WifiOff className="h-4 w-4 mr-2" />
            ) : (
              <Wifi className="h-4 w-4 mr-2" />
            )}
            {isConnected ? t('disconnect') : t('connect')}
          </Button>
          
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewReports}>
            <FileText className="h-4 w-4 mr-2" />
            {t('viewReports')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            {t('exportMetrics')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title={t('healthScore')}
          value={overview?.healthScore || 94}
          unit="/100"
          status={overview ? getOverallStatus(overview) : 'healthy'}
          trend={overview?.trends.healthScore}
          icon={<Activity className="h-4 w-4" />}
          loading={false}
          onClick={() => handleTabChange('overview')}
        />
        <KPICard
          title={t('systemUptime')}
          value={overview?.uptime?.toFixed(2) || '99.97'}
          unit="%"
          trend={overview?.trends.uptime}
          icon={<Clock className="h-4 w-4" />}
          loading={false}
          onClick={() => handleTabChange('services')}
        />
        <KPICard
          title="Avg Response Time"
          value={overview?.avgResponseTime || 145}
          unit="ms"
          status={overview && overview.avgResponseTime > 200 ? 'warning' : 'healthy'}
          trend={overview?.trends.responseTime}
          icon={<Zap className="h-4 w-4" />}
          loading={false}
          onClick={() => handleTabChange('services')}
        />
        <KPICard
          title="Critical Alerts"
          value={overview?.criticalAlerts || 2}
          status={overview && overview.criticalAlerts > 0 ? 'critical' : 'warning'}
          icon={<AlertTriangle className="h-4 w-4" />}
          loading={false}
          onClick={() => handleTabChange('incidents')}
        />
      </div>

      {/* Service Status Summary */}
      {overview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Services</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {overview.healthyServices} Healthy
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">
                    {overview.services.filter(s => s.status === 'warning').length} Warning
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">
                    {overview.services.filter(s => s.status === 'critical').length} Critical
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {overview.services.map((service) => (
                <Badge
                  key={service.id}
                  variant={
                    service.status === 'healthy' ? 'default' :
                    service.status === 'warning' ? 'secondary' : 'destructive'
                  }
                  className="text-xs"
                >
                  {service.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={pageState.activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Monitor className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="services">
            <Server className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="infrastructure">
            <HardDrive className="h-4 w-4 mr-2" />
            Infrastructure
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="audit">
            <BarChart3 className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewDashboard 
            overview={overview} 
            loading={isLoading}
            timeRange={pageState.timeRange}
            onTimeRangeChange={(range) => setPageState(prev => ({ ...prev, timeRange: range }))}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServicesMonitoring 
            services={services.length > 0 ? services : overview?.services || [
              {
                id: 'api-gateway',
                name: 'API Gateway',
                type: 'api',
                status: 'healthy',
                uptime: 99.98,
                avgLatency: 145,
                errorRate: 0.02,
                lastCheck: '2024-01-15T10:00:00.000Z',
                healthScore: 95,
                dependencies: ['postgres-primary', 'redis-cache'],
                metrics: {
                  responseTime: {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    value: 145,
                    unit: 'ms'
                  },
                  errorRate: {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    value: 0.02,
                    unit: '%'
                  }
                }
              },
              {
                id: 'postgres-primary',
                name: 'PostgreSQL Primary',
                type: 'database',
                status: 'healthy',
                uptime: 99.95,
                avgLatency: 25,
                errorRate: 0.01,
                lastCheck: '2024-01-15T10:00:00.000Z',
                healthScore: 98,
                dependencies: [],
                metrics: {
                  responseTime: {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    value: 25,
                    unit: 'ms'
                  },
                  errorRate: {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    value: 0.01,
                    unit: '%'
                  }
                }
              },
              {
                id: 'redis-cache',
                name: 'Redis Cache',
                type: 'redis',
                status: 'warning',
                uptime: 98.87,
                avgLatency: 12,
                errorRate: 0.05,
                lastCheck: '2024-01-15T10:00:00.000Z',
                healthScore: 82,
                dependencies: [],
                metrics: {
                  responseTime: {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    value: 12,
                    unit: 'ms'
                  },
                  errorRate: {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    value: 0.05,
                    unit: '%'
                  }
                }
              },
              {
                id: 'keycloak-auth',
                name: 'Keycloak Auth',
                type: 'keycloak',
                status: 'healthy',
                uptime: 99.92,
                avgLatency: 95,
                errorRate: 0.03,
                lastCheck: '2024-01-15T10:00:00.000Z',
                healthScore: 93,
                dependencies: ['postgres-primary'],
                metrics: {
                  responseTime: {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    value: 95,
                    unit: 'ms'
                  },
                  errorRate: {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    value: 0.03,
                    unit: '%'
                  }
                }
              }
            ]}
            loading={false}
            showUnhealthyOnly={pageState.filters.showUnhealthyOnly}
            onToggleFilter={(show) => 
              setPageState(prev => ({
                ...prev,
                filters: { ...prev.filters, showUnhealthyOnly: show }
              }))
            }
          />
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          <InfrastructureMonitoring 
            loading={false}
            timeRange={pageState.timeRange}
          />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <IncidentsTracking 
            loading={false}
            timeRange={pageState.timeRange}
          />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <PrometheusGrafanaIntegration />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <HealthSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}