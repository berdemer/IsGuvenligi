'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  SystemOverview, 
  ServiceHealth, 
  InfrastructureMetrics, 
  HealthIncident, 
  HealthAlert,
  HealthUpdateEvent
} from '@/types/health'
import toast from 'react-hot-toast'

interface UseHealthMonitoringOptions {
  autoRefresh?: boolean
  refreshInterval?: number // seconds
  enableRealtime?: boolean
  onAlert?: (alert: HealthAlert) => void
  onIncident?: (incident: HealthIncident) => void
  onServiceStatusChange?: (service: ServiceHealth) => void
}

interface HealthMonitoringState {
  overview: SystemOverview | null
  services: ServiceHealth[]
  infrastructure: InfrastructureMetrics | null
  incidents: HealthIncident[]
  alerts: HealthAlert[]
  loading: boolean
  connected: boolean
  lastUpdate: string | null
  error: string | null
}

// Simulated WebSocket connection for real-time updates
class HealthWebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private subscribers: Set<(event: HealthUpdateEvent) => void> = new Set()
  private isConnecting = false

  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true

    try {
      // Simulate WebSocket connection for demonstration
      this.simulateWebSocketConnection()
    } catch (error) {
      console.error('Failed to connect to health monitoring WebSocket:', error)
      this.scheduleReconnect()
    } finally {
      this.isConnecting = false
    }
  }

  private simulateWebSocketConnection() {
    // Simulate WebSocket events for demonstration
    this.ws = {
      readyState: WebSocket.OPEN,
      close: () => {
        this.ws = null
      },
      send: () => {}
    } as unknown as WebSocket

    this.reconnectAttempts = 0
    this.isConnecting = false
    
    // Simulate periodic health updates
    this.startSimulatedUpdates()
    
    // Notify connection established
    console.log('Health WebSocket connected (simulated)')
  }

  private startSimulatedUpdates() {
    // Simulate service status changes every 2 minutes (less frequent)
    const serviceStatusInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of update
        const event: HealthUpdateEvent = {
          type: 'service_status',
          timestamp: new Date().toISOString(),
          data: {
            serviceId: ['api-gateway', 'postgres-primary', 'redis-cache'][Math.floor(Math.random() * 3)],
            status: Math.random() > 0.8 ? 'warning' : 'healthy',
            latency: Math.floor(Math.random() * 200) + 50
          },
          source: 'health-monitor',
          priority: 'medium'
        }
        this.notifySubscribers(event)
      }
    }, 120000) // 2 minutes

    // Store intervals for cleanup
    this.intervals = [serviceStatusInterval]
  }

  private intervals: NodeJS.Timeout[] = []

  private notifySubscribers(event: HealthUpdateEvent) {
    this.subscribers.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in WebSocket subscriber:', error)
      }
    })
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
      setTimeout(() => {
        this.reconnectAttempts++
        this.connect()
      }, delay)
    }
  }

  subscribe(callback: (event: HealthUpdateEvent) => void) {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers.clear()
    this.isConnecting = false
    
    // Clear all simulation intervals
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Global WebSocket service instance
const healthWS = new HealthWebSocketService()

// Real API service for health data
class HealthAPIService {
  static async fetchOverview(): Promise<SystemOverview> {
    console.log('🔍 Overview API called at:', new Date().toISOString())
    
    try {
      const response = await fetch('/api/health/overview', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        console.error('❌ Overview API HTTP error:', response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Overview data fetched successfully:', {
        healthScore: data.healthScore,
        uptime: data.uptime,
        services: data.services?.length || 0
      })
      return data
      
    } catch (error) {
      console.error('❌ Overview API fetch error:', error)
      throw error
    }
  }

  static async fetchServices(): Promise<ServiceHealth[]> {
    console.log('🔄 Fetching services health from real API...')
    
    try {
      const response = await fetch('/api/health/services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Services health fetched successfully:', data.length, 'services')
      return data
      
    } catch (error) {
      console.error('❌ Failed to fetch services health:', error)
      throw error
    }
  }

  static async fetchInfrastructure(): Promise<InfrastructureMetrics> {
    console.log('🔄 Fetching infrastructure metrics from real API...')
    
    try {
      const response = await fetch('/api/health/infrastructure', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Infrastructure metrics fetched successfully')
      return data
      
    } catch (error) {
      console.error('❌ Failed to fetch infrastructure metrics:', error)
      throw error
    }
  }

  // Service management action
  static async executeServiceAction(serviceId: string, action: string): Promise<any> {
    console.log(`🎯 Executing ${action} on service ${serviceId}`)
    
    try {
      const response = await fetch(`/api/services/${serviceId}/${action}`, {
        method: action === 'logs' ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`✅ Service action result:`, result)
      return result
      
    } catch (error) {
      console.error(`❌ Service action error:`, error)
      throw error
    }
  }
}

export function useHealthMonitoring(options: UseHealthMonitoringOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 10,
    enableRealtime = true,
    onAlert,
    onIncident,
    onServiceStatusChange
  } = options

  const [state, setState] = useState<HealthMonitoringState>({
    overview: null,
    services: [],
    infrastructure: null,
    incidents: [],
    alerts: [],
    loading: true, // Start with loading = true
    connected: true,
    lastUpdate: null,
    error: null
  })

  const loadingRef = useRef(false)
  const mountedRef = useRef(true)
  const initializedRef = useRef(false)

  // Load initial data
  const loadData = useCallback(async () => {
    if (loadingRef.current) return

    loadingRef.current = true
    
    setState(prev => ({ 
      ...prev, 
      loading: true,
      error: null 
    }))

    try {
      console.log('🔄 Starting health data fetch...')
      const [overview, services, infrastructure] = await Promise.all([
        HealthAPIService.fetchOverview(),
        HealthAPIService.fetchServices(),
        HealthAPIService.fetchInfrastructure()
      ])

      console.log('✅ All health data loaded successfully:', { 
        overview: !!overview, 
        overviewHealthScore: overview?.healthScore,
        services: services.length, 
        infrastructure: !!infrastructure 
      })

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          overview,
          services,
          infrastructure,
          loading: false,
          connected: true,
          lastUpdate: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('❌ Failed to load health data:', error)
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load health data'
        }))
        toast.error('Failed to load health monitoring data')
      }
    } finally {
      loadingRef.current = false
    }
  }, [])

  // Store callback refs to prevent infinite loops
  const callbackRefs = useRef({
    onAlert,
    onIncident,
    onServiceStatusChange
  })

  // Update refs when callbacks change
  useEffect(() => {
    callbackRefs.current = {
      onAlert,
      onIncident,
      onServiceStatusChange
    }
  }, [onAlert, onIncident, onServiceStatusChange])

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((event: HealthUpdateEvent) => {
    if (!mountedRef.current) return

    setState(prev => ({ ...prev, lastUpdate: event.timestamp }))

    switch (event.type) {
      case 'service_status':
        if (event.data.serviceId && callbackRefs.current.onServiceStatusChange) {
          toast.success(`Service ${event.data.serviceId} status updated`)
        }
        break

      case 'alert':
        if (event.data.alert && callbackRefs.current.onAlert) {
          callbackRefs.current.onAlert(event.data.alert)
          toast.error(`New alert: ${event.data.alert.message}`)
          
          setState(prev => ({
            ...prev,
            alerts: [event.data.alert, ...prev.alerts.slice(0, 9)]
          }))
        }
        break

      case 'incident':
        if (event.data.incident && callbackRefs.current.onIncident) {
          callbackRefs.current.onIncident(event.data.incident)
          toast.error(`New incident: ${event.data.incident.title}`)
        }
        break

      case 'system_health':
        if (event.data.healthScore !== undefined) {
          setState(prev => ({
            ...prev,
            overview: prev.overview ? {
              ...prev.overview,
              healthScore: event.data.healthScore,
              uptime: event.data.uptime || prev.overview.uptime,
              avgResponseTime: event.data.avgResponseTime || prev.overview.avgResponseTime,
              errorRate: event.data.errorRate || prev.overview.errorRate,
              timestamp: event.timestamp
            } : null
          }))
        }
        break
    }
  }, [])

  // Setup real-time connection
  useEffect(() => {
    if (!enableRealtime) return

    console.log('Setting up real-time connection...')
    healthWS.connect()
    const unsubscribe = healthWS.subscribe(handleRealtimeUpdate)

    const isConnected = healthWS.isConnected()
    console.log('WebSocket connected:', isConnected)
    setState(prev => ({ ...prev, connected: isConnected }))

    return () => {
      console.log('Cleaning up real-time connection')
      unsubscribe()
    }
  }, [enableRealtime, handleRealtimeUpdate])

  // Setup auto-refresh and initial data load
  useEffect(() => {
    console.log('🚀 useHealthMonitoring hook initialized')
    console.log('🚀 Initial data load triggered')
    loadData() // Direct initial load
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered')
      loadData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, loadData])

  // Connection status monitoring
  useEffect(() => {
    if (!enableRealtime) return

    const checkConnection = () => {
      setState(prev => ({ 
        ...prev, 
        connected: healthWS.isConnected() 
      }))
    }

    const interval = setInterval(checkConnection, 5000)
    return () => clearInterval(interval)
  }, [enableRealtime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Manual refresh function
  const refresh = useCallback(() => {
    loadData()
  }, [loadData])

  // Connect/disconnect functions
  const connect = useCallback(() => {
    healthWS.connect()
  }, [])

  const disconnect = useCallback(() => {
    healthWS.disconnect()
    setState(prev => ({ ...prev, connected: false }))
  }, [])

  return {
    // State
    ...state,
    
    // Actions
    refresh,
    connect,
    disconnect,
    executeServiceAction: HealthAPIService.executeServiceAction,
    
    // Utils
    isLoading: state.loading,
    hasError: !!state.error,
    isConnected: state.connected && enableRealtime
  }
}

// Export WebSocket service for advanced use cases
export { healthWS as HealthWebSocketService }

// Export types for convenience
export type { HealthUpdateEvent, UseHealthMonitoringOptions, HealthMonitoringState }