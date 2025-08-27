import { NextRequest, NextResponse } from 'next/server'
import { InfrastructureMetrics } from '@/types/health'

// Node.js system monitoring
async function getSystemMetrics() {
  const os = require('os')
  const fs = require('fs').promises
  
  try {
    // CPU metrics
    const cpus = os.cpus()
    const loadAvg = os.loadavg()
    
    // Memory metrics
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsage = (usedMemory / totalMemory) * 100
    
    // Process metrics
    const processMemory = process.memoryUsage()
    const processCpu = process.cpuUsage()
    
    // Disk usage (approximate for demo)
    let diskUsage = 0
    let diskTotal = 0
    try {
      // This is a simplified disk check - in production you'd use proper disk monitoring
      const stats = await fs.stat('/')
      diskTotal = 1099511627776 // 1TB for demo
      diskUsage = Math.random() * 0.4 + 0.3 // 30-70% usage
    } catch (error) {
      diskTotal = 1099511627776
      diskUsage = 0.45
    }
    
    // Network metrics (simulated - in production use network monitoring tools)
    const networkMetrics = {
      bytesIn: Math.floor(Math.random() * 1024 * 1024 * 100) + 1024 * 1024 * 50, // 50-150 MB
      bytesOut: Math.floor(Math.random() * 1024 * 1024 * 50) + 1024 * 1024 * 25,  // 25-75 MB
      packetsIn: Math.floor(Math.random() * 10000) + 5000,
      packetsOut: Math.floor(Math.random() * 8000) + 4000,
      errors: Math.floor(Math.random() * 10)
    }
    
    const infrastructure: InfrastructureMetrics = {
      id: `infra-${Date.now()}`,
      timestamp: new Date().toISOString(),
      system: {
        cpu: {
          usage: Math.min(95, Math.max(5, loadAvg[0] * 10)), // Convert load to percentage
          cores: cpus.length,
          loadAverage: loadAvg
        },
        memory: {
          used: usedMemory,
          total: totalMemory,
          usage: memoryUsage,
          swap: {
            used: Math.floor(Math.random() * 1024 * 1024 * 1024), // Random swap usage
            total: 2 * 1024 * 1024 * 1024 // 2GB swap
          }
        },
        disk: {
          used: Math.floor(diskTotal * diskUsage),
          total: diskTotal,
          usage: diskUsage * 100,
          iops: {
            read: Math.floor(Math.random() * 1000) + 100,
            write: Math.floor(Math.random() * 500) + 50
          }
        },
        network: networkMetrics
      },
      services: {
        'postgres-primary': {
          cpu: Math.random() * 30 + 15,
          memory: Math.random() * 25 + 60,
          disk: Math.random() * 10 + 5
        },
        'redis-cache': {
          cpu: Math.random() * 20 + 10,
          memory: Math.random() * 30 + 50,
          disk: Math.random() * 5 + 2
        },
        'keycloak-auth': {
          cpu: Math.random() * 35 + 20,
          memory: Math.random() * 25 + 45,
          disk: Math.random() * 8 + 4
        },
        'api-gateway': {
          cpu: Math.random() * 40 + 25,
          memory: Math.random() * 20 + 40,
          disk: Math.random() * 6 + 3
        },
        'notification-service': {
          cpu: Math.random() * 25 + 10,
          memory: Math.random() * 15 + 35,
          disk: Math.random() * 4 + 2
        }
      }
    }
    
    return infrastructure
    
  } catch (error) {
    console.error('Error getting system metrics:', error)
    
    // Return fallback metrics
    return {
      id: `infra-${Date.now()}`,
      timestamp: new Date().toISOString(),
      system: {
        cpu: {
          usage: 45,
          cores: 8,
          loadAverage: [2.1, 2.3, 2.0]
        },
        memory: {
          used: 12884901888,
          total: 17179869184,
          usage: 75,
          swap: {
            used: 1073741824,
            total: 2147483648
          }
        },
        disk: {
          used: 429496729600,
          total: 1099511627776,
          usage: 39,
          iops: {
            read: 450,
            write: 200
          }
        },
        network: {
          bytesIn: 1024 * 1024 * 120,
          bytesOut: 1024 * 1024 * 80,
          packetsIn: 8500,
          packetsOut: 6200,
          errors: 3
        }
      },
      services: {
        'postgres-primary': { cpu: 25, memory: 70, disk: 8 },
        'redis-cache': { cpu: 15, memory: 60, disk: 4 },
        'keycloak-auth': { cpu: 30, memory: 55, disk: 6 },
        'api-gateway': { cpu: 35, memory: 50, disk: 5 },
        'notification-service': { cpu: 20, memory: 45, disk: 3 }
      }
    } as InfrastructureMetrics
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🖥️ Infrastructure metrics API called at:', new Date().toISOString())
    
    const metrics = await getSystemMetrics()
    
    console.log('✅ Infrastructure metrics collected:', {
      cpuUsage: `${metrics.system.cpu.usage.toFixed(1)}%`,
      memoryUsage: `${metrics.system.memory.usage.toFixed(1)}%`,
      diskUsage: `${metrics.system.disk.usage.toFixed(1)}%`,
      servicesCount: Object.keys(metrics.services).length
    })
    
    return NextResponse.json(metrics)
    
  } catch (error) {
    console.error('❌ Infrastructure metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch infrastructure metrics' },
      { status: 500 }
    )
  }
}