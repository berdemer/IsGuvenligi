"use client"

import { useState } from "react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  MapPin,
  Clock,
  Key,
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Activity,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  LogOut,
  Flag,
  Timer,
  User,
  Settings,
  Network
} from "lucide-react"
import { ActiveSession } from "@/types/session"

interface SecurityEvent {
  id: string
  sessionId: string
  type: string
  severity: string
  timestamp: Date
  details: any
  ipAddress: string
  userAgent: string
}

interface SessionTimeline {
  id: string
  sessionId: string
  timestamp: Date
  action: string
  details: any
  ipAddress: string
  userAgent: string
}

interface SessionDetailsProps {
  session: ActiveSession | null
  isOpen: boolean
  onClose: () => void
  onSessionAction: (sessionId: string, action: string) => void
}

export function SessionDetails({ 
  session, 
  isOpen, 
  onClose, 
  onSessionAction 
}: SessionDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!session) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No session selected</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getRiskBadgeColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-amber-500" 
    return "bg-green-500"
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return "High Risk"
    if (score >= 40) return "Medium Risk"
    return "Low Risk"
  }

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const diff = endTime.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: "1",
      sessionId: session.id,
      type: "mfa_challenge",
      severity: "medium",
      timestamp: new Date(Date.now() - 7200000),
      details: { method: "TOTP", success: true },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent
    },
    {
      id: "2", 
      sessionId: session.id,
      type: "login_success",
      severity: "info",
      timestamp: new Date(Date.now() - 7200000),
      details: { loginMethod: "password" },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent
    }
  ]

  const mockTimeline: SessionTimeline[] = [
    {
      id: "1",
      sessionId: session.id,
      timestamp: new Date(Date.now() - 7200000),
      action: "session_start",
      details: { method: "password_mfa" },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent
    },
    {
      id: "2",
      sessionId: session.id, 
      timestamp: new Date(Date.now() - 5400000),
      action: "resource_access",
      details: { resource: "/api/workplace/incidents", method: "GET" },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent
    },
    {
      id: "3",
      sessionId: session.id,
      timestamp: new Date(Date.now() - 3600000), 
      action: "token_refresh",
      details: { tokenType: "access_token" },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent
    }
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getDeviceIcon(session.deviceInfo.type)}
                  <span>Session Details</span>
                </div>
                <Badge 
                  className={`ml-2 text-white ${getRiskBadgeColor(session.riskScore)}`}
                >
                  {getRiskLevel(session.riskScore)} ({session.riskScore})
                </Badge>
              </SheetTitle>
              <SheetDescription>
                {session.userInfo.name} • {session.sessionId.slice(0, 8)}...
              </SheetDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => onSessionAction(session.id, 'revoke')}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Revoke
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSessionAction(session.id, 'flag')}
              >
                <Flag className="h-4 w-4 mr-2" />
                Flag
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="geo">
                <Globe className="h-4 w-4 mr-2" />
                Location
              </TabsTrigger>
              <TabsTrigger value="tokens">
                <Key className="h-4 w-4 mr-2" />
                Tokens
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Session Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Session ID</p>
                      <p className="font-mono text-sm">{session.sessionId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">User</p>
                      <p className="text-sm">{session.userInfo.name}</p>
                      <p className="text-xs text-muted-foreground">{session.userInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Client ID</p>
                      <p className="text-sm">{session.clientId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-sm">{formatDuration(session.loginTime)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Roles & Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {session.userInfo.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Scopes</p>
                    <div className="flex flex-wrap gap-2">
                      {session.scope.split(' ').map((scope) => (
                        <Badge key={scope} variant="outline">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
                    <span>Device Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Device Type</p>
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(session.deviceInfo.type)}
                        <span className="text-sm capitalize">{session.deviceInfo.type}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Platform</p>
                      <p className="text-sm">{session.deviceInfo.platform}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Browser</p>
                      <p className="text-sm">{session.deviceInfo.browser}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                      <p className="text-sm font-mono">{session.ipAddress}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                    <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                      {session.userAgent}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {session.mfaVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm font-medium">MFA Status</span>
                      </div>
                      <Badge variant={session.mfaVerified ? "default" : "destructive"}>
                        {session.mfaVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Risk Score</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={session.riskScore} className="w-20" />
                        <span className="text-sm font-medium">{session.riskScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Network className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">ASN</span>
                      </div>
                      <span className="text-sm">{session.asnInfo.asn} - {session.asnInfo.org}</span>
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
                    {mockSecurityEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {event.type === 'mfa_challenge' && <Shield className="h-4 w-4 text-blue-500" />}
                            {event.type === 'login_success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {event.type === 'suspicious_activity' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {event.type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            event.severity === 'high' ? 'destructive' : 
                            event.severity === 'medium' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {event.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Session Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTimeline.map((event, index) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          {index < mockTimeline.length - 1 && (
                            <div className="w-0.5 h-8 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium capitalize">
                              {event.action.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(event.details)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Geographic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Country</p>
                      <p className="text-sm">{session.geoLocation?.country || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">City</p>
                      <p className="text-sm">{session.geoLocation?.city || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Region</p>
                      <p className="text-sm">{session.geoLocation?.region || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Timezone</p>
                      <p className="text-sm">{session.geoLocation?.timezone || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Interactive map would be displayed here</p>
                      <p className="text-xs">Lat: {session.geoLocation.latitude}, Lng: {session.geoLocation.longitude}</p>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">ASN Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">ASN:</span>
                          <span className="text-sm">{session.asnInfo.asn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Organization:</span>
                          <span className="text-sm">{session.asnInfo.org}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">ISP:</span>
                          <span className="text-sm">{session.asnInfo.isp || 'Unknown'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>Token Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Access Token</h4>
                        <Badge variant={session.tokenExpiry > new Date() ? "default" : "destructive"}>
                          {session.tokenExpiry > new Date() ? "Active" : "Expired"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Expires:</span>
                          <span>{session.tokenExpiry.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Type:</span>
                          <span>Bearer</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Refresh Token</h4>
                        <Badge variant="outline">Available</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Last Used:</span>
                          <span>{new Date(Date.now() - 3600000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Session State</h4>
                        <Badge variant={session.status === 'active' ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Remember Me:</span>
                          <span>{session.rememberMe ? "Enabled" : "Disabled"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span>{session.lastActivity.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}