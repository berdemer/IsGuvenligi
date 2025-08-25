"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Download, AlertCircle, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

interface ActivityLog {
  id: string
  type: 'login' | 'logout' | 'password_change' | 'mfa_enabled' | 'mfa_disabled' | 'profile_updated' | 'session_revoked'
  summary: string
  timestamp: string
  ip: string
  userAgent?: string
  location?: string
}

const mockActivities: ActivityLog[] = [
  {
    id: "1",
    type: "login",
    summary: "Successful login",
    timestamp: "2024-01-15T10:30:00Z",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    location: "Istanbul, Turkey"
  },
  {
    id: "2",
    type: "profile_updated",
    summary: "Profile information updated",
    timestamp: "2024-01-15T09:15:00Z",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    location: "Istanbul, Turkey"
  },
  {
    id: "3",
    type: "mfa_enabled",
    summary: "Two-factor authentication enabled",
    timestamp: "2024-01-14T16:45:00Z",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    location: "Istanbul, Turkey"
  },
  {
    id: "4",
    type: "login",
    summary: "Successful login",
    timestamp: "2024-01-14T08:30:00Z",
    ip: "10.0.0.50",
    userAgent: "Firefox 121.0",
    location: "Ankara, Turkey"
  },
  {
    id: "5",
    type: "password_change",
    summary: "Password changed successfully",
    timestamp: "2024-01-13T14:20:00Z",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    location: "Istanbul, Turkey"
  },
  {
    id: "6",
    type: "session_revoked",
    summary: "Session revoked from mobile device",
    timestamp: "2024-01-12T11:10:00Z",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    location: "Istanbul, Turkey"
  },
  {
    id: "7",
    type: "logout",
    summary: "User logged out",
    timestamp: "2024-01-11T17:00:00Z",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    location: "Istanbul, Turkey"
  },
  {
    id: "8",
    type: "login",
    summary: "Failed login attempt",
    timestamp: "2024-01-11T16:58:00Z",
    ip: "203.0.113.1",
    userAgent: "Unknown",
    location: "Unknown"
  },
  {
    id: "9",
    type: "profile_updated",
    summary: "Notification preferences updated",
    timestamp: "2024-01-10T13:25:00Z",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    location: "Istanbul, Turkey"
  },
  {
    id: "10",
    type: "login",
    summary: "Successful login",
    timestamp: "2024-01-10T09:00:00Z",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    location: "Istanbul, Turkey"
  }
]

export function ActivityTable() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setActivities(mockActivities)
    } catch (err) {
      setError("Failed to load activity data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'login':
        return 'default'
      case 'logout':
        return 'secondary'
      case 'password_change':
      case 'mfa_enabled':
        return 'default'
      case 'mfa_disabled':
      case 'session_revoked':
        return 'outline'
      case 'profile_updated':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'login':
      case 'mfa_enabled':
      case 'password_change':
        return 'success'
      case 'session_revoked':
        return 'warning'
      case 'mfa_disabled':
        return 'warning'
      default:
        return 'info'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return `${diffDays} days ago`
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      // Mock CSV export
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const csvContent = [
        ['Type', 'Summary', 'Timestamp', 'IP Address', 'User Agent', 'Location'],
        ...activities.map(activity => [
          activity.type,
          activity.summary,
          activity.timestamp,
          activity.ip,
          activity.userAgent || 'Unknown',
          activity.location || 'Unknown'
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Activity log exported successfully')
    } catch (error) {
      toast.error('Failed to export activity log')
    } finally {
      setExporting(false)
    }
  }

  const handleRetry = () => {
    fetchActivities()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <Skeleton className="h-9 w-20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-6 w-16" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activity to display</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                <Badge variant={getBadgeVariant(activity.type)} className="mt-0.5">
                  {activity.type.replace('_', ' ')}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.summary}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <span>{activity.ip}</span>
                    {activity.location && (
                      <>
                        <span>•</span>
                        <span>{activity.location}</span>
                      </>
                    )}
                    {activity.userAgent && (
                      <>
                        <span>•</span>
                        <span>{activity.userAgent}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}