"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SessionDetails } from "./SessionDetails"
import { BulkActions } from "./BulkActions"
import { 
  Search, Filter, MoreHorizontal, Eye, LogOut, Shield, 
  AlertTriangle, Clock, MapPin, Smartphone, Monitor, 
  Tablet, CheckCircle, XCircle, AlertCircle, Flag,
  Users, Globe, Wifi, Activity, Timer
} from "lucide-react"
import { ActiveSession, SessionFilters, SessionPermissions, SessionAction } from "@/types/session"
import toast from "react-hot-toast"
import { useTranslations } from 'next-intl'

interface SessionsListProps {
  sessions: ActiveSession[]
  loading: boolean
  permissions: SessionPermissions
  onSessionUpdate: (session: ActiveSession) => void
}

export function SessionsList({ 
  sessions, 
  loading, 
  permissions, 
  onSessionUpdate 
}: SessionsListProps) {
  const t = useTranslations('common.sessions')
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<SessionFilters>({
    page: 1,
    pageSize: 25,
    sortBy: 'lastActivity',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(session =>
        session.user.email.toLowerCase().includes(term) ||
        session.user.firstName.toLowerCase().includes(term) ||
        session.user.lastName.toLowerCase().includes(term) ||
        session.user.username.toLowerCase().includes(term) ||
        session.location.ip.includes(term) ||
        session.device.fingerprint.toLowerCase().includes(term)
      )
    }

    // Apply filters
    if (filters.roles?.length) {
      filtered = filtered.filter(session =>
        session.user.roles.some(role => filters.roles!.includes(role))
      )
    }

    if (filters.deviceTypes?.length) {
      filtered = filtered.filter(session =>
        filters.deviceTypes!.includes(session.device.type)
      )
    }

    if (filters.riskLevels?.length) {
      filtered = filtered.filter(session =>
        filters.riskLevels!.includes(session.riskScore.level)
      )
    }

    if (filters.mfaStatus?.length) {
      filtered = filtered.filter(session =>
        filters.mfaStatus!.includes(session.mfa.status)
      )
    }

    if (filters.locations?.length) {
      filtered = filtered.filter(session =>
        filters.locations!.some(location => 
          session.location.city.includes(location) || 
          session.location.country.includes(location)
        )
      )
    }

    if (filters.hasAnomalies !== undefined) {
      filtered = filtered.filter(session =>
        filters.hasAnomalies ? session.anomalies.length > 0 : session.anomalies.length === 0
      )
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (filters.sortBy) {
          case 'lastActivity':
            aValue = new Date(a.lastActivity).getTime()
            bValue = new Date(b.lastActivity).getTime()
            break
          case 'loginAt':
            aValue = new Date(a.loginAt).getTime()
            bValue = new Date(b.loginAt).getTime()
            break
          case 'riskScore':
            aValue = a.riskScore.total
            bValue = b.riskScore.total
            break
          case 'user':
            aValue = `${a.user.firstName} ${a.user.lastName}`.toLowerCase()
            bValue = `${b.user.firstName} ${b.user.lastName}`.toLowerCase()
            break
          default:
            aValue = 0
            bValue = 0
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    // Pin high-risk sessions at top
    const highRisk = filtered.filter(s => s.riskScore.level === 'high' || s.riskScore.level === 'critical')
    const others = filtered.filter(s => s.riskScore.level !== 'high' && s.riskScore.level !== 'critical')
    
    return [...highRisk, ...others]
  }, [sessions, searchTerm, filters])

  const handleSessionAction = async (sessionId: string, action: SessionAction, options?: any) => {
    if (!permissions.canRevoke && (action === 'revoke' || action === 'revoke_block_ip')) {
      toast.error(t('toast.noRevokePermission'))
      return
    }

    if (!permissions.canQuarantineIp && action === 'quarantine_ip') {
      toast.error(t('toast.noQuarantinePermission'))
      return
    }

    setActionLoading(sessionId)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update session status locally
      const updatedSession = sessions.find(s => s.id === sessionId)
      if (updatedSession) {
        const newSession = { 
          ...updatedSession, 
          status: action === 'revoke' ? 'revoked' as const : updatedSession.status 
        }
        onSessionUpdate(newSession)
      }
      
      toast.success(getActionSuccessMessage(action))
    } catch (error) {
      toast.error(t('toast.actionFailed', { action }))
    } finally {
      setActionLoading(null)
    }
  }

  const getActionSuccessMessage = (action: SessionAction): string => {
    switch (action) {
      case 'revoke': return t('toast.sessionRevoked')
      case 'revoke_block_ip': return t('toast.sessionRevokedAndBlocked')
      case 'require_mfa': return t('toast.mfaRequirementAdded')
      case 'quarantine_ip': return t('toast.ipQuarantined')
      case 'flag_compromised': return t('toast.sessionFlagged')
      case 'require_reauth': return t('toast.reauthRequired')
      default: return t('toast.actionCompleted')
    }
  }

  const getRiskBadge = (level: string, score: number) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    }
    
    const colors = {
      low: 'text-green-600',
      medium: 'text-amber-600', 
      high: 'text-red-600',
      critical: 'text-red-800'
    }

    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={variants[level as keyof typeof variants] as any}>
            <span className={colors[level as keyof typeof colors]}>{score}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('risk.score', { score, level })}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const getMfaBadge = (mfa: ActiveSession['mfa']) => {
    switch (mfa.status) {
      case 'passed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('mfa.passed')}
          </Badge>
        )
      case 'required':
        return (
          <Badge variant="secondary" className="bg-amber-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            {t('mfa.required')}
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t('mfa.failed')}
          </Badge>
        )
      case 'bypassed':
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t('mfa.bypassed')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{t('mfa.unknown')}</Badge>
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return t('time.justNow')
    if (diffMins < 60) return t('time.minutesAgo', { minutes: diffMins })
    if (diffMins < 1440) return t('time.hoursAgo', { hours: Math.floor(diffMins / 60) })
    return t('time.daysAgo', { days: Math.floor(diffMins / 1440) })
  }

  const formatTokenTTL = (ttl: number) => {
    const minutes = Math.floor(ttl / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSessions(filteredSessions.map(s => s.id))
    } else {
      setSelectedSessions([])
    }
  }

  const handleSelectSession = (sessionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSessions(prev => [...prev, sessionId])
    } else {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId))
    }
  }

  const isAllSelected = filteredSessions.length > 0 && selectedSessions.length === filteredSessions.length
  const isSomeSelected = selectedSessions.length > 0 && selectedSessions.length < filteredSessions.length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('filters.title')}
            </Button>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-4 p-4 bg-muted/50 rounded-lg">
              <Select
                value={filters.roles?.join(',') || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    roles: value === 'all' ? undefined : value.split(',') 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.allRoles')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allRoles')}</SelectItem>
                  <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  <SelectItem value="security">{t('roles.security')}</SelectItem>
                  <SelectItem value="viewer">{t('roles.viewer')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.deviceTypes?.join(',') || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    deviceTypes: value === 'all' ? undefined : value.split(',') as any
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.allDevices')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allDevices')}</SelectItem>
                  <SelectItem value="desktop">{t('devices.desktop')}</SelectItem>
                  <SelectItem value="mobile">{t('devices.mobile')}</SelectItem>
                  <SelectItem value="tablet">{t('devices.tablet')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.riskLevels?.join(',') || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    riskLevels: value === 'all' ? undefined : value.split(',') as any
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.allRiskLevels')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allRiskLevels')}</SelectItem>
                  <SelectItem value="low">{t('risk.low')}</SelectItem>
                  <SelectItem value="medium">{t('risk.medium')}</SelectItem>
                  <SelectItem value="high">{t('risk.high')}</SelectItem>
                  <SelectItem value="critical">{t('risk.critical')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.mfaStatus?.join(',') || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    mfaStatus: value === 'all' ? undefined : value.split(',') as any
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.allMfaStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allMfaStatus')}</SelectItem>
                  <SelectItem value="passed">{t('filters.mfaPassed')}</SelectItem>
                  <SelectItem value="required">{t('filters.mfaRequired')}</SelectItem>
                  <SelectItem value="failed">{t('filters.mfaFailed')}</SelectItem>
                  <SelectItem value="bypassed">{t('filters.mfaBypassed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t('stats.showing', { filtered: filteredSessions.length, total: sessions.length })}
            </span>
            {selectedSessions.length > 0 && (
              <span className="font-medium">
                {t('stats.selected', { count: selectedSessions.length })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSessions.length > 0 && permissions.canRevoke && (
        <BulkActions
          selectedSessions={selectedSessions}
          onAction={(action, options) => {
            // Handle bulk action
            toast.success(t('toast.bulkCompleted', { action }))
            setSelectedSessions([])
          }}
          onClear={() => setSelectedSessions([])}
        />
      )}

      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">{t('empty.title')}</h3>
              <p className="text-muted-foreground">
                {sessions.length === 0 
                  ? t('empty.noSessions')
                  : t('empty.noResults')
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected
                      }}
                    />
                  </TableHead>
                  <TableHead>{t('table.user')}</TableHead>
                  <TableHead>{t('table.device')}</TableHead>
                  <TableHead>{t('table.location')}</TableHead>
                  <TableHead>{t('table.loginTime')}</TableHead>
                  <TableHead>{t('table.lastActivity')}</TableHead>
                  <TableHead>{t('table.idle')}</TableHead>
                  <TableHead>{t('table.mfa')}</TableHead>
                  <TableHead>{t('table.risk')}</TableHead>
                  <TableHead>{t('table.ttl')}</TableHead>
                  <TableHead>{t('table.concurrent')}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow 
                    key={session.id}
                    className={`
                      ${session.riskScore.level === 'high' || session.riskScore.level === 'critical' 
                        ? 'bg-red-50 border-red-200' 
                        : ''
                      }
                      ${session.anomalies.length > 0 ? 'bg-amber-50' : ''}
                    `}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedSessions.includes(session.id)}
                        onCheckedChange={(checked) => handleSelectSession(session.id, checked as boolean)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user.avatar} />
                          <AvatarFallback>
                            {session.user.firstName[0]}{session.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{session.user.firstName} {session.user.lastName}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">{session.user.email}</p>
                            {session.user.roles.map(role => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(session.device.type)}
                        <div>
                          <p className="text-sm">{session.device.os}</p>
                          <p className="text-xs text-muted-foreground">{session.device.browser}</p>
                          {session.device.isNewDevice && (
                            <Badge variant="outline" className="text-xs">{t('device.new')}</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{session.location.city}, {session.location.countryCode}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <code>{session.location.ip}</code>
                            {session.location.isVpn && <Badge variant="outline" className="text-xs">{t('location.vpn')}</Badge>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatTimeAgo(session.loginAt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.loginAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatTimeAgo(session.lastActivity)}</p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          <span>{t('status.active')}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Timer className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDuration(session.idleTime)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getMfaBadge(session.mfa)}
                    </TableCell>
                    
                    <TableCell>
                      {getRiskBadge(session.riskScore.level, session.riskScore.total)}
                      {session.anomalies.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('anomalies.detected', { count: session.anomalies.length })}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{formatTokenTTL(session.tokens.accessToken.remainingTTL)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{formatTokenTTL(session.tokens.refreshToken.remainingTTL)}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{session.concurrentSessions}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={actionLoading === session.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Sheet>
                            <SheetTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault()
                                setSelectedSessionForDetails(session.id)
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('actions.viewDetails')}
                              </DropdownMenuItem>
                            </SheetTrigger>
                            <SheetContent className="w-[600px] sm:w-[800px]">
                              <SessionDetails 
                                sessionId={session.id} 
                                onClose={() => setSelectedSessionForDetails(null)}
                              />
                            </SheetContent>
                          </Sheet>
                          
                          <DropdownMenuSeparator />
                          
                          {permissions.canRevoke && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleSessionAction(session.id, 'revoke')}
                                className="text-red-600"
                              >
                                <LogOut className="h-4 w-4 mr-2" />
                                {t('actions.revokeSession')}
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => handleSessionAction(session.id, 'revoke_block_ip', { duration: 15 })}
                                className="text-red-600"
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                {t('actions.revokeAndBlockIp')}
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => handleSessionAction(session.id, 'require_mfa')}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            {t('actions.requireMfa')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => handleSessionAction(session.id, 'flag_compromised')}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            {t('actions.flagCompromised')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}