import { NextRequest, NextResponse } from 'next/server'

interface AlertThreshold {
  metric: string
  warning: number
  critical: number
  unit: string
  description: string
}

interface SystemAlert {
  id: string
  metric: string
  currentValue: number
  threshold: number
  severity: 'warning' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
  autoRemediation?: string
}

// Enhanced Alert Thresholds for Keycloak Optimization
const ALERT_THRESHOLDS: AlertThreshold[] = [
  {
    metric: 'system.memory.usage',
    warning: 90,
    critical: 95,
    unit: '%',
    description: 'System memory usage - triggers before Keycloak issues'
  },
  {
    metric: 'keycloak.response_time',
    warning: 200,
    critical: 500,
    unit: 'ms',
    description: 'Keycloak authentication response time'
  },
  {
    metric: 'keycloak.error_rate',
    warning: 1,
    critical: 3,
    unit: '%',
    description: 'Keycloak authentication error rate'
  },
  {
    metric: 'keycloak.cpu_usage',
    warning: 70,
    critical: 85,
    unit: '%',
    description: 'Keycloak service CPU utilization'
  },
  {
    metric: 'keycloak.memory_usage',
    warning: 80,
    critical: 90,
    unit: '%',
    description: 'Keycloak service memory utilization'
  },
  {
    metric: 'postgres.connection_pool',
    warning: 80,
    critical: 95,
    unit: '%',
    description: 'PostgreSQL connection pool utilization'
  },
  {
    metric: 'postgres.response_time',
    warning: 100,
    critical: 300,
    unit: 'ms',
    description: 'PostgreSQL query response time'
  },
  {
    metric: 'system.disk.usage',
    warning: 80,
    critical: 90,
    unit: '%',
    description: 'System disk space usage'
  }
]

// Auto-remediation actions
const AUTO_REMEDIATION: Record<string, string> = {
  'system.memory.usage': 'Clear system caches and restart non-critical services',
  'keycloak.response_time': 'Restart Keycloak service and clear authentication cache',
  'keycloak.error_rate': 'Check database connectivity and restart Keycloak if needed',
  'postgres.connection_pool': 'Kill long-running queries and restart PostgreSQL connections',
  'system.disk.usage': 'Clean log files and temporary data'
}

async function getSystemMetrics() {
  try {
    // Get current infrastructure metrics
    const response = await fetch('http://localhost:3000/api/health/infrastructure', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch infrastructure metrics')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return null
  }
}

async function getServiceMetrics() {
  try {
    // Get current service health metrics
    const response = await fetch('http://localhost:3000/api/health/services', {
      method: 'GET', 
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch service metrics')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching service metrics:', error)
    return null
  }
}

function checkThresholds(metrics: any, services: any): SystemAlert[] {
  const alerts: SystemAlert[] = []
  
  if (!metrics || !services) return alerts
  
  // Check system metrics
  ALERT_THRESHOLDS.forEach(threshold => {
    let currentValue: number | null = null
    let metricName = ''
    
    switch (threshold.metric) {
      case 'system.memory.usage':
        currentValue = metrics.system?.memory?.usage || 0
        metricName = 'System Memory'
        break
      case 'system.disk.usage':
        currentValue = metrics.system?.disk?.usage || 0
        metricName = 'System Disk'
        break
      case 'keycloak.response_time':
        const keycloak = services.find((s: any) => s.id === 'keycloak-auth')
        currentValue = keycloak?.avgLatency || 0
        metricName = 'Keycloak Response Time'
        break
      case 'keycloak.error_rate':
        const keycloakService = services.find((s: any) => s.id === 'keycloak-auth')
        currentValue = keycloakService?.errorRate || 0
        metricName = 'Keycloak Error Rate'
        break
      case 'keycloak.cpu_usage':
        currentValue = metrics.services?.['keycloak-auth']?.cpu || 0
        metricName = 'Keycloak CPU Usage'
        break
      case 'keycloak.memory_usage':
        currentValue = metrics.services?.['keycloak-auth']?.memory || 0
        metricName = 'Keycloak Memory Usage'
        break
      case 'postgres.response_time':
        const postgres = services.find((s: any) => s.id === 'postgres-primary')
        currentValue = postgres?.avgLatency || 0
        metricName = 'PostgreSQL Response Time'
        break
    }
    
    if (currentValue !== null) {
      // Check for critical threshold
      if (currentValue >= threshold.critical) {
        alerts.push({
          id: `alert-${Date.now()}-${threshold.metric}`,
          metric: threshold.metric,
          currentValue,
          threshold: threshold.critical,
          severity: 'critical',
          message: `🚨 CRITICAL: ${metricName} is ${currentValue}${threshold.unit} (threshold: ${threshold.critical}${threshold.unit})`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          autoRemediation: AUTO_REMEDIATION[threshold.metric]
        })
      }
      // Check for warning threshold  
      else if (currentValue >= threshold.warning) {
        alerts.push({
          id: `alert-${Date.now()}-${threshold.metric}`,
          metric: threshold.metric,
          currentValue,
          threshold: threshold.warning,
          severity: 'warning',
          message: `⚠️ WARNING: ${metricName} is ${currentValue}${threshold.unit} (threshold: ${threshold.warning}${threshold.unit})`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          autoRemediation: AUTO_REMEDIATION[threshold.metric]
        })
      }
    }
  })
  
  return alerts
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Alert monitoring API called at:', new Date().toISOString())
    
    // Get current metrics
    const [infrastructureMetrics, serviceMetrics] = await Promise.all([
      getSystemMetrics(),
      getServiceMetrics()
    ])
    
    // Check all thresholds
    const activeAlerts = checkThresholds(infrastructureMetrics, serviceMetrics)
    
    console.log(`📊 Alert check completed: ${activeAlerts.length} active alerts`)
    
    if (activeAlerts.length > 0) {
      console.log('🚨 Active alerts:', activeAlerts.map(a => ({
        severity: a.severity,
        metric: a.metric,
        value: a.currentValue
      })))
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      alertCount: activeAlerts.length,
      alerts: activeAlerts,
      thresholds: ALERT_THRESHOLDS,
      systemStatus: activeAlerts.length === 0 ? 'healthy' : 
                   activeAlerts.some(a => a.severity === 'critical') ? 'critical' : 'warning'
    })
    
  } catch (error) {
    console.error('❌ Alert monitoring API error:', error)
    return NextResponse.json(
      { error: 'Failed to check system alerts' },
      { status: 500 }
    )
  }
}