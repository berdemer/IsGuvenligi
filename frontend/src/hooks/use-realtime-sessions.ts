"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { ActiveSession, RealtimeConnectionStatus, SessionUpdate } from '@/types/session'
import { getRealtimeService, SessionEvent, SessionEventType } from '@/lib/realtime-service'
import toast from 'react-hot-toast'

interface UseRealtimeSessionsOptions {
  autoConnect?: boolean
  showNotifications?: boolean
  onSessionCreated?: (session: ActiveSession) => void
  onSessionUpdated?: (update: SessionUpdate) => void
  onSessionRevoked?: (sessionId: string) => void
  onAnomalyDetected?: (anomaly: any) => void
}

interface UseRealtimeSessionsReturn {
  // Connection status
  connectionStatus: RealtimeConnectionStatus
  isConnected: boolean
  
  // Connection methods
  connect: () => Promise<void>
  disconnect: () => void
  
  // Session state
  sessions: ActiveSession[]
  updateSessions: (sessions: ActiveSession[]) => void
  
  // Event handlers
  onEvent: (eventType: SessionEventType, callback: (event: SessionEvent) => void) => () => void
}

export function useRealtimeSessions(options: UseRealtimeSessionsOptions = {}): UseRealtimeSessionsReturn {
  const {
    autoConnect = true,
    showNotifications = true,
    onSessionCreated,
    onSessionUpdated,
    onSessionRevoked,
    onAnomalyDetected
  } = options

  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>({
    connected: false,
    lastHeartbeat: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    error: null
  })
  
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const service = useRef(getRealtimeService())
  const unsubscribersRef = useRef<(() => void)[]>([])

  const connect = useCallback(async () => {
    try {
      await service.current.connect()
      if (showNotifications) {
        toast.success('Connected to real-time updates')
      }
    } catch (error) {
      console.error('Failed to connect to real-time service:', error)
      if (showNotifications) {
        toast.error('Failed to connect to real-time updates')
      }
    }
  }, [showNotifications])

  const disconnect = useCallback(() => {
    service.current.disconnect()
    if (showNotifications) {
      toast.success('Disconnected from real-time updates')
    }
  }, [showNotifications])

  const updateSessions = useCallback((newSessions: ActiveSession[]) => {
    setSessions(newSessions)
  }, [])

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = service.current.onStatusChange(setConnectionStatus)
    return unsubscribe
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      // Cleanup all event subscriptions
      unsubscribersRef.current.forEach(unsub => unsub())
      unsubscribersRef.current = []
    }
  }, [autoConnect, connect])

  // Setup event handlers
  useEffect(() => {
    const unsubscribers: (() => void)[] = []

    // Session created handler
    const unsubCreated = service.current.onSessionCreated((session) => {
      setSessions(prev => {
        const exists = prev.some(s => s.id === session.id)
        if (exists) return prev
        
        const updated = [session, ...prev]
        if (showNotifications) {
          toast.success(`New session: ${session.userInfo.name}`)
        }
        onSessionCreated?.(session)
        return updated
      })
    })
    unsubscribers.push(unsubCreated)

    // Session updated handler
    const unsubUpdated = service.current.onSessionUpdated((update) => {
      setSessions(prev => prev.map(session => {
        if (session.id === update.sessionId) {
          const updatedSession = { ...session, ...update.changes }
          
          if (showNotifications && update.changes.riskScore && 
              update.changes.riskScore > session.riskScore + 20) {
            toast.error(`Risk score increased for ${session.userInfo.name}`)
          }
          
          onSessionUpdated?.(update)
          return updatedSession
        }
        return session
      }))
    })
    unsubscribers.push(unsubUpdated)

    // Session revoked handler
    const unsubRevoked = service.current.onSessionRevoked((sessionId) => {
      setSessions(prev => {
        const session = prev.find(s => s.id === sessionId)
        if (session && showNotifications) {
          toast.success(`Session revoked: ${session.userInfo.name}`)
        }
        onSessionRevoked?.(sessionId)
        return prev.filter(s => s.id !== sessionId)
      })
    })
    unsubscribers.push(unsubRevoked)

    // Anomaly detected handler
    const unsubAnomaly = service.current.onAnomalyDetected((anomaly) => {
      if (showNotifications) {
        const session = sessions.find(s => s.id === anomaly.sessionId)
        if (session) {
          toast.error(`Anomaly detected: ${session.userInfo.name} - ${anomaly.type}`)
        }
      }
      onAnomalyDetected?.(anomaly)
    })
    unsubscribers.push(unsubAnomaly)

    // Session flagged handler
    const unsubFlagged = service.current.on('session_flagged', (event) => {
      const session = sessions.find(s => s.id === event.sessionId)
      if (session && showNotifications) {
        toast.warning(`Session flagged: ${session.userInfo.name}`)
      }
    })
    unsubscribers.push(unsubFlagged)

    // Risk score updated handler
    const unsubRiskUpdated = service.current.on('risk_score_updated', (event) => {
      setSessions(prev => prev.map(session => {
        if (session.id === event.sessionId) {
          const newRiskScore = event.data.riskScore
          const riskIncrease = newRiskScore - session.riskScore
          
          if (showNotifications && riskIncrease > 15) {
            toast.warning(`Risk score updated: ${session.userInfo.name} (+${riskIncrease})`)
          }
          
          return { ...session, riskScore: newRiskScore }
        }
        return session
      }))
    })
    unsubscribers.push(unsubRiskUpdated)

    // Store unsubscribers for cleanup
    unsubscribersRef.current = unsubscribers

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [sessions, showNotifications, onSessionCreated, onSessionUpdated, onSessionRevoked, onAnomalyDetected])

  // Generic event subscription method
  const onEvent = useCallback((eventType: SessionEventType, callback: (event: SessionEvent) => void) => {
    const unsubscribe = service.current.on(eventType, callback)
    unsubscribersRef.current.push(unsubscribe)
    return unsubscribe
  }, [])

  return {
    connectionStatus,
    isConnected: connectionStatus.connected,
    connect,
    disconnect,
    sessions,
    updateSessions,
    onEvent
  }
}

// Specialized hook for session monitoring
export function useSessionMonitor() {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  const realtimeData = useRealtimeSessions({
    autoConnect: true,
    showNotifications: true,
    onAnomalyDetected: (anomaly) => {
      setAnomalies(prev => [anomaly, ...prev.slice(0, 49)]) // Keep last 50
    }
  })

  // Monitor high-risk sessions
  useEffect(() => {
    const highRiskSessions = realtimeData.sessions.filter(s => s.riskScore >= 70)
    if (highRiskSessions.length > 0) {
      const alert = {
        id: Date.now(),
        type: 'high_risk_sessions',
        message: `${highRiskSessions.length} high-risk sessions detected`,
        timestamp: new Date(),
        sessions: highRiskSessions
      }
      setAlerts(prev => [alert, ...prev.slice(0, 19)]) // Keep last 20
    }
  }, [realtimeData.sessions])

  return {
    ...realtimeData,
    anomalies,
    alerts,
    highRiskSessions: realtimeData.sessions.filter(s => s.riskScore >= 70),
    suspiciousSessions: realtimeData.sessions.filter(s => s.riskScore >= 40 && s.riskScore < 70),
    totalRiskScore: realtimeData.sessions.reduce((sum, s) => sum + s.riskScore, 0)
  }
}

// Hook for connection status monitoring
export function useConnectionStatus() {
  const [status, setStatus] = useState<RealtimeConnectionStatus>({
    connected: false,
    lastHeartbeat: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    error: null
  })

  useEffect(() => {
    const service = getRealtimeService()
    const unsubscribe = service.onStatusChange(setStatus)
    
    // Get initial status
    setStatus(service.status)
    
    return unsubscribe
  }, [])

  return status
}