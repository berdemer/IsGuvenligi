import { useTranslations } from 'next-intl'

export type MetricType = 'cpu' | 'memory' | 'disk' | 'responseTime' | 'network' | 'application' | 'database'
export type ThresholdLevel = 'warning' | 'critical'
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'
export type MonitoringStatus = 'monitoring' | 'idle' | 'alerting' | 'maintenance' | 'error'

export interface HealthThreshold {
  warning: number
  critical: number
  unit: string
}

export interface HealthMonitoringConfig {
  enabled: boolean
  checkInterval: number // seconds
  dataRetention: number // days
  alertingEnabled: boolean
  thresholds: Record<MetricType, HealthThreshold>
}

export interface MetricValue {
  type: MetricType
  value: number
  unit: string
  timestamp: Date
  status: HealthStatus
}

export interface HealthAlert {
  id: string
  metric: MetricType
  level: ThresholdLevel
  value: number
  threshold: number
  timestamp: Date
  acknowledged: boolean
  message: string
}

/**
 * Default health monitoring configuration
 */
export const DEFAULT_HEALTH_CONFIG: HealthMonitoringConfig = {
  enabled: true,
  checkInterval: 30,
  dataRetention: 30,
  alertingEnabled: true,
  thresholds: {
    cpu: { warning: 70, critical: 90, unit: '%' },
    memory: { warning: 80, critical: 95, unit: '%' },
    disk: { warning: 85, critical: 95, unit: '%' },
    responseTime: { warning: 1000, critical: 5000, unit: 'ms' },
    network: { warning: 80, critical: 95, unit: '%' },
    application: { warning: 75, critical: 90, unit: '%' },
    database: { warning: 70, critical: 90, unit: '%' }
  }
}

/**
 * Hook to get health monitoring translations
 */
export function useHealthMonitoringTranslations() {
  const t = useTranslations('health.monitoring')
  const tHealth = useTranslations('health')
  const tCommon = useTranslations('common')

  return {
    // Main sections
    title: t('title'),
    description: t('description'),
    enabled: t('enabled'),
    alertThresholds: t('alertThresholds'),
    monitoringConfiguration: t('monitoringConfiguration'),
    
    // Thresholds
    getThresholdLabel: (metric: MetricType) => t(`thresholds.${metric}`),
    getThresholdLevelLabel: (level: ThresholdLevel) => t(`thresholds.${level}`),
    
    // Configuration
    getConfigLabel: (key: string) => t(`configuration.${key}`),
    
    // Metrics
    getMetricLabel: (metric: MetricType) => t(`metrics.${metric}`),
    
    // Units
    getUnitLabel: (unit: string) => {
      const unitKey = unit.replace('%', 'percentage').replace('ms', 'milliseconds')
      return t(`units.${unitKey}`)
    },
    
    // Status
    getStatusLabel: (status: HealthStatus | MonitoringStatus) => {
      if (['monitoring', 'idle', 'alerting', 'maintenance', 'error'].includes(status)) {
        return t(`status.${status}`)
      }
      return tHealth(`status.${status}`)
    },
    
    // Alerts
    getAlertMessage: (type: string, metric?: MetricType, value?: number, unit?: string) => {
      if (type === 'thresholdExceeded' && metric && value !== undefined && unit) {
        return t('alerts.thresholdExceeded', { 
          metric: t(`metrics.${metric}`),
          value,
          unit 
        })
      }
      return t(`alerts.${type}`)
    },

    // Common actions
    save: tCommon('save'),
    cancel: tCommon('cancel'),
    reset: tCommon('reset'),
    enable: tCommon('enabled'),
    disable: tCommon('disabled')
  }
}

/**
 * Determine health status based on metric value and thresholds
 */
export function getHealthStatus(
  value: number, 
  threshold: HealthThreshold
): HealthStatus {
  if (value >= threshold.critical) {
    return 'critical'
  } else if (value >= threshold.warning) {
    return 'warning'
  }
  return 'healthy'
}

/**
 * Format metric value with appropriate unit and localization
 */
export function formatMetricValue(
  value: number, 
  unit: string, 
  locale: string = 'tr'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: unit === '%' ? 1 : 0
  })
  
  return `${formatter.format(value)}${unit}`
}

/**
 * Calculate overall health score from multiple metrics
 */
export function calculateHealthScore(metrics: MetricValue[]): number {
  if (metrics.length === 0) return 100

  const statusWeights = {
    healthy: 100,
    warning: 60,
    critical: 20,
    unknown: 50
  }

  const totalScore = metrics.reduce((sum, metric) => {
    return sum + statusWeights[metric.status]
  }, 0)

  return Math.round(totalScore / metrics.length)
}

/**
 * Get health score color based on score value
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

/**
 * Generate health alert from metric value
 */
export function generateHealthAlert(
  metric: MetricValue,
  threshold: HealthThreshold,
  config: HealthMonitoringConfig
): HealthAlert | null {
  if (!config.alertingEnabled || metric.status === 'healthy' || metric.status === 'unknown') {
    return null
  }

  const level: ThresholdLevel = metric.value >= threshold.critical ? 'critical' : 'warning'
  const thresholdValue = level === 'critical' ? threshold.critical : threshold.warning

  return {
    id: `${metric.type}-${Date.now()}`,
    metric: metric.type,
    level,
    value: metric.value,
    threshold: thresholdValue,
    timestamp: metric.timestamp,
    acknowledged: false,
    message: `${metric.type.toUpperCase()} ${level} threshold exceeded: ${metric.value}${metric.unit} >= ${thresholdValue}${metric.unit}`
  }
}

/**
 * Validate health monitoring configuration
 */
export function validateHealthConfig(config: Partial<HealthMonitoringConfig>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (config.checkInterval !== undefined) {
    if (config.checkInterval < 5 || config.checkInterval > 3600) {
      errors.push('Check interval must be between 5 and 3600 seconds')
    }
  }

  if (config.dataRetention !== undefined) {
    if (config.dataRetention < 1 || config.dataRetention > 365) {
      errors.push('Data retention must be between 1 and 365 days')
    }
  }

  if (config.thresholds) {
    Object.entries(config.thresholds).forEach(([metric, threshold]) => {
      if (threshold.warning >= threshold.critical) {
        errors.push(`Warning threshold must be less than critical threshold for ${metric}`)
      }
      if (threshold.warning < 0 || threshold.critical < 0) {
        errors.push(`Thresholds must be positive values for ${metric}`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get metric icon based on type
 */
export function getMetricIcon(metric: MetricType): string {
  const icons = {
    cpu: '🖥️',
    memory: '💾',
    disk: '💿',
    responseTime: '⏱️',
    network: '🌐',
    application: '📱',
    database: '🗄️'
  }
  return icons[metric] || '📊'
}

/**
 * Get threshold level color
 */
export function getThresholdColor(level: ThresholdLevel): string {
  return level === 'critical' ? 'text-red-600' : 'text-yellow-600'
}

/**
 * Format check interval for display
 */
export function formatCheckInterval(seconds: number, locale: string = 'tr'): string {
  if (seconds < 60) {
    return `${seconds} ${locale === 'tr' ? 'saniye' : 'seconds'}`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${locale === 'tr' ? 'dakika' : 'minutes'}`
  } else {
    const hours = Math.floor(seconds / 3600)
    return `${hours} ${locale === 'tr' ? 'saat' : 'hours'}`
  }
}

/**
 * Format data retention for display
 */
export function formatDataRetention(days: number, locale: string = 'tr'): string {
  return `${days} ${locale === 'tr' ? 'gün' : 'days'}`
}