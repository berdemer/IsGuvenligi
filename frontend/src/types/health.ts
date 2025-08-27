// Health & Monitoring System Types
// Comprehensive TypeScript interfaces for system health monitoring

export type ServiceStatus = 'healthy' | 'warning' | 'critical' | 'unknown'
export type ServiceType = 'api' | 'database' | 'redis' | 'keycloak' | 'queue' | 'worker' | 'notification'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed'
export type MetricType = 'cpu' | 'memory' | 'disk' | 'network' | 'response_time' | 'error_rate' | 'throughput'
export type ThresholdOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'
export type AlertChannel = 'email' | 'sms' | 'slack' | 'webhook' | 'in_app'

// Core Health Interfaces
export interface HealthMetric {
  timestamp: string
  value: number
  unit: string
  threshold?: {
    warning: number
    critical: number
  }
}

export interface ServiceHealth {
  id: string
  name: string
  type: ServiceType
  status: ServiceStatus
  uptime: number // percentage
  avgLatency: number // milliseconds
  errorRate: number // percentage
  lastCheck: string
  healthScore: number // 0-100
  version?: string
  endpoint?: string
  dependencies: string[] // service IDs this depends on
  metrics: {
    cpu?: HealthMetric
    memory?: HealthMetric
    responseTime?: HealthMetric
    errorRate?: HealthMetric
    throughput?: HealthMetric
  }
  lastIncident?: {
    id: string
    timestamp: string
    duration: number // minutes
    impact: IncidentSeverity
  }
}

export interface InfrastructureMetrics {
  id: string
  timestamp: string
  system: {
    cpu: {
      usage: number // percentage
      cores: number
      loadAverage: number[]
    }
    memory: {
      used: number // bytes
      total: number // bytes
      usage: number // percentage
      swap?: {
        used: number
        total: number
      }
    }
    disk: {
      used: number // bytes
      total: number // bytes
      usage: number // percentage
      iops?: {
        read: number
        write: number
      }
    }
    network: {
      bytesIn: number
      bytesOut: number
      packetsIn: number
      packetsOut: number
      errors: number
    }
  }
  services: Record<string, {
    cpu: number
    memory: number
    disk: number
  }>
}

export interface HealthIncident {
  id: string
  serviceId?: string
  serviceName?: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  startedAt: string
  resolvedAt?: string
  duration?: number // minutes
  impact: {
    affectedServices: string[]
    userImpact: 'none' | 'minimal' | 'moderate' | 'severe'
    estimatedUsers?: number
  }
  resolvedBy?: {
    userId: string
    username: string
    method: 'auto' | 'manual'
  }
  timeline: IncidentEvent[]
  metrics?: {
    errorSpike?: number
    downtimeMinutes?: number
    responseTimeIncrease?: number
  }
  rootCause?: string
  resolution?: string
  preventionSteps?: string[]
  relatedIncidents?: string[]
}

export interface IncidentEvent {
  id: string
  timestamp: string
  type: 'detected' | 'investigating' | 'update' | 'resolved' | 'post_mortem'
  message: string
  author?: {
    userId: string
    username: string
  }
  automated: boolean
  metadata?: Record<string, any>
}

// System Overview
export interface SystemOverview {
  timestamp: string
  healthScore: number // 0-100 overall system health
  uptime: number // percentage
  avgResponseTime: number // milliseconds
  errorRate: number // percentage
  criticalAlerts: number
  totalServices: number
  healthyServices: number
  services: ServiceHealth[]
  topAlerts: HealthAlert[]
  trends: {
    healthScore: TrendData
    responseTime: TrendData
    errorRate: TrendData
    uptime: TrendData
  }
  sla: {
    target: number // 99.9%
    current: number
    monthToDate: number
    breach: boolean
  }
}

export interface TrendData {
  current: number
  previous: number
  change: number // percentage change
  trend: 'up' | 'down' | 'stable'
  period: string // '24h', '7d', '30d'
}

export interface HealthAlert {
  id: string
  serviceId: string
  serviceName: string
  type: MetricType
  severity: IncidentSeverity
  message: string
  value: number
  threshold: number
  unit: string
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: {
    userId: string
    username: string
    timestamp: string
  }
  resolved: boolean
  resolvedAt?: string
  metadata?: Record<string, any>
}

// Time Series Data
export interface MetricDataPoint {
  timestamp: string
  value: number
  metadata?: Record<string, any>
}

export interface TimeSeriesMetric {
  metric: MetricType
  label: string
  unit: string
  data: MetricDataPoint[]
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
  interval: string // '1m', '5m', '1h', '1d'
}

// Health Settings & Configuration
export interface HealthThreshold {
  id: string
  serviceId?: string // if null, applies to all services
  serviceType?: ServiceType
  metric: MetricType
  warning: {
    value: number
    operator: ThresholdOperator
  }
  critical: {
    value: number
    operator: ThresholdOperator
  }
  enabled: boolean
  description?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface AlertingConfig {
  id: string
  name: string
  description?: string
  enabled: boolean
  conditions: {
    serviceIds?: string[]
    serviceTypes?: ServiceType[]
    severities: IncidentSeverity[]
    metrics: MetricType[]
  }
  channels: AlertChannelConfig[]
  cooldown: number // minutes between alerts
  escalation?: {
    enabled: boolean
    delay: number // minutes
    channels: AlertChannelConfig[]
  }
  schedule?: {
    enabled: boolean
    timezone: string
    quietHours?: {
      start: string // HH:mm
      end: string // HH:mm
    }
    weekends: boolean
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface AlertChannelConfig {
  channel: AlertChannel
  enabled: boolean
  config: Record<string, any> // channel-specific configuration
  priority: number // 1 is highest
}

// Health Check Configuration
export interface HealthCheckConfig {
  id: string
  serviceId: string
  name: string
  type: 'http' | 'tcp' | 'database' | 'custom'
  interval: number // seconds
  timeout: number // seconds
  retries: number
  config: {
    url?: string
    method?: string
    headers?: Record<string, string>
    body?: string
    expectedStatus?: number[]
    expectedContent?: string
    host?: string
    port?: number
    query?: string // for database checks
    script?: string // for custom checks
  }
  enabled: boolean
  lastRun?: string
  nextRun?: string
  consecutiveFailures: number
  createdAt: string
  updatedAt: string
}

// Export and Reporting
export interface HealthReport {
  id: string
  type: 'overview' | 'service' | 'incident' | 'sla'
  title: string
  description?: string
  period: {
    start: string
    end: string
  }
  filters: {
    serviceIds?: string[]
    severities?: IncidentSeverity[]
    metrics?: MetricType[]
  }
  data: {
    summary: Record<string, any>
    metrics: TimeSeriesMetric[]
    incidents: HealthIncident[]
    services: ServiceHealth[]
  }
  format: 'json' | 'csv' | 'pdf'
  generatedAt: string
  generatedBy: string
  downloadUrl?: string
  expiresAt?: string
}

// Real-time Updates
export interface HealthUpdateEvent {
  type: 'service_status' | 'metric_update' | 'alert' | 'incident' | 'system_health'
  timestamp: string
  data: any
  source: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Service Dependencies
export interface ServiceDependency {
  id: string
  serviceId: string
  dependsOnId: string
  type: 'hard' | 'soft' // hard = service fails if dependency fails
  healthImpact: number // 0-100, how much dependency health affects this service
  lastChecked: string
  status: 'healthy' | 'degraded' | 'failed'
}

export interface DependencyMap {
  services: ServiceHealth[]
  dependencies: ServiceDependency[]
  criticalPath: string[] // service IDs in order of criticality
}

// Integration with Prometheus/Grafana
export interface PrometheusMetric {
  metric: Record<string, string>
  value: [number, string] // [timestamp, value]
}

export interface PrometheusResponse {
  status: 'success' | 'error'
  data: {
    resultType: 'matrix' | 'vector' | 'scalar' | 'string'
    result: PrometheusMetric[]
  }
  error?: string
  errorType?: string
}

export interface GrafanaDashboard {
  id: string
  uid: string
  title: string
  tags: string[]
  url: string
  embedUrl: string
  panels: GrafanaPanel[]
}

export interface GrafanaPanel {
  id: number
  title: string
  type: string
  targets: Array<{
    expr: string
    legendFormat?: string
  }>
}

// API Response Types
export interface HealthOverviewResponse {
  overview: SystemOverview
  lastUpdated: string
  nextUpdate: string
}

export interface ServicesHealthResponse {
  services: ServiceHealth[]
  summary: {
    total: number
    healthy: number
    warning: number
    critical: number
  }
  lastUpdated: string
}

export interface InfraMetricsResponse {
  current: InfrastructureMetrics
  history: TimeSeriesMetric[]
  alerts: HealthAlert[]
  lastUpdated: string
}

export interface IncidentsResponse {
  incidents: HealthIncident[]
  summary: {
    total: number
    open: number
    resolved: number
    avgResolutionTime: number // minutes
  }
  timeline: IncidentEvent[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Request Types
export interface CreateIncidentRequest {
  serviceId?: string
  title: string
  description: string
  severity: IncidentSeverity
  impact: {
    affectedServices: string[]
    userImpact: 'none' | 'minimal' | 'moderate' | 'severe'
    estimatedUsers?: number
  }
}

export interface UpdateIncidentRequest {
  status?: IncidentStatus
  message?: string
  rootCause?: string
  resolution?: string
  preventionSteps?: string[]
}

export interface ServiceActionRequest {
  action: 'restart' | 'clear_cache' | 'health_check' | 'enable' | 'disable'
  reason?: string
  force?: boolean
}

export interface ExportReportRequest {
  type: 'overview' | 'service' | 'incident' | 'sla'
  period: {
    start: string
    end: string
  }
  format: 'json' | 'csv' | 'pdf'
  filters?: {
    serviceIds?: string[]
    severities?: IncidentSeverity[]
    metrics?: MetricType[]
  }
  includeCharts?: boolean
}

// Component Props
export interface HealthKPICardProps {
  title: string
  value: string | number
  unit?: string
  trend?: TrendData
  status?: ServiceStatus
  loading?: boolean
  onClick?: () => void
}

export interface ServiceStatusTableProps {
  services: ServiceHealth[]
  loading?: boolean
  onServiceClick: (service: ServiceHealth) => void
  onServiceAction: (serviceId: string, action: string) => void
  showUnhealthyOnly?: boolean
}

export interface HealthChartProps {
  data: TimeSeriesMetric[]
  height?: number
  loading?: boolean
  showThresholds?: boolean
  onPointClick?: (point: MetricDataPoint) => void
}

export interface IncidentTimelineProps {
  incidents: HealthIncident[]
  loading?: boolean
  onIncidentClick: (incident: HealthIncident) => void
}

// Mock Data Generators (for development)
export interface MockDataOptions {
  services: number
  timeRange: string // '1h', '24h', '7d', '30d'
  incidents: number
  anomalies?: boolean
  degradation?: boolean
}

// Utility Types
export type HealthTabType = 'overview' | 'services' | 'infrastructure' | 'incidents' | 'audit' | 'settings'

export interface HealthPageState {
  activeTab: HealthTabType
  selectedService?: ServiceHealth
  selectedIncident?: HealthIncident
  timeRange: string
  autoRefresh: boolean
  refreshInterval: number
  filters: {
    services: string[]
    severities: IncidentSeverity[]
    metrics: MetricType[]
    showUnhealthyOnly: boolean
  }
}

// Error Types
export class HealthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'HealthError'
  }
}

export class ServiceUnavailableError extends HealthError {
  constructor(serviceName: string) {
    super(`Service ${serviceName} is currently unavailable`, 'SERVICE_UNAVAILABLE', 503)
  }
}

export class MetricNotFoundError extends HealthError {
  constructor(metric: string) {
    super(`Metric ${metric} not found`, 'METRIC_NOT_FOUND', 404)
  }
}