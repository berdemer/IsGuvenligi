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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  TrendingUp,
  Eye,
  Flag,
  Shield,
  MapPin,
  Clock,
  Smartphone,
  Activity,
  Brain,
  Zap,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { ActiveSession, SessionAnomaly, RiskFactor } from "@/types/session"

interface SessionsAnomaliesProps {
  sessions: ActiveSession[]
  onSessionAction: (sessionId: string, action: string) => void
}

interface DetectedAnomaly {
  id: string
  sessionId: string
  session: ActiveSession
  type: 'geo_velocity' | 'device_anomaly' | 'time_anomaly' | 'behavior_anomaly' | 'concurrent_sessions' | 'ip_reputation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  score: number
  description: string
  detectedAt: Date
  status: 'new' | 'investigating' | 'resolved' | 'false_positive'
  factors: RiskFactor[]
}

const ANOMALY_RULES = {
  geo_velocity: {
    name: "Geographic Velocity",
    description: "Impossible travel between login locations",
    threshold: 500, // km/h
    weight: 30
  },
  device_anomaly: {
    name: "Device Anomaly", 
    description: "Unusual device or browser fingerprint",
    threshold: 0.8,
    weight: 20
  },
  time_anomaly: {
    name: "Time Anomaly",
    description: "Login at unusual hours for user",
    threshold: 0.05, // 5th percentile
    weight: 15
  },
  behavior_anomaly: {
    name: "Behavioral Anomaly", 
    description: "Unusual user behavior patterns",
    threshold: 0.7,
    weight: 25
  },
  concurrent_sessions: {
    name: "Concurrent Sessions",
    description: "Excessive concurrent sessions",
    threshold: 3,
    weight: 20
  },
  ip_reputation: {
    name: "IP Reputation",
    description: "Known malicious or suspicious IP",
    threshold: 0.6,
    weight: 35
  }
}

export function SessionsAnomalies({ sessions, onSessionAction }: SessionsAnomaliesProps) {
  const t = useTranslations('common.sessions.anomalies')
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("new")

  // Risk scoring algorithm
  const calculateRiskScore = (session: ActiveSession): { score: number, factors: RiskFactor[] } => {
    const factors: RiskFactor[] = []
    let totalScore = 0

    // Geographic velocity check (simplified)
    if (session.location && session.location.country !== 'United States') {
      const factor: RiskFactor = {
        type: 'geo_anomaly',
        weight: 20,
        value: 1,
        description: 'Login from foreign country'
      }
      factors.push(factor)
      totalScore += factor.weight
    }

    // New device check
    if (session.device && session.device.isNewDevice) {
      const factor: RiskFactor = {
        type: 'new_device',
        weight: 15,
        value: 1,
        description: 'First-time device detection'
      }
      factors.push(factor)
      totalScore += factor.weight
    }

    // MFA check
    if (session.mfa && session.mfa.status !== 'passed') {
      const factor: RiskFactor = {
        type: 'missing_mfa',
        weight: 25,
        value: 1,
        description: 'Multi-factor authentication not verified'
      }
      factors.push(factor)
      totalScore += factor.weight
    }

    // Time anomaly (simplified - check if login outside business hours)
    const loginTime = new Date(session.loginAt)
    const loginHour = loginTime.getHours()
    if (loginHour < 6 || loginHour > 22) {
      const factor: RiskFactor = {
        type: 'unusual_time',
        weight: 10,
        value: 1,
        description: 'Login outside normal business hours'
      }
      factors.push(factor)
      totalScore += factor.weight
    }

    // Session duration anomaly
    const sessionDuration = Date.now() - new Date(session.loginAt).getTime()
    const hoursDuration = sessionDuration / (1000 * 60 * 60)
    if (hoursDuration > 12) {
      const factor: RiskFactor = {
        type: 'long_session',
        weight: 5,
        value: hoursDuration / 24,
        description: `Unusually long session duration (${Math.round(hoursDuration)}h)`
      }
      factors.push(factor)
      totalScore += factor.weight * Math.min(factor.value, 2)
    }

    return {
      score: Math.min(Math.round(totalScore), 100),
      factors
    }
  }

  // Detect anomalies from sessions
  const detectedAnomalies: DetectedAnomaly[] = useMemo(() => {
    const anomalies: DetectedAnomaly[] = []
    
    sessions.forEach((session) => {
      const { score, factors } = calculateRiskScore(session)
      
      if (score >= 40) { // Only flag sessions with significant risk
        const getSeverity = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
          if (score >= 80) return 'critical'
          if (score >= 70) return 'high'  
          if (score >= 50) return 'medium'
          return 'low'
        }

        const getAnomalyType = (factors: RiskFactor[]): DetectedAnomaly['type'] => {
          if (factors.some(f => f.type === 'geo_anomaly')) return 'geo_velocity'
          if (factors.some(f => f.type === 'new_device')) return 'device_anomaly'
          if (factors.some(f => f.type === 'unusual_time')) return 'time_anomaly'
          if (factors.some(f => f.type === 'long_session')) return 'behavior_anomaly'
          return 'behavior_anomaly'
        }

        anomalies.push({
          id: `anomaly-${session.id}`,
          sessionId: session.id,
          session,
          type: getAnomalyType(factors),
          severity: getSeverity(score),
          score,
          description: factors.map(f => f.description).join(', '),
          detectedAt: new Date(),
          status: 'new',
          factors
        })
      }
    })

    return anomalies.sort((a, b) => b.score - a.score)
  }, [sessions])

  // Filter anomalies
  const filteredAnomalies = useMemo(() => {
    return detectedAnomalies.filter(anomaly => {
      if (searchQuery && !`${anomaly.session.user.firstName} ${anomaly.session.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !anomaly.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      if (severityFilter !== 'all' && anomaly.severity !== severityFilter) {
        return false
      }
      
      if (typeFilter !== 'all' && anomaly.type !== typeFilter) {
        return false
      }
      
      if (statusFilter !== 'all' && anomaly.status !== statusFilter) {
        return false
      }
      
      return true
    })
  }, [detectedAnomalies, searchQuery, severityFilter, typeFilter, statusFilter])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-red-400' 
      case 'medium': return 'bg-amber-500'
      case 'low': return 'bg-yellow-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4" />
      case 'investigating': return <Eye className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'false_positive': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const anomalyStats = {
    total: detectedAnomalies.length,
    critical: detectedAnomalies.filter(a => a.severity === 'critical').length,
    high: detectedAnomalies.filter(a => a.severity === 'high').length,
    medium: detectedAnomalies.filter(a => a.severity === 'medium').length,
    new: detectedAnomalies.filter(a => a.status === 'new').length
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
          <Badge variant="outline" className="text-red-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {anomalyStats.critical + anomalyStats.high} {t('highPriority')}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalAnomalies')}</p>
                <p className="text-2xl font-bold">{anomalyStats.total}</p>
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
                <p className="text-2xl font-bold text-red-600">{anomalyStats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.highRisk')}</p>
                <p className="text-2xl font-bold text-amber-600">{anomalyStats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Flag className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.mediumRisk')}</p>
                <p className="text-2xl font-bold text-yellow-600">{anomalyStats.medium}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.new')}</p>
                <p className="text-2xl font-bold text-blue-600">{anomalyStats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="anomalies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="anomalies">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t('tabs.detectedAnomalies')}
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Shield className="h-4 w-4 mr-2" />
            {t('tabs.detectionRules')}
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <Activity className="h-4 w-4 mr-2" />
            {t('tabs.patternAnalysis')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('filters.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allSeverities')}</SelectItem>
                    <SelectItem value="critical">{t('stats.critical')}</SelectItem>
                    <SelectItem value="high">{t('stats.highRisk')}</SelectItem>
                    <SelectItem value="medium">{t('stats.mediumRisk')}</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                    <SelectItem value="geo_velocity">{t('filters.geographic')}</SelectItem>
                    <SelectItem value="device_anomaly">{t('filters.device')}</SelectItem>
                    <SelectItem value="time_anomaly">{t('filters.time')}</SelectItem>
                    <SelectItem value="behavior_anomaly">{t('filters.behavior')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                    <SelectItem value="new">{t('stats.new')}</SelectItem>
                    <SelectItem value="investigating">{t('filters.investigating')}</SelectItem>
                    <SelectItem value="resolved">{t('filters.resolved')}</SelectItem>
                    <SelectItem value="false_positive">{t('filters.falsePositive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('tabs.detectedAnomalies')} ({filteredAnomalies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.user')}</TableHead>
                    <TableHead>{t('table.type')}</TableHead>
                    <TableHead>{t('table.severity')}</TableHead>
                    <TableHead>{t('table.riskScore')}</TableHead>
                    <TableHead>{t('table.description')}</TableHead>
                    <TableHead>{t('table.detected')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead>{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnomalies.map((anomaly) => (
                    <TableRow key={anomaly.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{anomaly.session.user.firstName} {anomaly.session.user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{anomaly.session.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {anomaly.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={anomaly.score} className="w-16 h-2" />
                          <span className="text-sm font-medium">{anomaly.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate" title={anomaly.description}>
                          {anomaly.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{anomaly.detectedAt.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(anomaly.status)}
                          <span className="text-sm capitalize">{anomaly.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSessionAction(anomaly.sessionId, 'investigate')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSessionAction(anomaly.sessionId, 'flag')}
                          >
                            <Flag className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('rules.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(ANOMALY_RULES).map(([key, rule]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant="outline">{t('rules.weight')}: {rule.weight}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{t('rules.threshold')}:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{rule.threshold}</code>
                      </div>
                      <Button variant="outline" size="sm">
                        {t('rules.configure')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('patterns.commonTypes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: t('patterns.geographicVelocity'), count: 15, percentage: 35 },
                    { type: t('patterns.deviceAnomaly'), count: 12, percentage: 28 },
                    { type: t('patterns.timeAnomaly'), count: 8, percentage: 19 },
                    { type: t('patterns.behavioralAnomaly'), count: 7, percentage: 16 },
                    { type: t('patterns.ipReputation'), count: 1, percentage: 2 }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.type}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.percentage} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('patterns.riskDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { range: t('patterns.critical80100'), count: anomalyStats.critical, color: 'bg-red-500' },
                    { range: t('patterns.high6079'), count: anomalyStats.high, color: 'bg-amber-500' },
                    { range: t('patterns.medium4059'), count: anomalyStats.medium, color: 'bg-yellow-400' },
                    { range: t('patterns.low2039'), count: 2, color: 'bg-green-400' }
                  ].map((item) => (
                    <div key={item.range} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${item.color}`} />
                        <span className="text-sm">{item.range}</span>
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}