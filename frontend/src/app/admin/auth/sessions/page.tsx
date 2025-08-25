"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SessionsList } from "@/components/admin/auth/sessions/SessionsList"
import { SessionsAnalytics } from "@/components/admin/auth/sessions/SessionsAnalytics"
import { SessionsAuditLog } from "@/components/admin/auth/sessions/SessionsAuditLog"  
import { SessionsAnomalies } from "@/components/admin/auth/sessions/SessionsAnomalies"
import { SessionDetails } from "@/components/admin/auth/sessions/SessionDetails"
import { BulkActions } from "@/components/admin/auth/sessions/BulkActions"
import { RealtimeStatus } from "@/components/admin/auth/sessions/RealtimeStatus"
import { 
  Activity, Users, Shield, AlertTriangle, Download, 
  FileText, TrendingUp, RefreshCw, Wifi, WifiOff,
  Eye, BarChart3
} from "lucide-react"
import { 
  ActiveSession, 
  SessionAnalytics, 
  SessionFilters, 
  SessionPermissions,
  RealtimeConnectionStatus,
  SessionEvent
} from "@/types/session"
import toast from "react-hot-toast"

// Mock permissions - in real app, this would come from RBAC
const mockPermissions: SessionPermissions = {
  canView: true,
  canViewAll: true,
  canRevoke: true,
  canRevokeAll: true,
  canQuarantineIp: true,
  canViewAudit: true,
  canExport: true,
  canViewAnalytics: true,
  scopeRestrictions: {}
}

export default function ActiveSessionsPage() {
  const [activeTab, setActiveTab] = useState("sessions")
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [permissions] = useState<SessionPermissions>(mockPermissions)
  
  // Real-time connection
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeConnectionStatus>({
    connected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  })
  
  // Auto-refresh settings
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10000) // 10 seconds

  // Mock data for demonstration
  const generateMockSessions = (): ActiveSession[] => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: `session_${i + 1}`,
      sessionId: `keycloak_session_${i + 1}`,
      userId: `user_${Math.floor(Math.random() * 20) + 1}`,
      clientId: 'workplace-safety-panel',
      
      user: {
        id: `user_${Math.floor(Math.random() * 20) + 1}`,
        email: `user${i + 1}@company.com`,
        firstName: ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma'][Math.floor(Math.random() * 6)],
        lastName: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Garcia'][Math.floor(Math.random() * 6)],
        username: `user${i + 1}`,
        roles: Math.random() > 0.7 ? ['admin'] : Math.random() > 0.5 ? ['security'] : ['viewer'],
        department: ['IT', 'Security', 'HR', 'Operations'][Math.floor(Math.random() * 4)]
      },
      
      mfa: {
        status: Math.random() > 0.3 ? 'passed' : 'required',
        methods: ['totp', 'sms'],
        mfaRequired: Math.random() > 0.5,
        trustDevice: Math.random() > 0.7,
        lastMfaAt: new Date(Date.now() - Math.random() * 3600000).toISOString()
      },
      
      device: {
        type: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
        os: ['Windows 11', 'macOS 14', 'iOS 17', 'Android 14'][Math.floor(Math.random() * 4)],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
        version: '120.0.0.0',
        fingerprint: `fp_${Math.random().toString(36).substring(7)}`,
        isTrusted: Math.random() > 0.3,
        isNewDevice: Math.random() > 0.8
      },
      
      location: {
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        city: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana'][Math.floor(Math.random() * 5)],
        country: 'Turkey',
        countryCode: 'TR',
        region: 'Marmara',
        timezone: 'Europe/Istanbul',
        asn: `AS${Math.floor(Math.random() * 9999) + 1000}`,
        isp: ['Turk Telekom', 'Vodafone', 'Turkcell'][Math.floor(Math.random() * 3)],
        isVpn: Math.random() > 0.9,
        isTor: Math.random() > 0.95,
        isProxy: Math.random() > 0.9
      },
      
      loginAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      idleTime: Math.floor(Math.random() * 3600),
      
      riskScore: {
        total: Math.floor(Math.random() * 100),
        level: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
        factors: {
          geoVelocity: Math.floor(Math.random() * 20),
          newDevice: Math.floor(Math.random() * 15),
          missingMfa: Math.floor(Math.random() * 25),
          concurrentSessions: Math.floor(Math.random() * 10),
          unusualHours: Math.floor(Math.random() * 5),
          suspiciousActivity: Math.floor(Math.random() * 10)
        },
        lastCalculated: new Date().toISOString(),
        details: []
      },
      
      anomalies: [],
      
      tokens: {
        accessToken: {
          expiresAt: new Date(Date.now() + 1800000).toISOString(),
          remainingTTL: 1800
        },
        refreshToken: {
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          remainingTTL: 86400
        },
        rememberMe: Math.random() > 0.5
      },
      
      status: 'active',
      concurrentSessions: Math.floor(Math.random() * 3) + 1,
      
      keycloakData: {
        realm: 'workplace-safety',
        clientSessionId: `client_session_${i + 1}`,
        scope: ['openid', 'profile', 'email'],
        state: 'active'
      },
      
      createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      flags: Math.random() > 0.7 ? ['high_risk'] : []
    }))
  }

  const generateMockAnalytics = (): SessionAnalytics => {
    const sessions = generateMockSessions()
    return {
      timeRange: {
        from: new Date(Date.now() - 86400000).toISOString(),
        to: new Date().toISOString()
      },
      activeSessions: sessions.length,
      uniqueUsers: new Set(sessions.map(s => s.userId)).size,
      highRiskSessions: sessions.filter(s => s.riskScore.level === 'high').length,
      revokedToday: Math.floor(Math.random() * 20) + 5,
      sessionTimeSeries: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
        active: Math.floor(Math.random() * 100) + 200,
        created: Math.floor(Math.random() * 20) + 10,
        revoked: Math.floor(Math.random() * 5) + 2
      })),
      geoDistribution: [
        { country: 'Turkey', countryCode: 'TR', count: 180, percentage: 75 },
        { country: 'Germany', countryCode: 'DE', count: 30, percentage: 12.5 },
        { country: 'United States', countryCode: 'US', count: 20, percentage: 8.3 },
        { country: 'France', countryCode: 'FR', count: 10, percentage: 4.2 }
      ],
      deviceDistribution: [
        { type: 'desktop', count: 150, percentage: 62.5 },
        { type: 'mobile', count: 75, percentage: 31.3 },
        { type: 'tablet', count: 15, percentage: 6.2 }
      ],
      osDistribution: [
        { os: 'Windows', version: '11', count: 100, percentage: 41.7 },
        { os: 'macOS', version: '14', count: 50, percentage: 20.8 },
        { os: 'iOS', version: '17', count: 45, percentage: 18.8 },
        { os: 'Android', version: '14', count: 30, percentage: 12.5 }
      ],
      browserDistribution: [
        { browser: 'Chrome', version: '120', count: 120, percentage: 50 },
        { browser: 'Safari', version: '17', count: 60, percentage: 25 },
        { browser: 'Firefox', version: '121', count: 36, percentage: 15 },
        { browser: 'Edge', version: '120', count: 24, percentage: 10 }
      ],
      riskDistribution: [
        { level: 'low', count: 180, percentage: 75 },
        { level: 'medium', count: 45, percentage: 18.8 },
        { level: 'high', count: 12, percentage: 5 },
        { level: 'critical', count: 3, percentage: 1.2 }
      ],
      anomalies: [
        { type: 'geo_velocity', count: 5, trend: 'up' },
        { type: 'new_device', count: 8, trend: 'stable' },
        { type: 'concurrent_login', count: 3, trend: 'down' }
      ],
      topCountries: [
        { country: 'Turkey', count: 180 },
        { country: 'Germany', count: 30 },
        { country: 'USA', count: 20 }
      ],
      topASNs: [
        { asn: 'AS9121', isp: 'Turk Telekom', count: 80 },
        { asn: 'AS15897', isp: 'Vodafone Turkey', count: 60 },
        { asn: 'AS16135', isp: 'Turkcell', count: 40 }
      ],
      topRiskyUsers: []
    }
  }

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true)
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockSessions = generateMockSessions()
      const mockAnalytics = generateMockAnalytics()
      
      setSessions(mockSessions)
      setAnalytics(mockAnalytics)
      setLastUpdated(new Date())
    } catch (error) {
      toast.error("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize real-time connection (mock)
  const initializeRealtimeConnection = useCallback(() => {
    // Mock WebSocket connection
    const connectRealtime = () => {
      setRealtimeStatus(prev => ({
        ...prev,
        connected: true,
        lastHeartbeat: new Date().toISOString(),
        reconnectAttempts: 0
      }))
      
      // Mock incoming session events
      const eventInterval = setInterval(() => {
        const event: SessionEvent = {
          type: 'session_updated',
          sessionId: `session_${Math.floor(Math.random() * 50) + 1}`,
          timestamp: new Date().toISOString(),
          data: {
            lastActivity: new Date().toISOString(),
            idleTime: Math.floor(Math.random() * 300)
          }
        }
        
        // Update session in the list
        setSessions(prev => prev.map(session => 
          session.id === event.sessionId 
            ? { ...session, ...event.data }
            : session
        ))
      }, 15000)
      
      return () => clearInterval(eventInterval)
    }
    
    if (autoRefresh) {
      const cleanup = connectRealtime()
      return cleanup
    }
  }, [autoRefresh])

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadSessions, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, loadSessions])

  // Initialize real-time connection
  useEffect(() => {
    const cleanup = initializeRealtimeConnection()
    return cleanup
  }, [initializeRealtimeConnection])

  // Initial load
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const handleExportSessions = async () => {
    try {
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success("Sessions exported successfully")
    } catch (error) {
      toast.error("Failed to export sessions")
    }
  }

  const handleGenerateReport = async () => {
    try {
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("Security report generated successfully")
    } catch (error) {
      toast.error("Failed to generate report")
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getKpiTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : 'down',
      color: change > 0 ? 'text-green-600' : 'text-red-600'
    }
  }

  if (!permissions.canView) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view active sessions.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span>Active Sessions</span>
          </h1>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <RealtimeStatus status={realtimeStatus} />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {realtimeStatus.connected ? (
              <Wifi className="h-4 w-4 mr-2" />
            ) : (
              <WifiOff className="h-4 w-4 mr-2" />
            )}
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={loadSessions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {permissions.canExport && (
            <Button variant="outline" size="sm" onClick={handleExportSessions}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analytics.activeSessions)}</div>
              <div className="flex items-center space-x-2 text-xs">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+8.2%</span>
                <span className="text-muted-foreground">from yesterday</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analytics.uniqueUsers)}</div>
              <div className="flex items-center space-x-2 text-xs">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+3.1%</span>
                <span className="text-muted-foreground">from yesterday</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Risk Sessions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatNumber(analytics.highRiskSessions)}
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-red-600">
                  {((analytics.highRiskSessions / analytics.activeSessions) * 100).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">of total sessions</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revoked Today</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analytics.revokedToday)}</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-muted-foreground">Security actions taken</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Sessions</span>
            <Badge variant="secondary">{analytics?.activeSessions || 0}</Badge>
          </TabsTrigger>
          
          {permissions.canViewAnalytics && (
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger value="anomalies" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Anomalies</span>
            <Badge variant="destructive">
              {sessions.filter(s => (s.riskScore?.total || 0) >= 70).length}
            </Badge>
          </TabsTrigger>
          
          {permissions.canViewAudit && (
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Audit Log</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="sessions">
          <SessionsList
            sessions={sessions}
            loading={loading}
            permissions={permissions}
            onSessionUpdate={(updatedSession) => {
              setSessions(prev => prev.map(s => 
                s.id === updatedSession.id ? updatedSession : s
              ))
            }}
          />
        </TabsContent>

        {permissions.canViewAnalytics && (
          <TabsContent value="analytics">
            <SessionsAnalytics 
              sessions={sessions} 
              analytics={analytics || {
                timeRange: { from: new Date().toISOString(), to: new Date().toISOString() },
                activeSessions: 0,
                uniqueUsers: 0,
                highRiskSessions: 0,
                revokedToday: 0,
                avgSessionDuration: 0,
                deviceDistribution: [],
                geoDistribution: [],
                riskDistribution: [],
                anomalies: [],
                hourlyActivity: [],
                mfaAdoption: 0,
                riskTrends: { low: 0, medium: 0, high: 0, critical: 0 },
                newDeviceLogins: 0,
                suspiciousIPs: 0
              }} 
            />
          </TabsContent>
        )}

        <TabsContent value="anomalies">
          <SessionsAnomalies 
            sessions={sessions}
            onSessionAction={(sessionId: string, action: string) => {
              toast.success(`${action} executed on session ${sessionId}`)
              // Handle session actions
            }}
          />
        </TabsContent>

        {permissions.canViewAudit && (
          <TabsContent value="audit">
            <SessionsAuditLog 
              auditLogs={[]}
              onExport={() => toast.success("Audit log exported")}
              onViewDetails={(logId: string) => toast(`Viewing details for ${logId}`)}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}