"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  Activity,
  User,
  Shield,
  AlertTriangle,
  LogOut,
  LogIn,
  Flag,
  Eye,
  Search,
  Download,
  Clock,
  MapPin,
  Smartphone,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Key,
  RefreshCw
} from "lucide-react"
import { AuditLog, AuditLogFilter } from "@/types/session"

interface SessionsAuditLogProps {
  auditLogs: AuditLog[]
  onExport?: (filters: AuditLogFilter) => void
  onViewDetails?: (logId: string) => void
}

const AUDIT_ACTION_ICONS = {
  login: <LogIn className="h-4 w-4 text-green-600" />,
  logout: <LogOut className="h-4 w-4 text-red-600" />,
  session_revoke: <XCircle className="h-4 w-4 text-red-600" />,
  session_flag: <Flag className="h-4 w-4 text-amber-600" />,
  mfa_challenge: <Shield className="h-4 w-4 text-blue-600" />,
  token_refresh: <RefreshCw className="h-4 w-4 text-purple-600" />,
  anomaly_detected: <AlertTriangle className="h-4 w-4 text-red-600" />,
  risk_score_change: <Activity className="h-4 w-4 text-amber-600" />,
  admin_action: <Settings className="h-4 w-4 text-blue-600" />,
  ip_block: <Shield className="h-4 w-4 text-red-600" />,
  geo_alert: <MapPin className="h-4 w-4 text-amber-600" />,
  device_change: <Smartphone className="h-4 w-4 text-blue-600" />
}

const AUDIT_SEVERITY_COLORS = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-200 text-red-900 border-red-300'
}

// Mock data generator for demonstration
const generateMockAuditLogs = (): AuditLog[] => {
  const actions = [
    'login', 'logout', 'session_revoke', 'session_flag', 'mfa_challenge',
    'token_refresh', 'anomaly_detected', 'risk_score_change', 'admin_action',
    'ip_block', 'geo_alert', 'device_change'
  ]
  
  const severities: ('info' | 'warning' | 'error' | 'critical')[] = ['info', 'warning', 'error', 'critical']
  
  const users = [
    { id: '1', name: 'John Doe', email: 'john@company.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@company.com' }
  ]

  return Array.from({ length: 100 }, (_, i) => {
    const action = actions[Math.floor(Math.random() * actions.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const user = users[Math.floor(Math.random() * users.length)]
    
    return {
      id: `audit-${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      action: action as any,
      severity,
      actorType: Math.random() > 0.3 ? 'user' : 'system',
      actorId: user.id,
      actorName: user.name,
      targetType: 'session',
      targetId: `session-${Math.floor(Math.random() * 50) + 1}`,
      targetName: `Session for ${user.name}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        sessionId: `sess-${Math.floor(Math.random() * 1000)}`,
        riskScore: Math.floor(Math.random() * 100),
        reason: action === 'session_revoke' ? 'Suspicious activity detected' : undefined,
        location: 'New York, US'
      },
      metadata: {
        requestId: `req-${i + 1}`,
        source: 'session-management'
      }
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function SessionsAuditLog({ 
  auditLogs, 
  onExport, 
  onViewDetails 
}: SessionsAuditLogProps) {
  const t = useTranslations('common.sessions.auditLog')
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [actorTypeFilter, setActorTypeFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{from: Date, to: Date} | null>(null)

  // Use mock data if no audit logs provided
  const mockLogs = useMemo(() => generateMockAuditLogs(), [])
  const logs = auditLogs.length > 0 ? auditLogs : mockLogs

  // Filter audit logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!log.actorName.toLowerCase().includes(query) &&
            !log.action.toLowerCase().includes(query) &&
            !log.targetName?.toLowerCase().includes(query) &&
            !log.ipAddress.includes(query)) {
          return false
        }
      }

      // Action filter
      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false
      }

      // Severity filter
      if (severityFilter !== 'all' && log.severity !== severityFilter) {
        return false
      }

      // Actor type filter
      if (actorTypeFilter !== 'all' && log.actorType !== actorTypeFilter) {
        return false
      }

      // Date range filter
      if (dateRange) {
        const logDate = new Date(log.timestamp)
        if (logDate < dateRange.from || logDate > dateRange.to) {
          return false
        }
      }

      return true
    })
  }, [logs, searchQuery, actionFilter, severityFilter, actorTypeFilter, dateRange])

  // Stats calculation
  const stats = useMemo(() => {
    const total = filteredLogs.length
    const critical = filteredLogs.filter(l => l.severity === 'critical').length
    const errors = filteredLogs.filter(l => l.severity === 'error').length
    const warnings = filteredLogs.filter(l => l.severity === 'warning').length
    const adminActions = filteredLogs.filter(l => l.actorType === 'system' || l.action.includes('admin')).length

    return { total, critical, errors, warnings, adminActions }
  }, [filteredLogs])

  const getActionIcon = (action: string) => {
    return AUDIT_ACTION_ICONS[action as keyof typeof AUDIT_ACTION_ICONS] || <Activity className="h-4 w-4" />
  }

  const getSeverityBadgeClass = (severity: string) => {
    return AUDIT_SEVERITY_COLORS[severity as keyof typeof AUDIT_SEVERITY_COLORS] || 'bg-gray-100 text-gray-800'
  }

  const formatActionName = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleExport = () => {
    const filters: AuditLogFilter = {
      searchQuery: searchQuery || undefined,
      actions: actionFilter !== 'all' ? [actionFilter as any] : undefined,
      severities: severityFilter !== 'all' ? [severityFilter as any] : undefined,
      actorTypes: actorTypeFilter !== 'all' ? [actorTypeFilter as any] : undefined,
      dateRange: dateRange || undefined
    }
    onExport?.(filters)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalEvents')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.critical')}</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.errors')}</p>
                <p className="text-2xl font-bold text-red-500">{stats.errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.warnings')}</p>
                <p className="text-2xl font-bold text-amber-600">{stats.warnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.adminActions')}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.adminActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">
            <Activity className="h-4 w-4 mr-2" />
            {t('tabs.allEvents')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            {t('tabs.securityEvents')}
          </TabsTrigger>
          <TabsTrigger value="admin">
            <Settings className="h-4 w-4 mr-2" />
            {t('tabs.adminActions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('filters.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allActions')}</SelectItem>
                    <SelectItem value="login">{t('actionTypes.login')}</SelectItem>
                    <SelectItem value="logout">{t('actionTypes.logout')}</SelectItem>
                    <SelectItem value="session_revoke">{t('actionTypes.sessionRevoke')}</SelectItem>
                    <SelectItem value="session_flag">{t('actionTypes.sessionFlag')}</SelectItem>
                    <SelectItem value="mfa_challenge">{t('actionTypes.mfaChallenge')}</SelectItem>
                    <SelectItem value="anomaly_detected">{t('actionTypes.anomaly')}</SelectItem>
                    <SelectItem value="admin_action">{t('actionTypes.adminAction')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allLevels')}</SelectItem>
                    <SelectItem value="critical">{t('severityLevels.critical')}</SelectItem>
                    <SelectItem value="error">{t('severityLevels.error')}</SelectItem>
                    <SelectItem value="warning">{t('severityLevels.warning')}</SelectItem>
                    <SelectItem value="info">{t('severityLevels.info')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={actorTypeFilter} onValueChange={setActorTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allActors')}</SelectItem>
                    <SelectItem value="user">{t('actorTypes.user')}</SelectItem>
                    <SelectItem value="system">{t('actorTypes.system')}</SelectItem>
                    <SelectItem value="admin">{t('actorTypes.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('table.title', {count: filteredLogs.length})}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.timestamp')}</TableHead>
                    <TableHead>{t('table.action')}</TableHead>
                    <TableHead>{t('table.actor')}</TableHead>
                    <TableHead>{t('table.target')}</TableHead>
                    <TableHead>{t('table.severity')}</TableHead>
                    <TableHead>{t('table.ipAddress')}</TableHead>
                    <TableHead>{t('table.details')}</TableHead>
                    <TableHead>{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {log.timestamp.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm font-medium">
                            {formatActionName(log.action)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{log.actorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.actorType}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{log.targetName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {log.targetId?.slice(0, 12)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={getSeverityBadgeClass(log.severity)}
                        >
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <code className="text-xs">{log.ipAddress}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs">
                          {log.details.reason && (
                            <p className="truncate">{log.details.reason}</p>
                          )}
                          {log.details.riskScore && (
                            <p className="text-xs text-muted-foreground">
                              {t('table.risk')}: {log.details.riskScore}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails?.(log.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.securityEvents')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLogs
                  .filter(log => 
                    ['anomaly_detected', 'session_revoke', 'session_flag', 'mfa_challenge', 'ip_block'].includes(log.action)
                  )
                  .slice(0, 20)
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getActionIcon(log.action)}
                        <div>
                          <p className="font-medium">{formatActionName(log.action)}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.actorName} • {log.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={getSeverityBadgeClass(log.severity)}
                      >
                        {log.severity}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.adminActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLogs
                  .filter(log => log.actorType === 'system' || log.action.includes('admin'))
                  .slice(0, 20)
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getActionIcon(log.action)}
                        <div>
                          <p className="font-medium">{formatActionName(log.action)}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('actorTypes.system')} • {log.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.ipAddress}
                        </code>
                        <Badge 
                          variant="outline"
                          className={getSeverityBadgeClass(log.severity)}
                        >
                          {log.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}