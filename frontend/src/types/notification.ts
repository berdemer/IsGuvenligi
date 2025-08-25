// Notification Management Types and Interfaces

// Basic Types
export type NotificationType = 'security' | 'system' | 'risk' | 'user_activity'
export type NotificationStatus = 'unread' | 'read' | 'archived'
export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical'
export type NotificationSource = 'auth' | 'access_policies' | 'health' | 'keycloak' | 'system' | 'user_management' | 'risk_assessment' | 'incidents'

// Notification Entity
export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  source: NotificationSource
  severity: NotificationSeverity
  status: NotificationStatus
  
  // Related entity information
  relatedEntity?: {
    type: 'user' | 'session' | 'policy' | 'resource' | 'incident' | 'system'
    id: string
    name: string
    metadata?: Record<string, any>
  }
  
  // User assignment
  userId?: string // null = system-wide notification
  
  // Timestamps
  createdAt: string
  readAt?: string
  archivedAt?: string
  
  // Additional metadata
  metadata?: {
    ipAddress?: string
    userAgent?: string
    location?: string
    riskScore?: number
    affectedUsers?: number
    systemComponent?: string
    actionRequired?: boolean
    autoResolvable?: boolean
  }
}

// Notification Settings
export interface NotificationSettings {
  userId: string
  channels: {
    inApp: boolean
    email: boolean
    sms: boolean
    push?: boolean
  }
  
  // Type-specific settings
  typeSettings: {
    security: {
      enabled: boolean
      minSeverity: NotificationSeverity
      channels: ('inApp' | 'email' | 'sms')[]
    }
    system: {
      enabled: boolean
      minSeverity: NotificationSeverity
      channels: ('inApp' | 'email' | 'sms')[]
    }
    risk: {
      enabled: boolean
      minSeverity: NotificationSeverity
      channels: ('inApp' | 'email' | 'sms')[]
    }
    user_activity: {
      enabled: boolean
      minSeverity: NotificationSeverity
      channels: ('inApp' | 'email' | 'sms')[]
    }
  }
  
  // Timing settings
  quietHours?: {
    enabled: boolean
    start: string // "22:00"
    end: string   // "08:00"
    timezone: string
  }
  
  // Frequency settings
  digest?: {
    enabled: boolean
    frequency: 'daily' | 'weekly'
    time: string // "09:00"
  }
  
  createdAt: string
  updatedAt: string
}

// Notification Filters
export interface NotificationFilters {
  search?: string
  types?: NotificationType[]
  statuses?: NotificationStatus[]
  severities?: NotificationSeverity[]
  sources?: NotificationSource[]
  dateRange?: {
    from: string
    to: string
  }
  userId?: string
  hasRelatedEntity?: boolean
  actionRequired?: boolean
}

// Notification Analytics
export interface NotificationAnalytics {
  timeRange: {
    from: string
    to: string
  }
  
  // Summary counts
  totalNotifications: number
  unreadNotifications: number
  securityAlerts: number
  systemHealthWarnings: number
  riskNotifications: number
  userActivityNotifications: number
  
  // Distribution
  typeDistribution: {
    type: NotificationType
    count: number
    percentage: number
  }[]
  
  severityDistribution: {
    severity: NotificationSeverity
    count: number
    percentage: number
  }[]
  
  sourceDistribution: {
    source: NotificationSource
    count: number
    percentage: number
  }[]
  
  // Trends
  notificationTrends: {
    date: string
    total: number
    security: number
    system: number
    risk: number
    user_activity: number
  }[]
  
  // Response times
  responseMetrics: {
    averageReadTime: number // minutes
    averageArchiveTime: number // minutes
    unreadRate: number // percentage
  }
  
  // Top sources
  topSources: {
    source: NotificationSource
    count: number
    unreadCount: number
  }[]
}

// Notification Templates
export interface NotificationTemplate {
  id: string
  type: NotificationType
  source: NotificationSource
  severity: NotificationSeverity
  titleTemplate: string
  descriptionTemplate: string
  
  // Template variables
  variables: {
    name: string
    type: 'string' | 'number' | 'boolean' | 'date'
    required: boolean
    description: string
  }[]
  
  // Auto-generation rules
  rules?: {
    condition: string // JSON logic expression
    autoArchive?: {
      after: number // minutes
      condition?: string
    }
    escalation?: {
      after: number // minutes
      increaseSeverity: boolean
      notifyAdmins: boolean
    }
  }
  
  createdAt: string
  updatedAt: string
  active: boolean
}

// Real-time Events
export interface NotificationEvent {
  type: 'notification_created' | 'notification_updated' | 'notification_deleted' | 'bulk_action'
  notification?: Notification
  notifications?: Notification[]
  userId?: string
  action?: string
  timestamp: string
}

// API Response Types
export interface NotificationListResponse {
  notifications: Notification[]
  total: number
  unread: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  
  // Quick stats for current filter
  stats: {
    security: number
    system: number
    risk: number
    user_activity: number
  }
}

export interface NotificationSummaryResponse {
  totalNotifications: number
  unreadNotifications: number
  securityAlerts: number
  systemHealthWarnings: number
  
  // Recent notifications for dropdown
  recentNotifications: Notification[]
  
  // Trends
  trends: {
    notifications: { change: number; trend: 'up' | 'down' }
    security: { change: number; trend: 'up' | 'down' }
    system: { change: number; trend: 'up' | 'down' }
    unreadRate: { change: number; trend: 'up' | 'down' }
  }
}

// Bulk Actions
export interface BulkNotificationAction {
  notificationIds: string[]
  action: 'mark_read' | 'mark_unread' | 'archive' | 'delete'
  reason?: string
}

export interface BulkActionResponse {
  success: boolean
  affected: number
  failed: number
  errors?: {
    notificationId: string
    error: string
  }[]
}

// Notification Creation (for API)
export interface CreateNotificationDto {
  type: NotificationType
  title: string
  description: string
  source: NotificationSource
  severity: NotificationSeverity
  
  userId?: string
  relatedEntity?: {
    type: string
    id: string
    name: string
    metadata?: Record<string, any>
  }
  
  metadata?: Record<string, any>
  
  // Auto-processing options
  autoArchiveAfter?: number // minutes
  requiresAction?: boolean
}

// Notification Update
export interface UpdateNotificationDto {
  status?: NotificationStatus
  title?: string
  description?: string
  severity?: NotificationSeverity
  metadata?: Record<string, any>
}

// Security-specific notification types
export interface SecurityNotification extends Notification {
  type: 'security'
  securityEvent: {
    eventType: 'login_failure' | 'mfa_bypass' | 'session_revoked' | 'policy_conflict' | 'suspicious_activity' | 'access_denied'
    userId?: string
    sessionId?: string
    policyId?: string
    ipAddress?: string
    userAgent?: string
    riskScore?: number
    location?: {
      country?: string
      city?: string
      coordinates?: { lat: number; lng: number }
    }
  }
}

// System-specific notification types
export interface SystemNotification extends Notification {
  type: 'system'
  systemEvent: {
    eventType: 'uptime_drop' | 'db_error' | 'api_latency' | 'keycloak_disconnect' | 'service_unavailable' | 'backup_failed'
    component: string
    metrics?: {
      uptime?: number
      latency?: number
      errorRate?: number
      responseTime?: number
    }
    affectedServices?: string[]
    autoRecovery?: boolean
  }
}

// Risk-specific notification types
export interface RiskNotification extends Notification {
  type: 'risk'
  riskEvent: {
    eventType: 'high_risk_score' | 'incident_report' | 'safety_violation' | 'risk_threshold_exceeded' | 'pattern_detected'
    riskScore?: number
    incidentId?: string
    affectedUsers?: number
    affectedResources?: string[]
    recommendations?: string[]
    actionItems?: {
      action: string
      priority: 'low' | 'medium' | 'high'
      assignee?: string
      dueDate?: string
    }[]
  }
}

// User Activity notification types
export interface UserActivityNotification extends Notification {
  type: 'user_activity'
  userEvent: {
    eventType: 'role_change' | 'user_created' | 'password_change' | 'account_locked' | 'permission_granted' | 'group_membership'
    targetUserId: string
    targetUserName: string
    actorUserId?: string
    actorUserName?: string
    changes?: {
      field: string
      from: any
      to: any
    }[]
    reason?: string
  }
}

// Notification Export
export interface NotificationExport {
  format: 'csv' | 'json' | 'pdf'
  filters?: NotificationFilters
  includeMetadata?: boolean
  includeRelatedEntities?: boolean
  dateRange?: {
    from: string
    to: string
  }
}

// Real-time subscription
export interface NotificationSubscription {
  userId: string
  types?: NotificationType[]
  severities?: NotificationSeverity[]
  sources?: NotificationSource[]
  realTime: boolean
  
  // WebSocket/SSE connection info
  connectionId: string
  lastHeartbeat: string
}

// Error Types
export interface NotificationError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
  timestamp: string
}

// Audit Log for Notifications
export interface NotificationAuditLog {
  id: string
  timestamp: string
  action: 'created' | 'read' | 'archived' | 'deleted' | 'updated' | 'bulk_action'
  notificationId?: string
  notificationIds?: string[]
  actorId: string
  actorName: string
  actorType: 'user' | 'system' | 'api'
  
  details: {
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    bulkAction?: {
      action: string
      affected: number
      failed: number
    }
    metadata?: Record<string, any>
  }
  
  context: {
    ipAddress?: string
    userAgent?: string
    requestId?: string
    correlationId?: string
  }
}

// Delivery Status Tracking
export interface NotificationDelivery {
  id: string
  notificationId: string
  channel: 'inApp' | 'email' | 'sms' | 'push'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  
  // Delivery details
  recipient: string // email, phone, userId
  sentAt?: string
  deliveredAt?: string
  failedAt?: string
  
  // Failure information
  failureReason?: string
  retryCount: number
  nextRetryAt?: string
  
  // Provider information
  provider?: string
  providerId?: string
  
  metadata?: Record<string, any>
}

// Notification Queue
export interface NotificationQueue {
  id: string
  notificationId: string
  channel: 'inApp' | 'email' | 'sms' | 'push'
  priority: 1 | 2 | 3 | 4 | 5 // 1 = highest
  
  scheduledAt: string
  maxRetries: number
  currentRetries: number
  
  payload: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  
  createdAt: string
  updatedAt: string
}