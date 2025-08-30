'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  Server,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Database,
  Download,
  Upload
} from 'lucide-react'
import { 
  InfrastructureMetrics, 
  TimeSeriesMetric, 
  MetricDataPoint, 
  HealthAlert 
} from '@/types/health'
import toast from 'react-hot-toast'

interface InfrastructureMonitoringProps {
  loading: boolean
  timeRange: string
}

// Mock infrastructure data generator
const generateMockInfraMetrics = (): InfrastructureMetrics => ({
  id: `infra-${Date.now()}`,
  timestamp: new Date().toISOString(),
  system: {
    cpu: {
      usage: 45.2,
      cores: 8,
      loadAverage: [2.1, 2.3, 2.0]
    },
    memory: {
      used: 12884901888, // ~12GB
      total: 17179869184, // ~16GB
      usage: 75.0,
      swap: {
        used: 1073741824, // ~1GB
        total: 4294967296 // ~4GB
      }
    },
    disk: {
      used: 429496729600, // ~400GB
      total: 1099511627776, // ~1TB
      usage: 39.1,
      iops: {
        read: 450,
        write: 320
      }
    },
    network: {
      bytesIn: 1024 * 1024 * 150, // 150 MB/s
      bytesOut: 1024 * 1024 * 95,  // 95 MB/s
      packetsIn: 1250,
      packetsOut: 890,
      errors: 2
    }
  },
  services: {
    'api-gateway': {
      cpu: 12.5,
      memory: 15.2,
      disk: 0.8
    },
    'postgres-primary': {
      cpu: 8.9,
      memory: 22.1,
      disk: 4.2
    },
    'redis-cache': {
      cpu: 3.2,
      memory: 8.7,
      disk: 0.1
    },
    'keycloak-auth': {
      cpu: 6.8,
      memory: 18.9,
      disk: 1.2
    },
    'notification-service': {
      cpu: 4.1,
      memory: 7.3,
      disk: 0.3
    }
  }
})

// Mock time series data
const generateTimeSeriesData = (
  hours: number, 
  baseValue: number, 
  variance: number = 0.2
): MetricDataPoint[] => {
  const data: MetricDataPoint[] = []
  const now = Date.now()
  const interval = (hours * 60 * 60 * 1000) / 60 // 60 data points

  for (let i = 0; i < 60; i++) {
    const timestamp = new Date(now - (59 - i) * interval).toISOString()
    let value = baseValue + (Math.random() - 0.5) * (baseValue * variance * 2)
    value = Math.max(0, Math.min(100, value)) // Clamp between 0-100 for percentages
    
    data.push({ timestamp, value })
  }
  
  return data
}

const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

interface ResourceCardProps {
  title: string
  icon: React.ReactNode
  current: number
  max?: number
  unit: string
  usage?: number
  status: 'healthy' | 'warning' | 'critical'
  details?: Array<{ label: string; value: string }>
  trend?: number
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  icon,
  current,
  max,
  unit,
  usage,
  status,
  details = [],
  trend = 0
}) => {
  const tCommon = useTranslations('health.status')
  const tMetrics = useTranslations('health.infrastructureMonitoring.metrics')
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="capitalize">
        {tCommon(status)}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className={getStatusColor(status)}>
            {icon}
          </div>
          {title}
        </CardTitle>
        {getStatusBadge(status)}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {current.toFixed(1)}{unit}
              {max && (
                <span className="text-sm text-muted-foreground ml-1">
                  / {max.toFixed(1)}{unit}
                </span>
              )}
            </div>
            {trend !== 0 && (
              <div className={`flex items-center text-xs ${
                trend > 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
          
          {usage !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{tMetrics('usage')}</span>
                <span>{usage.toFixed(1)}%</span>
              </div>
              <Progress value={usage} className="h-2" />
            </div>
          )}
          
          {details.length > 0 && (
            <div className="space-y-1">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between text-xs text-muted-foreground">
                  <span>{detail.label}</span>
                  <span>{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ServiceResourceUsageProps {
  services: Record<string, { cpu: number; memory: number; disk: number }>
}

const ServiceResourceUsage: React.FC<ServiceResourceUsageProps> = ({ services }) => {
  const tCards = useTranslations('health.infrastructureMonitoring.cards')
  const tAbbr = useTranslations('health.infrastructureMonitoring.serviceAbbr')
  
  const sortedServices = Object.entries(services)
    .map(([id, metrics]) => ({
      id,
      name: id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      ...metrics
    }))
    .sort((a, b) => b.cpu - a.cpu)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{tCards('serviceResourceUsage.title')}</CardTitle>
        <CardDescription>
          {tCards('serviceResourceUsage.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedServices.map((service) => (
            <div key={service.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{service.name}</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{tAbbr('cpu')} {service.cpu.toFixed(1)}%</span>
                  <span>{tAbbr('memory')} {service.memory.toFixed(1)}%</span>
                  <span>{tAbbr('disk')} {service.disk.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Progress value={service.cpu} className="h-1" />
                </div>
                <div>
                  <Progress value={service.memory} className="h-1" />
                </div>
                <div>
                  <Progress value={service.disk} className="h-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricChartProps {
  title: string
  data: MetricDataPoint[]
  unit: string
  color: string
  height?: number
}

const MetricChart: React.FC<MetricChartProps> = ({ 
  title, 
  data, 
  unit, 
  color, 
  height = 200 
}) => {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 400
    const y = height - 40 - ((point.value - minValue) / range) * (height - 80)
    return `${x},${y}`
  }).join(' ')

  const currentValue = data[data.length - 1]?.value || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="text-right">
            <div className="text-xl font-bold">
              {currentValue.toFixed(1)}{unit}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <svg width="100%" height="100%" viewBox={`0 0 400 ${height}`}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={20 + (i * (height - 40) / 4)}
                x2="400"
                y2={20 + (i * (height - 40) / 4)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}
            
            {/* Area under the line */}
            <polygon
              points={`0,${height - 20} ${points} 400,${height - 20}`}
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
              if (index % 5 === 0) { // Show every 5th point
                const x = (index / (data.length - 1)) * 400
                const y = height - 40 - ((point.value - minValue) / range) * (height - 80)
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={color}
                  />
                )
              }
              return null
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

export default function InfrastructureMonitoring({ 
  loading, 
  timeRange 
}: InfrastructureMonitoringProps) {
  const t = useTranslations('health.infrastructureMonitoring')
  const tCommon = useTranslations('health.status')
  const [metrics, setMetrics] = useState<InfrastructureMetrics | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'disk' | 'network'>('cpu')

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setMetrics(generateMockInfraMetrics())
    } catch (error) {
      toast.error(t('toast.loadFailed'))
    }
  }

  // Generate time series data for charts
  const cpuData = generateTimeSeriesData(
    timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168,
    metrics?.system.cpu.usage || 45,
    0.3
  )

  const memoryData = generateTimeSeriesData(
    timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168,
    metrics?.system.memory.usage || 75,
    0.2
  )

  const diskData = generateTimeSeriesData(
    timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168,
    metrics?.system.disk.usage || 39,
    0.1
  )

  const networkInData = generateTimeSeriesData(
    timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168,
    150,
    0.4
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 animate-pulse rounded" />
                  <div className="h-8 bg-gray-200 animate-pulse rounded" />
                  <div className="h-2 bg-gray-100 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const getResourceStatus = (usage: number): 'healthy' | 'warning' | 'critical' => {
    if (usage >= 90) return 'critical'
    if (usage >= 75) return 'warning'
    return 'healthy'
  }

  return (
    <div className="space-y-6">
      {/* Resource Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ResourceCard
          title={t('components.cpuUsage')}
          icon={<Cpu className="h-4 w-4" />}
          current={metrics.system.cpu.usage}
          unit="%"
          usage={metrics.system.cpu.usage}
          status={getResourceStatus(metrics.system.cpu.usage)}
          details={[
            { label: t('metrics.cores'), value: metrics.system.cpu.cores.toString() },
            { label: t('metrics.loadAvg'), value: metrics.system.cpu.loadAverage.map(l => l.toFixed(1)).join(', ') }
          ]}
          trend={2.3}
        />
        
        <ResourceCard
          title={t('components.memory')}
          icon={<MemoryStick className="h-4 w-4" />}
          current={metrics.system.memory.used / (1024 * 1024 * 1024)}
          max={metrics.system.memory.total / (1024 * 1024 * 1024)}
          unit="GB"
          usage={metrics.system.memory.usage}
          status={getResourceStatus(metrics.system.memory.usage)}
          details={[
            { 
              label: t('metrics.swapUsed'), 
              value: formatBytes(metrics.system.memory.swap?.used || 0) 
            }
          ]}
          trend={-1.2}
        />
        
        <ResourceCard
          title={t('components.diskSpace')}
          icon={<HardDrive className="h-4 w-4" />}
          current={metrics.system.disk.used / (1024 * 1024 * 1024)}
          max={metrics.system.disk.total / (1024 * 1024 * 1024)}
          unit="GB"
          usage={metrics.system.disk.usage}
          status={getResourceStatus(metrics.system.disk.usage)}
          details={[
            { 
              label: t('metrics.readIOPS'), 
              value: formatNumber(metrics.system.disk.iops?.read || 0) 
            },
            { 
              label: t('metrics.writeIOPS'), 
              value: formatNumber(metrics.system.disk.iops?.write || 0) 
            }
          ]}
          trend={0.5}
        />
        
        <ResourceCard
          title={t('components.networkIO')}
          icon={<Wifi className="h-4 w-4" />}
          current={metrics.system.network.bytesIn / (1024 * 1024)}
          unit="MB/s"
          status="healthy"
          details={[
            { 
              label: t('metrics.outbound'), 
              value: `${(metrics.system.network.bytesOut / (1024 * 1024)).toFixed(1)} MB/s` 
            },
            { 
              label: t('metrics.packetsIn'), 
              value: formatNumber(metrics.system.network.packetsIn) 
            },
            { 
              label: t('metrics.errors'), 
              value: metrics.system.network.errors.toString() 
            }
          ]}
          trend={-0.8}
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('cards.historicalMetrics.title')}</h3>
          <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpu">{t('dropdown.cpuUsage')}</SelectItem>
              <SelectItem value="memory">{t('dropdown.memoryUsage')}</SelectItem>
              <SelectItem value="disk">{t('dropdown.diskUsage')}</SelectItem>
              <SelectItem value="network">{t('dropdown.networkIO')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {selectedMetric === 'cpu' && (
            <>
              <MetricChart
                title={t('components.cpuUsage')}
                data={cpuData}
                unit="%"
                color="#3b82f6"
              />
              <ServiceResourceUsage services={metrics.services} />
            </>
          )}
          
          {selectedMetric === 'memory' && (
            <>
              <MetricChart
                title={t('components.memory')}
                data={memoryData}
                unit="%"
                color="#10b981"
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('cards.memoryBreakdown.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>{t('memoryTypes.physicalMemory')}</span>
                      <span>{formatBytes(metrics.system.memory.used)} / {formatBytes(metrics.system.memory.total)}</span>
                    </div>
                    <Progress value={metrics.system.memory.usage} />
                    
                    <div className="flex justify-between items-center">
                      <span>{t('memoryTypes.swapMemory')}</span>
                      <span>{formatBytes(metrics.system.memory.swap?.used || 0)} / {formatBytes(metrics.system.memory.swap?.total || 0)}</span>
                    </div>
                    <Progress value={((metrics.system.memory.swap?.used || 0) / (metrics.system.memory.swap?.total || 1)) * 100} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {selectedMetric === 'disk' && (
            <>
              <MetricChart
                title={t('components.diskSpace')}
                data={diskData}
                unit="%"
                color="#f59e0b"
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('cards.diskIOPerformance.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(metrics.system.disk.iops?.read || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">{t('metrics.readIOPS')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(metrics.system.disk.iops?.write || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">{t('metrics.writeIOPS')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {selectedMetric === 'network' && (
            <>
              <MetricChart
                title={t('cards.networkInbound.title')}
                data={networkInData}
                unit=" MB/s"
                color="#ef4444"
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('cards.networkStatistics.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-blue-500" />
                        <span>{t('metrics.inbound')}</span>
                      </div>
                      <span>{formatBytes(metrics.system.network.bytesIn)}/s</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-green-500" />
                        <span>{t('metrics.outbound')}</span>
                      </div>
                      <span>{formatBytes(metrics.system.network.bytesOut)}/s</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>{t('metrics.packetsIn')}</span>
                      <span>{formatNumber(metrics.system.network.packetsIn)}/s</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>{t('metrics.packetsOut')}</span>
                      <span>{formatNumber(metrics.system.network.packetsOut)}/s</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span>{t('metrics.errors')}</span>
                      </div>
                      <span>{metrics.system.network.errors}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Alerts for Infrastructure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('cards.infrastructureAlerts.title')}</CardTitle>
          <CardDescription>
            {t('cards.infrastructureAlerts.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.system.memory.usage > 75 && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{t('alerts.titles.highMemoryUsage')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('alerts.descriptions.memoryThreshold', { usage: metrics.system.memory.usage.toFixed(1) })}
                  </p>
                </div>
                <Badge variant="secondary">{tCommon('warning')}</Badge>
              </div>
            )}
            
            {metrics.system.cpu.usage > 80 && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{t('alerts.titles.criticalCPUUsage')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('alerts.descriptions.cpuCritical', { usage: metrics.system.cpu.usage.toFixed(1) })}
                  </p>
                </div>
                <Badge variant="destructive">{tCommon('critical')}</Badge>
              </div>
            )}
            
            {metrics.system.disk.usage > 85 && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{t('alerts.titles.diskSpaceLow')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('alerts.descriptions.diskCleanup', { usage: metrics.system.disk.usage.toFixed(1) })}
                  </p>
                </div>
                <Badge variant="secondary">{tCommon('warning')}</Badge>
              </div>
            )}
            
            {metrics.system.memory.usage <= 75 && 
             metrics.system.cpu.usage <= 80 && 
             metrics.system.disk.usage <= 85 && (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('alerts.noAlerts')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}