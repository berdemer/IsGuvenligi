'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Activity,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  ExternalLink,
  Shield,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { 
  SystemOverview, 
  TimeSeriesMetric, 
  MetricDataPoint, 
  ServiceStatus,
  HealthAlert 
} from '@/types/health'

interface OverviewDashboardProps {
  overview: SystemOverview | null
  loading: boolean
  timeRange: string
  onTimeRangeChange: (range: string) => void
}

// Static time series data for consistent hydration
const generateTimeSeriesData = (
  hours: number, 
  baseValue: number, 
  variance: number = 0.2,
  trend: 'up' | 'down' | 'stable' = 'stable'
): MetricDataPoint[] => {
  // Use completely static data to avoid hydration mismatches
  const staticData = [
    145.2, 142.8, 149.1, 151.3, 148.7, 146.9, 144.2, 147.5, 150.8, 145.6,
    148.3, 151.7, 147.1, 149.4, 146.8, 152.2, 148.9, 145.7, 150.3, 147.6,
    149.8, 146.4, 148.1, 151.9, 147.3, 149.7, 145.9, 148.6, 150.4, 147.8,
    149.2, 146.1, 148.8, 151.5, 147.7, 149.6, 146.3, 148.4, 150.7, 147.2,
    149.9, 146.7, 148.2, 151.1, 147.9, 149.3, 146.5, 148.7, 150.9, 147.4
  ]

  const data: MetricDataPoint[] = []
  const baseTime = new Date('2024-01-15T10:00:00.000Z').getTime()
  const interval = (hours * 60 * 60 * 1000) / 50

  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(baseTime + i * interval).toISOString()
    let value = staticData[i] || baseValue
    
    // Scale to match base value
    value = baseValue + ((value - 147.5) / 147.5) * (baseValue * variance)
    
    // Add trend
    if (trend === 'up') {
      value += (i / 49) * (baseValue * 0.3)
    } else if (trend === 'down') {
      value -= (i / 49) * (baseValue * 0.3)
    }
    
    value = Math.max(0, value)
    data.push({ timestamp, value })
  }
  
  return data
}

const SystemHealthGauge: React.FC<{ score: number; loading: boolean }> = ({ score, loading }) => {
  const t = useTranslations('health.overviewDashboard.systemHealth')
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreStatus = (score: number, t: any) => {
    if (score >= 95) return t('status.excellent')
    if (score >= 85) return t('status.good')
    if (score >= 70) return t('status.warning')
    return t('status.critical')
  }

  if (loading || score === undefined || score === null) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <div className="w-32 h-32 border-8 border-gray-200 rounded-full animate-pulse" />
        <div className="mt-4 h-6 w-24 bg-gray-200 animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-48">
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
            className={getScoreColor(score)}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className={`font-medium ${getScoreColor(score)}`}>
          {getScoreStatus(score, t)}
        </div>
        <div className="text-xs text-muted-foreground">
          {t('title')}
        </div>
      </div>
    </div>
  )
}

const MetricChart: React.FC<{
  title: string
  data: MetricDataPoint[]
  unit: string
  color: string
  loading: boolean
}> = ({ title, data, unit, color, loading }) => {
  if (loading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  // Simple line chart using SVG
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 300
    const y = 100 - ((point.value - minValue) / range) * 80
    return `${x},${y}`
  }).join(' ')

  const currentValue = data[data.length - 1]?.value || 0
  const previousValue = data[data.length - 2]?.value || 0
  const change = previousValue ? ((currentValue - previousValue) / previousValue * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="text-right">
            <div className="text-xl font-bold">
              {currentValue.toFixed(1)}{unit}
            </div>
            <div className={`text-xs flex items-center ${
              change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-gray-500'
            }`}>
              {change > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : change < 0 ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : null}
              {Math.abs(change).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <svg width="100%" height="100%" viewBox="0 0 300 100">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* Area under the line */}
            <polygon
              points={`0,100 ${points} 300,100`}
              fill={`url(#gradient-${title})`}
            />
            
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            
            {/* Data points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 300
              const y = 100 - ((point.value - minValue) / range) * 80
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={color}
                />
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

const ServiceUptimeCard: React.FC<{
  services: SystemOverview['services']
  loading: boolean
}> = ({ services, loading }) => {
  const t = useTranslations('health.overviewDashboard.serviceUptime')
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-2 bg-gray-100 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('title7d')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services && services.length > 0 ? services.slice(0, 6).map((service) => (
            <div key={service.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-500' :
                    service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {service.uptime.toFixed(2)}%
                </span>
              </div>
              <Progress 
                value={service.uptime} 
                className="h-2"
              />
            </div>
          )) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">{t('noServices')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const TopAlertsCard: React.FC<{
  alerts: HealthAlert[]
  loading: boolean
  onViewAlert: (alert: HealthAlert) => void
}> = ({ alerts, loading, onViewAlert }) => {
  const t = useTranslations('health.overviewDashboard.activeAlerts')
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t('title')}</CardTitle>
          <Badge variant="outline">
            {t('count', { count: alerts.filter(a => !a.resolved).length })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onViewAlert(alert)}
            >
              <div className="mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {alert.serviceName}
                  </h4>
                  <Badge 
                    variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {alert.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      timeZone: 'UTC'
                    })}
                  </span>
                  {alert.acknowledged && (
                    <Badge variant="outline" className="text-xs">
                      {t('acknowledged')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('noActiveAlerts')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function OverviewDashboard({ 
  overview, 
  loading, 
  timeRange, 
  onTimeRangeChange 
}: OverviewDashboardProps) {
  const t = useTranslations('health.overviewDashboard')
  const tSla = useTranslations('health.overviewDashboard.sla')
  const tMock = useTranslations('health.overviewDashboard.mockData')

  // Generate mock time series data based on current overview
  const responseTimeData = generateTimeSeriesData(
    timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168,
    overview?.avgResponseTime || 150,
    0.3,
    'up'
  )

  const errorRateData = generateTimeSeriesData(
    timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168,
    overview?.errorRate || 0.1,
    0.5,
    'down'
  )

  const handleViewAlert = (alert: HealthAlert) => {
    // Could open a modal or navigate to detailed view
    console.log('Alert clicked:', alert)
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">{t('timeRange.lastHour')}</SelectItem>
            <SelectItem value="24h">{t('timeRange.last24h')}</SelectItem>
            <SelectItem value="7d">{t('timeRange.last7d')}</SelectItem>
            <SelectItem value="30d">{t('timeRange.last30d')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* System Health Gauge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t('systemHealth.title')}
            </CardTitle>
            <CardDescription>
              {t('systemHealth.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SystemHealthGauge 
              score={overview?.healthScore ?? 94} 
              loading={false} 
            />
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <MetricChart
          title={t('metrics.responseTime')}
          data={responseTimeData}
          unit="ms"
          color="#3b82f6"
          loading={false}
        />

        {/* Error Rate Chart */}
        <MetricChart
          title={t('metrics.errorRate')}
          data={errorRateData}
          unit="%"
          color="#ef4444"
          loading={false}
        />
      </div>

      {/* Secondary Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Service Uptime */}
        <ServiceUptimeCard 
          services={overview?.services || [
            {
              id: 'api-gateway',
              name: tMock('apiGateway'),
              type: 'api',
              status: 'healthy',
              uptime: 99.98,
              avgLatency: 145,
              errorRate: 0.02,
              lastCheck: '2024-01-15T10:00:00.000Z',
              healthScore: 95,
              dependencies: [],
              metrics: {}
            },
            {
              id: 'postgres-primary',
              name: tMock('postgresqlPrimary'),
              type: 'database',
              status: 'healthy',
              uptime: 99.95,
              avgLatency: 25,
              errorRate: 0.01,
              lastCheck: '2024-01-15T10:00:00.000Z',
              healthScore: 98,
              dependencies: [],
              metrics: {}
            },
            {
              id: 'redis-cache',
              name: tMock('redisCache'),
              type: 'redis',
              status: 'warning',
              uptime: 98.87,
              avgLatency: 12,
              errorRate: 0.05,
              lastCheck: '2024-01-15T10:00:00.000Z',
              healthScore: 82,
              dependencies: [],
              metrics: {}
            },
            {
              id: 'keycloak-auth',
              name: tMock('keycloakAuth'),
              type: 'keycloak',
              status: 'healthy',
              uptime: 99.92,
              avgLatency: 95,
              errorRate: 0.03,
              lastCheck: '2024-01-15T10:00:00.000Z',
              healthScore: 93,
              dependencies: [],
              metrics: {}
            }
          ]} 
          loading={false}
        />

        {/* Active Alerts */}
        <TopAlertsCard 
          alerts={overview?.topAlerts || [
            {
              id: 'alert-001',
              serviceId: 'redis-cache',
              serviceName: tMock('redisCache'),
              type: 'memory',
              severity: 'high',
              message: tMock('alerts.memoryThreshold'),
              value: 84.2,
              threshold: 80,
              unit: '%',
              timestamp: '2024-01-15T10:30:00.000Z',
              acknowledged: false,
              resolved: false
            },
            {
              id: 'alert-002',
              serviceId: 'keycloak-auth',
              serviceName: tMock('keycloakAuth'),
              type: 'response_time',
              severity: 'critical',
              message: tMock('alerts.responseTimeDegraded'),
              value: 234,
              threshold: 200,
              unit: 'ms',
              timestamp: '2024-01-15T10:22:00.000Z',
              acknowledged: true,
              resolved: false
            },
            {
              id: 'alert-003',
              serviceId: 'api-gateway',
              serviceName: tMock('apiGateway'),
              type: 'error_rate',
              severity: 'medium',
              message: tMock('alerts.errorRateElevated'),
              value: 0.02,
              threshold: 0.01,
              unit: '%',
              timestamp: '2024-01-15T10:05:00.000Z',
              acknowledged: false,
              resolved: false
            }
          ]}
          loading={false}
          onViewAlert={handleViewAlert}
        />
      </div>

      {/* SLA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {tSla('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overview?.sla?.target ?? 99.9}%
              </div>
              <div className="text-sm text-muted-foreground">{tSla('target')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                (overview?.sla?.current ?? 99.97) >= (overview?.sla?.target ?? 99.9) ? 'text-green-600' : 'text-red-600'
              }`}>
                {overview?.sla?.current ?? 99.97}%
              </div>
              <div className="text-sm text-muted-foreground">{tSla('current')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                (overview?.sla?.monthToDate ?? 99.94) >= (overview?.sla?.target ?? 99.9) ? 'text-green-600' : 'text-red-600'
              }`}>
                {overview?.sla?.monthToDate ?? 99.94}%
              </div>
              <div className="text-sm text-muted-foreground">{tSla('monthToDate')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                (overview?.sla?.breach ?? false) ? 'text-red-600' : 'text-green-600'
              }`}>
                {(overview?.sla?.breach ?? false) ? tSla('breach') : tSla('good')}
              </div>
              <div className="text-sm text-muted-foreground">{tSla('status')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}