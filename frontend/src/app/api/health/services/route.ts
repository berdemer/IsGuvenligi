import { NextRequest, NextResponse } from 'next/server'
import { ServiceHealth } from '@/types/health'

// Service health checkers
async function checkPostgreSQLHealth() {
  try {
    const startTime = Date.now()
    
    // Simulate database connection and query
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.05 // 95% chance of being healthy
    
    return {
      id: 'postgres-primary',
      name: 'PostgreSQL Primary',
      type: 'database',
      status: isHealthy ? 'healthy' : (Math.random() > 0.5 ? 'warning' : 'critical'),
      uptime: isHealthy ? 99.5 + Math.random() * 0.5 : 85 + Math.random() * 10,
      avgLatency: responseTime,
      errorRate: isHealthy ? Math.random() * 0.05 : Math.random() * 2,
      lastCheck: new Date().toISOString(),
      healthScore: isHealthy ? 95 + Math.floor(Math.random() * 5) : 50 + Math.floor(Math.random() * 30),
      version: '14.9',
      endpoint: 'postgres://primary:5432',
      dependencies: [],
      metrics: {
        responseTime: {
          timestamp: new Date().toISOString(),
          value: responseTime,
          unit: 'ms',
          threshold: { warning: 100, critical: 500 }
        },
        cpu: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 50 + 20,
          unit: '%'
        },
        memory: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 30 + 60,
          unit: '%',
          threshold: { warning: 80, critical: 90 }
        },
        errorRate: {
          timestamp: new Date().toISOString(),
          value: isHealthy ? Math.random() * 0.05 : Math.random() * 2,
          unit: '%'
        }
      }
    } as ServiceHealth
  } catch (error) {
    return {
      id: 'postgres-primary',
      name: 'PostgreSQL Primary',
      type: 'database',
      status: 'critical',
      uptime: 0,
      avgLatency: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      healthScore: 0,
      dependencies: [],
      metrics: {}
    } as ServiceHealth
  }
}

async function checkRedisHealth() {
  try {
    const startTime = Date.now()
    
    // Simulate Redis ping
    await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 5))
    
    const responseTime = Date.now() - startTime
    const memoryUsage = Math.random() * 40 + 60 // 60-100%
    const isHealthy = memoryUsage < 85
    
    return {
      id: 'redis-cache',
      name: 'Redis Cache',
      type: 'redis',
      status: isHealthy ? 'healthy' : (memoryUsage < 95 ? 'warning' : 'critical'),
      uptime: isHealthy ? 98.5 + Math.random() * 1.5 : 85 + Math.random() * 10,
      avgLatency: responseTime,
      errorRate: isHealthy ? Math.random() * 0.02 : Math.random() * 1,
      lastCheck: new Date().toISOString(),
      healthScore: isHealthy ? 90 + Math.floor(Math.random() * 10) : 40 + Math.floor(Math.random() * 40),
      version: '7.0.11',
      endpoint: 'redis://cache:6379',
      dependencies: [],
      metrics: {
        responseTime: {
          timestamp: new Date().toISOString(),
          value: responseTime,
          unit: 'ms',
          threshold: { warning: 50, critical: 200 }
        },
        memory: {
          timestamp: new Date().toISOString(),
          value: memoryUsage,
          unit: '%',
          threshold: { warning: 80, critical: 95 }
        },
        cpu: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 30 + 10,
          unit: '%'
        },
        throughput: {
          timestamp: new Date().toISOString(),
          value: Math.floor(Math.random() * 1000) + 500,
          unit: 'ops/sec'
        }
      }
    } as ServiceHealth
  } catch (error) {
    return {
      id: 'redis-cache',
      name: 'Redis Cache',
      type: 'redis',
      status: 'critical',
      uptime: 0,
      avgLatency: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      healthScore: 0,
      dependencies: [],
      metrics: {}
    } as ServiceHealth
  }
}

async function checkKeycloakHealth() {
  try {
    const startTime = Date.now()
    
    // Simulate HTTP health check to Keycloak
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.1 // 90% chance of being healthy
    
    return {
      id: 'keycloak-auth',
      name: 'Keycloak Auth',
      type: 'keycloak',
      status: isHealthy ? 'healthy' : 'warning',
      uptime: isHealthy ? 99.2 + Math.random() * 0.8 : 90 + Math.random() * 8,
      avgLatency: responseTime,
      errorRate: isHealthy ? Math.random() * 0.1 : Math.random() * 3,
      lastCheck: new Date().toISOString(),
      healthScore: isHealthy ? 88 + Math.floor(Math.random() * 12) : 60 + Math.floor(Math.random() * 25),
      version: '22.0.1',
      endpoint: 'https://auth.localhost:8080/health',
      dependencies: ['postgres-primary'],
      metrics: {
        responseTime: {
          timestamp: new Date().toISOString(),
          value: responseTime,
          unit: 'ms',
          threshold: { warning: 200, critical: 1000 }
        },
        cpu: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 40 + 25,
          unit: '%'
        },
        memory: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 25 + 55,
          unit: '%'
        },
        errorRate: {
          timestamp: new Date().toISOString(),
          value: isHealthy ? Math.random() * 0.1 : Math.random() * 3,
          unit: '%'
        }
      }
    } as ServiceHealth
  } catch (error) {
    return {
      id: 'keycloak-auth',
      name: 'Keycloak Auth',
      type: 'keycloak',
      status: 'critical',
      uptime: 0,
      avgLatency: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      healthScore: 0,
      dependencies: [],
      metrics: {}
    } as ServiceHealth
  }
}

async function checkAPIGatewayHealth() {
  try {
    const startTime = Date.now()
    
    // Simulate API Gateway health check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 30))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.08 // 92% chance of being healthy
    
    return {
      id: 'api-gateway',
      name: 'API Gateway',
      type: 'api',
      status: isHealthy ? 'healthy' : 'warning',
      uptime: isHealthy ? 99.8 + Math.random() * 0.2 : 95 + Math.random() * 4,
      avgLatency: responseTime,
      errorRate: isHealthy ? Math.random() * 0.05 : Math.random() * 1.5,
      lastCheck: new Date().toISOString(),
      healthScore: isHealthy ? 92 + Math.floor(Math.random() * 8) : 65 + Math.floor(Math.random() * 20),
      version: '1.2.3',
      endpoint: 'https://api.localhost:3001/health',
      dependencies: ['postgres-primary', 'redis-cache', 'keycloak-auth'],
      metrics: {
        responseTime: {
          timestamp: new Date().toISOString(),
          value: responseTime,
          unit: 'ms',
          threshold: { warning: 200, critical: 500 }
        },
        throughput: {
          timestamp: new Date().toISOString(),
          value: Math.floor(Math.random() * 500) + 800,
          unit: 'req/sec'
        },
        cpu: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 35 + 20,
          unit: '%'
        },
        memory: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 25 + 45,
          unit: '%'
        },
        errorRate: {
          timestamp: new Date().toISOString(),
          value: isHealthy ? Math.random() * 0.05 : Math.random() * 1.5,
          unit: '%'
        }
      }
    } as ServiceHealth
  } catch (error) {
    return {
      id: 'api-gateway',
      name: 'API Gateway',
      type: 'api',
      status: 'critical',
      uptime: 0,
      avgLatency: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      healthScore: 0,
      dependencies: [],
      metrics: {}
    } as ServiceHealth
  }
}

async function checkNotificationService() {
  try {
    const startTime = Date.now()
    
    // Simulate notification service health check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 60 + 20))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.12 // 88% chance of being healthy
    
    return {
      id: 'notification-service',
      name: 'Notification Service',
      type: 'notification',
      status: isHealthy ? 'healthy' : 'warning',
      uptime: isHealthy ? 99.1 + Math.random() * 0.9 : 88 + Math.random() * 10,
      avgLatency: responseTime,
      errorRate: isHealthy ? Math.random() * 0.08 : Math.random() * 2,
      lastCheck: new Date().toISOString(),
      healthScore: isHealthy ? 85 + Math.floor(Math.random() * 15) : 55 + Math.floor(Math.random() * 25),
      version: '1.1.8',
      endpoint: 'https://notifications.localhost:3002/health',
      dependencies: ['redis-cache', 'postgres-primary'],
      metrics: {
        responseTime: {
          timestamp: new Date().toISOString(),
          value: responseTime,
          unit: 'ms'
        },
        cpu: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 25 + 15,
          unit: '%'
        },
        memory: {
          timestamp: new Date().toISOString(),
          value: Math.random() * 20 + 40,
          unit: '%'
        },
        errorRate: {
          timestamp: new Date().toISOString(),
          value: isHealthy ? Math.random() * 0.08 : Math.random() * 2,
          unit: '%'
        }
      }
    } as ServiceHealth
  } catch (error) {
    return {
      id: 'notification-service',
      name: 'Notification Service',
      type: 'notification',
      status: 'critical',
      uptime: 0,
      avgLatency: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      healthScore: 0,
      dependencies: [],
      metrics: {}
    } as ServiceHealth
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Health Services API called at:', new Date().toISOString())
    
    // Check all services in parallel for better performance
    const [postgresql, redis, keycloak, apiGateway, notifications] = await Promise.all([
      checkPostgreSQLHealth(),
      checkRedisHealth(),
      checkKeycloakHealth(),
      checkAPIGatewayHealth(),
      checkNotificationService()
    ])
    
    const services = [postgresql, redis, keycloak, apiGateway, notifications]
    
    console.log('✅ Health check completed. Services:', services.map(s => ({
      name: s.name,
      status: s.status,
      healthScore: s.healthScore,
      responseTime: s.avgLatency
    })))
    
    return NextResponse.json(services)
    
  } catch (error) {
    console.error('❌ Health services API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services health status' },
      { status: 500 }
    )
  }
}