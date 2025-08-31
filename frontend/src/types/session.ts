// Session Management Types and Interfaces

export type SessionStatus = 'active' | 'expired' | 'revoked' | 'suspended'
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type MfaStatus = 'passed' | 'required' | 'bypassed' | 'failed'

// User Information
export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  roles: string[]
  department?: string
  avatar?: string
}

// Device Information
export interface DeviceInfo {
  type: DeviceType
  os: string
  browser: string
  version: string
  fingerprint: string
  isTrusted: boolean
  isNewDevice: boolean
  lastSeenAt?: string
}

// Geolocation Information
export interface LocationInfo {
  ip: string
  city: string
  country: string
  countryCode: string
  region: string
  timezone: string
  asn: string
  isp: string
  isVpn: boolean
  isTor: boolean
  isProxy: boolean
  latitude?: number
  longitude?: number
}

// MFA Information
export interface MfaInfo {
  status: MfaStatus
  methods: string[]
  lastMfaAt?: string
  mfaRequired: boolean
  trustDevice: boolean
  gracePeriodEnd?: string
}

// Token Information
export interface TokenInfo {
  accessToken: {
    expiresAt: string
    remainingTTL: number
  }
  refreshToken: {
    expiresAt: string
    remainingTTL: number
  }
  sessionToken?: {
    expiresAt: string
    remainingTTL: number
  }
  rememberMe: boolean
}

// Risk Scoring
export interface RiskFactors {
  geoVelocity: number // +20 for sudden location changes
  newDevice: number // +15 for new device/fingerprint
  missingMfa: number // +25 for missing MFA
  concurrentSessions: number // +10 for multiple sessions
  unusualHours: number // +5 for access outside normal hours
  suspiciousActivity: number // Additional suspicious patterns
}

export interface RiskScore {
  total: number
  level: RiskLevel
  factors: RiskFactors
  lastCalculated: string
  details: string[]
}

// Session Activity
export interface SessionActivity {
  id: string
  timestamp: string
  type: 'login' | 'refresh' | 'api_call' | 'logout' | 'mfa_challenge' | 'resource_access'
  resource?: string
  ip: string
  userAgent: string
  success: boolean
  details?: Record<string, any>
}

// Session Anomaly
export interface SessionAnomaly {
  id: string
  type: 'geo_velocity' | 'device_change' | 'concurrent_login' | 'suspicious_activity' | 'token_abuse'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedAt: string
  resolved: boolean
  falsePositive: boolean
}

// Main Session Interface
export interface ActiveSession {
  id: string
  sessionId: string // Keycloak session ID
  userId: string
  clientId: string
  
  // User & Authentication
  user: SessionUser
  mfa: MfaInfo
  
  // Device & Location
  device: DeviceInfo
  location: LocationInfo
  
  // Timing
  loginAt: string
  lastActivity: string
  idleTime: number // seconds since last activity
  
  // Security
  riskScore: RiskScore
  anomalies: SessionAnomaly[]
  
  // Tokens
  tokens: TokenInfo
  
  // Session State
  status: SessionStatus
  concurrentSessions: number // Other sessions for same user
  
  // Keycloak Integration
  keycloakData: {
    realm: string
    clientSessionId: string
    scope: string[]
    state: string
    protocolMappers?: Record<string, any>
  }
  
  // Metadata
  createdAt: string
  updatedAt: string
  flags: string[] // ['high_risk', 'new_location', 'admin_flagged', etc.]
}

// Session Filters
export interface SessionFilters {
  search?: string // email, username, IP, device fingerprint
  users?: string[]
  roles?: string[]
  locations?: string[]
  asn?: string[]
  deviceTypes?: DeviceType[]
  mfaStatus?: MfaStatus[]
  riskLevels?: RiskLevel[]
  clients?: string[]
  hasAnomalies?: boolean
  isActive?: boolean
  dateRange?: {
    from: string
    to: string
  }
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Session Actions
export type SessionAction = 'revoke' | 'revoke_block_ip' | 'require_mfa' | 'quarantine_ip' | 'flag_compromised' | 'require_reauth'

export interface SessionActionRequest {
  action: SessionAction
  sessionIds: string[]
  reason?: string
  metadata?: Record<string, any>
}

// Bulk Actions
export interface BulkActionRequest {
  action: SessionAction
  sessionIds: string[]
  options?: {
    blockDuration?: number // minutes for IP blocks
    reason?: string
    notifyUser?: boolean
  }
}

export interface BulkActionResult {
  success: boolean
  processed: number
  failed: number
  errors: {
    sessionId: string
    error: string
  }[]
}

// Analytics
export interface SessionAnalytics {
  timeRange: {
    from: string
    to: string
  }
  
  // KPIs
  activeSessions: number
  uniqueUsers: number
  highRiskSessions: number
  revokedToday: number
  
  // Time Series
  sessionTimeSeries: {
    timestamp: string
    active: number
    created: number
    revoked: number
  }[]
  
  // Geographic Distribution
  geoDistribution: {
    country: string
    countryCode: string
    count: number
    percentage: number
  }[]
  
  // Device Distribution
  deviceDistribution: {
    type: DeviceType
    count: number
    percentage: number
  }[]
  
  osDistribution: {
    os: string
    version: string
    count: number
    percentage: number
  }[]
  
  browserDistribution: {
    browser: string
    version: string
    count: number
    percentage: number
  }[]
  
  // Risk Analysis
  riskDistribution: {
    level: RiskLevel
    count: number
    percentage: number
  }[]
  
  // Anomalies
  anomalies: {
    type: string
    count: number
    trend: 'up' | 'down' | 'stable'
  }[]
  
  // Top Lists
  topCountries: { country: string; count: number }[]
  topASNs: { asn: string; isp: string; count: number }[]
  topRiskyUsers: { user: SessionUser; riskScore: number; sessionCount: number }[]
}

// Real-time Updates
export interface SessionEvent {
  type: 'session_created' | 'session_updated' | 'session_revoked' | 'session_expired' | 'anomaly_detected'
  sessionId: string
  userId?: string
  timestamp: string
  data: Partial<ActiveSession>
  metadata?: Record<string, any>
}

// IP Quarantine
export interface IpQuarantine {
  ip: string
  reason: string
  quarantinedAt: string
  expiresAt: string
  quarantinedBy: string
  active: boolean
}

// Session Audit
export interface SessionAuditLog {
  id: string
  sessionId: string
  userId: string
  action: SessionAction
  performedBy: string
  performedAt: string
  reason?: string
  ipAddress: string
  userAgent: string
  success: boolean
  metadata: Record<string, any>
}

// API Response Types
export interface SessionListResponse {
  sessions: ActiveSession[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  filters: SessionFilters
  lastUpdated: string
  etag: string
}

export interface SessionDetailsResponse extends ActiveSession {
  activities: SessionActivity[]
  auditLog: SessionAuditLog[]
  relatedSessions: ActiveSession[] // Other sessions from same user
}

// Real-time Connection
export interface RealtimeConnectionStatus {
  connected: boolean
  lastHeartbeat?: string
  reconnectAttempts: number
  maxReconnectAttempts: number
}

// Session Export
export interface SessionExportRequest {
  format: 'csv' | 'json' | 'xlsx'
  filters: SessionFilters
  fields?: string[]
  includeActivities?: boolean
  includeAnomalies?: boolean
}

// Keycloak Integration Types
export interface KeycloakSession {
  id: string
  username: string
  userId: string
  ipAddress: string
  start: number
  lastAccess: number
  clients: Record<string, string>
}

export interface KeycloakUserSession {
  id: string
  username: string
  userId: string
  loginUsername: string
  ipAddress: string
  start: number
  lastAccess: number
  clients: Record<string, {
    clientId: string
    redirectUri: string
    state: string
  }>
}

// Redis Cache Types
export interface CachedSession {
  key: string
  session: ActiveSession
  ttl: number
  lastUpdated: string
}

export interface SessionCacheStats {
  totalSessions: number
  hitRate: number
  missRate: number
  evictions: number
  memory: {
    used: number
    max: number
  }
}

// RBAC for Sessions
export interface SessionPermissions {
  canView: boolean
  canViewAll: boolean // Can view all users' sessions
  canRevoke: boolean
  canRevokeAll: boolean // Can revoke any user's sessions
  canQuarantineIp: boolean
  canViewAudit: boolean
  canExport: boolean
  canViewAnalytics: boolean
  scopeRestrictions: {
    users?: string[] // Can only manage these users
    roles?: string[] // Can only manage users with these roles
    departments?: string[] // Can only manage users from these departments
  }
}

// Configuration
export interface SessionMonitoringConfig {
  refreshInterval: number // seconds
  riskThresholds: {
    low: number
    medium: number
    high: number
  }
  autoRevokeThreshold: number
  geoVelocityThreshold: number // km/h
  maxConcurrentSessions: number
  tokenWarningThreshold: number // minutes before expiry
  anomalyDetection: {
    enabled: boolean
    sensitivityLevel: 'low' | 'medium' | 'high'
    autoQuarantine: boolean
  }
}