"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Shield,
  Clock,
  AlertTriangle,
  Activity,
  Users,
  MapPin,
  Calendar,
  Download
} from "lucide-react"
import { ActiveSession, SessionAnalytics } from "@/types/session"

interface SessionsAnalyticsProps {
  sessions: ActiveSession[]
  analytics: SessionAnalytics
}

interface ChartDataPoint {
  name: string
  value: number
  percentage?: number
}

interface HeatmapCell {
  hour: number
  day: number
  value: number
  intensity: 'low' | 'medium' | 'high'
}

export function SessionsAnalytics({ sessions, analytics }: SessionsAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("sessions")

  // Calculate device distribution
  const deviceDistribution: ChartDataPoint[] = useMemo(() => {
    const deviceCounts = sessions.reduce((acc, session) => {
      const device = session.device?.type || 'unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = sessions.length
    return Object.entries(deviceCounts).map(([device, count]) => ({
      name: device,
      value: count,
      percentage: Math.round((count / total) * 100)
    }))
  }, [sessions])

  // Calculate geographic distribution
  const geoDistribution: ChartDataPoint[] = useMemo(() => {
    const countryCounts = sessions.reduce((acc, session) => {
      const country = session.location?.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = sessions.length
    return Object.entries(countryCounts)
      .map(([country, count]) => ({
        name: country,
        value: count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [sessions])

  // Calculate risk distribution
  const riskDistribution: ChartDataPoint[] = useMemo(() => {
    const riskRanges = {
      'Low (0-39)': sessions.filter(s => (s.riskScore?.total || 0) < 40).length,
      'Medium (40-69)': sessions.filter(s => (s.riskScore?.total || 0) >= 40 && (s.riskScore?.total || 0) < 70).length,
      'High (70-100)': sessions.filter(s => (s.riskScore?.total || 0) >= 70).length
    }

    const total = sessions.length
    return Object.entries(riskRanges).map(([range, count]) => ({
      name: range,
      value: count,
      percentage: Math.round((count / total) * 100)
    }))
  }, [sessions])

  // Generate activity heatmap data (simplified)
  const heatmapData: HeatmapCell[] = useMemo(() => {
    const data: HeatmapCell[] = []
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Simulate activity data with some patterns
        let value = Math.floor(Math.random() * 100)
        
        // Simulate business hours pattern
        if (hour >= 9 && hour <= 17 && day >= 1 && day <= 5) {
          value = Math.floor(Math.random() * 50) + 50
        }
        
        // Simulate weekend pattern
        if (day === 0 || day === 6) {
          value = Math.floor(Math.random() * 30) + 10
        }

        const intensity = value > 70 ? 'high' : value > 40 ? 'medium' : 'low'
        
        data.push({
          hour,
          day,
          value,
          intensity
        })
      }
    }
    
    return data
  }, [])

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Smartphone className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getDayLabel = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[day]
  }

  const getIntensityColor = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-amber-500'
      default: return 'bg-green-200'
    }
  }

  const topAnomalies = [
    { type: "Multiple concurrent sessions", count: 8, severity: "medium" },
    { type: "Unusual login time", count: 12, severity: "low" },
    { type: "New device login", count: 5, severity: "high" },
    { type: "Geographic anomaly", count: 3, severity: "high" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Session Analytics</h2>
          <p className="text-muted-foreground">
            Insights and patterns from {sessions.length} active sessions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="geographic">
            <MapPin className="h-4 w-4 mr-2" />
            Geographic
          </TabsTrigger>
          <TabsTrigger value="devices">
            <Monitor className="h-4 w-4 mr-2" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Peak Concurrent</p>
                    <p className="text-2xl font-bold">{analytics.peakConcurrentSessions}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% vs last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.averageSessionDuration / 60)}m</p>
                    <p className="text-xs text-red-600 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -5% vs last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                    <p className="text-2xl font-bold">{analytics.highRiskSessions}</p>
                    <p className="text-xs text-amber-600">
                      {Math.round((analytics.highRiskSessions / sessions.length) * 100)}% of total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">MFA Coverage</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.mfaCoverage * 100)}%</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +3% vs last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskDistribution.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">{item.value} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topAnomalies.map((anomaly, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{anomaly.type}</p>
                        <p className="text-xs text-muted-foreground">{anomaly.count} occurrences</p>
                      </div>
                      <Badge 
                        variant={
                          anomaly.severity === 'high' ? 'destructive' : 
                          anomaly.severity === 'medium' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {anomaly.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Sessions by Country</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geoDistribution.map((country, index) => (
                    <div key={country.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                        <span className="text-sm font-medium">{country.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={country.percentage} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground w-12">{country.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">World Map</p>
                    <p className="text-sm">Interactive geographic visualization would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceDistribution.map((device) => (
                    <div key={device.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(device.name)}
                          <span className="text-sm font-medium capitalize">{device.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{device.value} ({device.percentage}%)</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Chrome", value: 45, percentage: 65 },
                    { name: "Firefox", value: 15, percentage: 22 },
                    { name: "Safari", value: 8, percentage: 12 },
                    { name: "Edge", value: 1, percentage: 1 }
                  ].map((browser) => (
                    <div key={browser.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{browser.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={browser.percentage} className="w-24 h-2" />
                        <span className="text-sm text-muted-foreground w-12">{browser.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">MFA Enabled Sessions</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={Math.round(analytics.mfaCoverage * 100)} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(analytics.mfaCoverage * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">High Risk Sessions</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(analytics.highRiskSessions / sessions.length) * 100} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">
                        {Math.round((analytics.highRiskSessions / sessions.length) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Flagged Sessions</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={5} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { event: "Failed MFA attempts", count: 23, trend: "up" },
                    { event: "Suspicious login locations", count: 12, trend: "up" },
                    { event: "Session hijacking attempts", count: 3, trend: "down" },
                    { event: "Concurrent session violations", count: 8, trend: "stable" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.event}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.count}</span>
                        {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                        {item.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Activity Heatmap - {timeRange}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-200 rounded" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>High</span>
                  </div>
                </div>

                <div className="grid grid-cols-25 gap-1">
                  <div></div>
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="text-xs text-muted-foreground text-center">
                      {i % 6 === 0 ? i.toString().padStart(2, '0') : ''}
                    </div>
                  ))}
                  
                  {Array.from({ length: 7 }, (_, day) => (
                    <div key={day} className="contents">
                      <div className="text-xs text-muted-foreground text-right pr-2">
                        {getDayLabel(day)}
                      </div>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const cell = heatmapData.find(d => d.day === day && d.hour === hour)
                        return (
                          <div
                            key={`${day}-${hour}`}
                            className={`w-4 h-4 rounded-sm ${getIntensityColor(cell?.intensity || 'low')} cursor-pointer`}
                            title={`${getDayLabel(day)} ${hour}:00 - ${cell?.value || 0} sessions`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}