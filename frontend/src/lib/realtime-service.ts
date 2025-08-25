"use client"

import { ActiveSession, SessionUpdate, RealtimeConnectionStatus } from "@/types/session"

export type SessionEventType = 
  | 'session_created'
  | 'session_updated' 
  | 'session_revoked'
  | 'session_flagged'
  | 'risk_score_updated'
  | 'anomaly_detected'
  | 'heartbeat'

export interface SessionEvent {
  type: SessionEventType
  sessionId: string
  timestamp: number
  data: any
}

export interface RealtimeServiceConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
}

export class RealtimeSessionService {
  private eventSource: EventSource | null = null
  private websocket: WebSocket | null = null
  private config: RealtimeServiceConfig
  private listeners: Map<SessionEventType, Set<(event: SessionEvent) => void>> = new Map()
  private connectionStatus: RealtimeConnectionStatus
  private statusListeners: Set<(status: RealtimeConnectionStatus) => void> = new Set()
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0

  constructor(config: Partial<RealtimeServiceConfig> = {}) {
    this.config = {
      url: process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:3001/ws/sessions',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    }

    this.connectionStatus = {
      connected: false,
      lastHeartbeat: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: this.config.maxReconnectAttempts,
      error: null
    }

    // Initialize event type sets
    const eventTypes: SessionEventType[] = [
      'session_created', 'session_updated', 'session_revoked', 
      'session_flagged', 'risk_score_updated', 'anomaly_detected', 'heartbeat'
    ]
    eventTypes.forEach(type => this.listeners.set(type, new Set()))
  }

  // WebSocket connection method
  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.cleanup()

      try {
        this.websocket = new WebSocket(this.config.url)
        
        this.websocket.onopen = () => {
          this.connectionStatus = {
            ...this.connectionStatus,
            connected: true,
            lastHeartbeat: new Date(),
            reconnectAttempts: 0,
            error: null
          }
          this.reconnectAttempts = 0
          this.notifyStatusListeners()
          this.startHeartbeat()
          resolve()
        }

        this.websocket.onmessage = (event) => {
          try {
            const sessionEvent: SessionEvent = JSON.parse(event.data)
            this.handleSessionEvent(sessionEvent)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.websocket.onclose = (event) => {
          this.connectionStatus = {
            ...this.connectionStatus,
            connected: false,
            error: event.reason || 'Connection closed'
          }
          this.stopHeartbeat()
          this.notifyStatusListeners()
          
          if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.websocket.onerror = (error) => {
          this.connectionStatus = {
            ...this.connectionStatus,
            connected: false,
            error: 'WebSocket connection error'
          }
          this.notifyStatusListeners()
          reject(error)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  // Server-Sent Events connection method
  connectSSE(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.eventSource?.readyState === EventSource.OPEN) {
        resolve()
        return
      }

      this.cleanup()

      try {
        const sseUrl = this.config.url.replace('ws://', 'http://').replace('wss://', 'https://') + '/sse'
        this.eventSource = new EventSource(sseUrl)

        this.eventSource.onopen = () => {
          this.connectionStatus = {
            ...this.connectionStatus,
            connected: true,
            lastHeartbeat: new Date(),
            reconnectAttempts: 0,
            error: null
          }
          this.reconnectAttempts = 0
          this.notifyStatusListeners()
          this.startHeartbeat()
          resolve()
        }

        this.eventSource.onmessage = (event) => {
          try {
            const sessionEvent: SessionEvent = JSON.parse(event.data)
            this.handleSessionEvent(sessionEvent)
          } catch (error) {
            console.error('Failed to parse SSE message:', error)
          }
        }

        this.eventSource.onerror = (error) => {
          this.connectionStatus = {
            ...this.connectionStatus,
            connected: false,
            error: 'SSE connection error'
          }
          this.notifyStatusListeners()
          
          if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect()
          } else {
            reject(error)
          }
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  // Auto-connect with fallback (WebSocket -> SSE)
  async connect(): Promise<void> {
    try {
      // Try WebSocket first
      await this.connectWebSocket()
    } catch (error) {
      console.warn('WebSocket connection failed, falling back to SSE:', error)
      try {
        await this.connectSSE()
      } catch (sseError) {
        console.error('Both WebSocket and SSE connections failed:', sseError)
        throw sseError
      }
    }
  }

  disconnect(): void {
    this.cleanup()
    this.connectionStatus = {
      ...this.connectionStatus,
      connected: false,
      error: null
    }
    this.notifyStatusListeners()
  }

  private cleanup(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.stopHeartbeat()
    this.clearReconnectTimer()
  }

  private handleSessionEvent(event: SessionEvent): void {
    if (event.type === 'heartbeat') {
      this.connectionStatus = {
        ...this.connectionStatus,
        lastHeartbeat: new Date()
      }
      this.notifyStatusListeners()
    }

    const typeListeners = this.listeners.get(event.type)
    if (typeListeners) {
      typeListeners.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error(`Error in ${event.type} listener:`, error)
        }
      })
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer()
    this.reconnectAttempts++
    
    this.connectionStatus = {
      ...this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts
    }
    this.notifyStatusListeners()

    const delay = Math.min(this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: 'ping' }))
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private notifyStatusListeners(): void {
    this.statusListeners.forEach(callback => {
      try {
        callback({ ...this.connectionStatus })
      } catch (error) {
        console.error('Error in status listener:', error)
      }
    })
  }

  // Event subscription methods
  on(eventType: SessionEventType, callback: (event: SessionEvent) => void): () => void {
    const typeListeners = this.listeners.get(eventType)
    if (typeListeners) {
      typeListeners.add(callback)
      
      // Return unsubscribe function
      return () => {
        typeListeners.delete(callback)
      }
    }
    
    return () => {}
  }

  onStatusChange(callback: (status: RealtimeConnectionStatus) => void): () => void {
    this.statusListeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback)
    }
  }

  // Utility methods for specific event types
  onSessionCreated(callback: (session: ActiveSession) => void): () => void {
    return this.on('session_created', (event) => callback(event.data))
  }

  onSessionUpdated(callback: (update: SessionUpdate) => void): () => void {
    return this.on('session_updated', (event) => callback(event.data))
  }

  onSessionRevoked(callback: (sessionId: string) => void): () => void {
    return this.on('session_revoked', (event) => callback(event.sessionId))
  }

  onAnomalyDetected(callback: (anomaly: any) => void): () => void {
    return this.on('anomaly_detected', (event) => callback(event.data))
  }

  // Send data through WebSocket (if available)
  send(data: any): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data))
    }
  }

  // Getters
  get status(): RealtimeConnectionStatus {
    return { ...this.connectionStatus }
  }

  get isConnected(): boolean {
    return this.connectionStatus.connected
  }
}

// Singleton instance
let realtimeService: RealtimeSessionService | null = null

export function getRealtimeService(): RealtimeSessionService {
  if (!realtimeService) {
    realtimeService = new RealtimeSessionService()
  }
  return realtimeService
}

// React hook for easier usage
export function useRealtimeService() {
  return getRealtimeService()
}