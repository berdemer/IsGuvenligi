"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Monitor, Smartphone, Tablet, Globe, AlertCircle, RefreshCw, LogOut, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface Session {
  id: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  location: string
  country: string
  lastSeen: string
  ip: string
  isCurrent: boolean
}

const mockSessions: Session[] = [
  {
    id: "current",
    deviceName: "MacBook Pro",
    deviceType: "desktop",
    browser: "Chrome 120.0.0.0",
    os: "macOS",
    location: "Istanbul, Turkey",
    country: "TR",
    lastSeen: "2024-01-15T10:30:00Z",
    ip: "192.168.1.100",
    isCurrent: true
  },
  {
    id: "session_2",
    deviceName: "iPhone 15 Pro",
    deviceType: "mobile",
    browser: "Safari 17.2",
    os: "iOS 17.2",
    location: "Istanbul, Turkey",
    country: "TR",
    lastSeen: "2024-01-15T08:15:00Z",
    ip: "192.168.1.101",
    isCurrent: false
  },
  {
    id: "session_3",
    deviceName: "Windows Desktop",
    deviceType: "desktop",
    browser: "Firefox 121.0",
    os: "Windows 11",
    location: "Ankara, Turkey",
    country: "TR",
    lastSeen: "2024-01-14T16:45:00Z",
    ip: "10.0.0.50",
    isCurrent: false
  },
  {
    id: "session_4",
    deviceName: "iPad Air",
    deviceType: "tablet",
    browser: "Safari 17.1",
    os: "iPadOS 17.1",
    location: "Izmir, Turkey",
    country: "TR",
    lastSeen: "2024-01-13T14:20:00Z",
    ip: "192.168.2.50",
    isCurrent: false
  },
  {
    id: "session_5",
    deviceName: "Unknown Device",
    deviceType: "desktop",
    browser: "Chrome 119.0.0.0",
    os: "Windows 10",
    location: "Unknown Location",
    country: "Unknown",
    lastSeen: "2024-01-12T11:30:00Z",
    ip: "203.0.113.1",
    isCurrent: false
  }
]

export function SessionsCard() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSessions(mockSessions)
    } catch (err) {
      setError("Failed to load session data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone
      case 'tablet':
        return Tablet
      default:
        return Monitor
    }
  }

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) {
      return "Active now"
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return `${diffDays} days ago`
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (sessions.find(s => s.id === sessionId)?.isCurrent) {
      toast.error("Cannot revoke current session")
      return
    }

    setRevoking(sessionId)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      toast.success("Session revoked successfully")
    } catch (error) {
      toast.error("Failed to revoke session")
    } finally {
      setRevoking(null)
    }
  }

  const handleRevokeAllSessions = async () => {
    setRevokingAll(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSessions(prev => prev.filter(s => s.isCurrent))
      toast.success("All other sessions revoked successfully")
      setRevokeAllDialogOpen(false)
    } catch (error) {
      toast.error("Failed to revoke sessions")
    } finally {
      setRevokingAll(false)
    }
  }

  const handleRetry = () => {
    fetchSessions()
  }

  const activeSessions = sessions.filter(s => !s.isCurrent).length
  const suspiciousSessions = sessions.filter(s => s.country === "Unknown" || s.location.includes("Unknown")).length

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Active Sessions</span>
          </CardTitle>
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-8 w-8" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
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
            <Globe className="h-5 w-5" />
            <span>Active Sessions</span>
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
          <Globe className="h-5 w-5" />
          <span>Active Sessions</span>
        </CardTitle>
        <Dialog open={revokeAllDialogOpen} onOpenChange={setRevokeAllDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={activeSessions === 0}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Revoke All
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke All Sessions</DialogTitle>
              <DialogDescription>
                This will sign you out of all other devices and browsers. You will remain signed in on this device.
              </DialogDescription>
            </DialogHeader>
            
            {suspiciousSessions > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We detected {suspiciousSessions} potentially suspicious session{suspiciousSessions > 1 ? 's' : ''} from unknown locations.
                  Revoking all sessions is recommended for security.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRevokeAllDialogOpen(false)}
                disabled={revokingAll}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRevokeAllSessions}
                disabled={revokingAll}
              >
                {revokingAll ? 'Revoking...' : 'Revoke All Sessions'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suspiciousSessions > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {suspiciousSessions} suspicious session{suspiciousSessions > 1 ? 's' : ''} detected from unknown locations.
                  Review and revoke if necessary.
                </AlertDescription>
              </Alert>
            )}

            {sessions.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.deviceType)
              const isUnknown = session.country === "Unknown" || session.location.includes("Unknown")
              
              return (
                <div key={session.id}>
                  <div className={`flex items-start space-x-4 p-4 border rounded-lg ${
                    session.isCurrent ? 'bg-muted/50 border-primary' : ''
                  } ${isUnknown ? 'border-amber-200 bg-amber-50' : ''}`}>
                    <DeviceIcon className="h-6 w-6 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{session.deviceName}</h4>
                        {session.isCurrent && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                        {isUnknown && (
                          <Badge variant="outline" className="text-xs text-amber-700">
                            Suspicious
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.browser} on {session.os}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <span>{session.location}</span>
                        <span>•</span>
                        <span>{session.ip}</span>
                        <span>•</span>
                        <span>{formatLastSeen(session.lastSeen)}</span>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revoking === session.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {revoking === session.id ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Revoking
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Revoke
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {index < sessions.length - 1 && <Separator className="my-2" />}
                </div>
              )
            })}

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                {sessions.length} total session{sessions.length > 1 ? 's' : ''} 
                {activeSessions > 0 && (
                  <span> • {activeSessions} other device{activeSessions > 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}