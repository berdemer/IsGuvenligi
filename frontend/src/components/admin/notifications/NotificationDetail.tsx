'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertCircle,
  CheckCircle,
  Archive,
  Trash2,
  ExternalLink,
  User,
  Shield,
  Activity,
  Users,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Smartphone,
  Eye,
  FileText,
  Settings,
  Database
} from 'lucide-react'
import {
  Notification,
  NotificationSeverity,
  SecurityNotification,
  SystemNotification,
  RiskNotification,
  UserActivityNotification
} from '@/types/notification'

interface NotificationDetailProps {
  notification: Notification | null
  open: boolean
  onClose: () => void
  onAction: (action: 'read' | 'archive' | 'delete' | 'follow-up') => void
}

const SeverityIcon = ({ severity }: { severity: NotificationSeverity }) => {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'high':
      return <AlertCircle className="h-5 w-5 text-orange-500" />
    case 'medium':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case 'low':
      return <Info className="h-5 w-5 text-blue-500" />
  }
}

const SeverityBadge = ({ severity }: { severity: NotificationSeverity }) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  return (
    <Badge variant="outline" className={colors[severity]}>
      <SeverityIcon severity={severity} />
      <span className="ml-1 capitalize">{severity}</span>
    </Badge>
  )
}

const TypeIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'security':
      return <Shield className="h-5 w-5 text-red-500" />
    case 'system':
      return <Activity className="h-5 w-5 text-blue-500" />
    case 'risk':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    case 'user_activity':
      return <Users className="h-5 w-5 text-green-500" />
  }
}

const formatDateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

interface SecurityDetailProps {
  notification: SecurityNotification
}

const SecurityDetail: React.FC<SecurityDetailProps> = ({ notification }) => {
  const securityEvent = notification.metadata as any // Type assertion for demo
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-red-500" />
          Security Event Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-600">Event Type</label>
            <div className="mt-1 capitalize">
              {notification.source.replace('_', ' ')}
            </div>
          </div>
          {securityEvent?.ipAddress && (
            <div>
              <label className="font-medium text-gray-600">IP Address</label>
              <div className="mt-1 font-mono">{securityEvent.ipAddress}</div>
            </div>
          )}
          {securityEvent?.userAgent && (
            <div className="col-span-2">
              <label className="font-medium text-gray-600">User Agent</label>
              <div className="mt-1 text-xs break-all bg-gray-50 p-2 rounded">
                {securityEvent.userAgent}
              </div>
            </div>
          )}
          {securityEvent?.location && (
            <div>
              <label className="font-medium text-gray-600">Location</label>
              <div className="mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {securityEvent.location}
              </div>
            </div>
          )}
          {securityEvent?.riskScore && (
            <div>
              <label className="font-medium text-gray-600">Risk Score</label>
              <div className="mt-1">
                <Badge 
                  variant={securityEvent.riskScore > 75 ? "destructive" : securityEvent.riskScore > 50 ? "secondary" : "outline"}
                >
                  {securityEvent.riskScore}/100
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        {securityEvent?.actionRequired && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Action Required</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              This security event requires immediate attention and follow-up action.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SystemDetailProps {
  notification: SystemNotification
}

const SystemDetail: React.FC<SystemDetailProps> = ({ notification }) => {
  const systemEvent = notification.metadata as any
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-blue-500" />
          System Event Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {systemEvent?.systemComponent && (
            <div>
              <label className="font-medium text-gray-600">Component</label>
              <div className="mt-1 capitalize">
                {systemEvent.systemComponent}
              </div>
            </div>
          )}
          {systemEvent?.responseTime && (
            <div>
              <label className="font-medium text-gray-600">Response Time</label>
              <div className="mt-1">{systemEvent.responseTime}ms</div>
            </div>
          )}
          {systemEvent?.autoResolvable !== undefined && (
            <div>
              <label className="font-medium text-gray-600">Auto Resolvable</label>
              <div className="mt-1">
                <Badge variant={systemEvent.autoResolvable ? "outline" : "secondary"}>
                  {systemEvent.autoResolvable ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="flex items-center gap-2 text-blue-800">
            <Info className="h-4 w-4" />
            <span className="font-medium">System Status</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            System components are being monitored. 
            {systemEvent?.autoResolvable ? " This issue may resolve automatically." : " Manual intervention may be required."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface RiskDetailProps {
  notification: RiskNotification
}

const RiskDetail: React.FC<RiskDetailProps> = ({ notification }) => {
  const riskEvent = notification.metadata as any
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Risk & Safety Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {riskEvent?.riskScore && (
            <div>
              <label className="font-medium text-gray-600">Risk Score</label>
              <div className="mt-1">
                <Badge 
                  variant={riskEvent.riskScore > 75 ? "destructive" : riskEvent.riskScore > 50 ? "secondary" : "outline"}
                >
                  {riskEvent.riskScore}/100
                </Badge>
              </div>
            </div>
          )}
          {riskEvent?.affectedUsers && (
            <div>
              <label className="font-medium text-gray-600">Affected Users</label>
              <div className="mt-1">{riskEvent.affectedUsers}</div>
            </div>
          )}
        </div>
        
        {riskEvent?.actionRequired && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Safety Action Required</span>
            </div>
            <p className="text-orange-700 text-sm mt-1">
              This risk event requires safety management attention and corrective action.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface UserActivityDetailProps {
  notification: UserActivityNotification
}

const UserActivityDetail: React.FC<UserActivityDetailProps> = ({ notification }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-green-500" />
          User Activity Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <label className="font-medium text-gray-600">Activity Type</label>
          <div className="mt-1 capitalize">
            {notification.source.replace('_', ' ')}
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <div className="flex items-center gap-2 text-green-800">
            <Users className="h-4 w-4" />
            <span className="font-medium">User Management</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            User account changes have been logged for audit purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export const NotificationDetail = ({ notification, open, onClose, onAction }: NotificationDetailProps) => {
  if (!notification) return null

  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = async (action: 'read' | 'archive' | 'delete' | 'follow-up') => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    onAction(action)
    setIsProcessing(false)
    if (action !== 'follow-up') {
      onClose()
    }
  }

  const getFollowUpAction = () => {
    switch (notification.type) {
      case 'security':
        return { text: 'Review Security Logs', icon: Shield }
      case 'system':
        return { text: 'Check System Status', icon: Activity }
      case 'risk':
        return { text: 'Open Incident Report', icon: AlertTriangle }
      case 'user_activity':
        return { text: 'View User Profile', icon: Users }
      default:
        return { text: 'Take Action', icon: ExternalLink }
    }
  }

  const followUpAction = getFollowUpAction()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] max-w-[90vw] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SheetTitle className="flex items-center gap-2">
                <TypeIcon type={notification.type} />
                {notification.title}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={notification.severity} />
                <Badge variant="outline" className="capitalize">
                  {notification.source.replace('_', ' ')}
                </Badge>
                <Badge 
                  variant={notification.status === 'unread' ? 'destructive' : 'outline'}
                  className="capitalize"
                >
                  {notification.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <Separator />
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-900">{notification.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">Created</label>
                  <div className="mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(notification.createdAt)}
                  </div>
                </div>
                
                {notification.readAt && (
                  <div>
                    <label className="font-medium text-gray-600">Read At</label>
                    <div className="mt-1 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatDateTime(notification.readAt)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Entity */}
          {notification.relatedEntity && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Entity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {notification.relatedEntity.type === 'user' && <User className="h-4 w-4" />}
                    {notification.relatedEntity.type === 'session' && <Activity className="h-4 w-4" />}
                    {notification.relatedEntity.type === 'policy' && <Shield className="h-4 w-4" />}
                    {notification.relatedEntity.type === 'incident' && <AlertTriangle className="h-4 w-4" />}
                    {notification.relatedEntity.type === 'resource' && <Database className="h-4 w-4" />}
                    {notification.relatedEntity.type === 'system' && <Settings className="h-4 w-4" />}
                    
                    <span className="font-medium">{notification.relatedEntity.name}</span>
                    <Badge variant="secondary">{notification.relatedEntity.type}</Badge>
                  </div>
                  
                  {notification.relatedEntity.metadata && (
                    <div className="text-xs bg-gray-50 p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(notification.relatedEntity.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Type-specific Details */}
          {notification.type === 'security' && (
            <SecurityDetail notification={notification as SecurityNotification} />
          )}
          
          {notification.type === 'system' && (
            <SystemDetail notification={notification as SystemNotification} />
          )}
          
          {notification.type === 'risk' && (
            <RiskDetail notification={notification as RiskNotification} />
          )}
          
          {notification.type === 'user_activity' && (
            <UserActivityDetail notification={notification as UserActivityNotification} />
          )}

          {/* Additional Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs bg-gray-50 p-3 rounded">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(notification.metadata, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {notification.status === 'unread' && (
                  <Button
                    onClick={() => handleAction('read')}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => handleAction('archive')}
                  disabled={isProcessing}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleAction('follow-up')}
                  disabled={isProcessing}
                >
                  <followUpAction.icon className="h-4 w-4 mr-2" />
                  {followUpAction.text}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => handleAction('delete')}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}