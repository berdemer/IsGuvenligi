// Access Policy Management Types and Interfaces

// Basic Types
export type PolicyType = 'allow' | 'deny' | 'conditional'
export type PolicyStatus = 'draft' | 'active' | 'disabled' | 'expired'
export type PolicyScope = 'global' | 'role' | 'group' | 'user' | 'resource'
export type AccessLevel = 'read' | 'write' | 'execute' | 'admin' | 'full'
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical'

// Time-based conditions
export interface TimeCondition {
  enabled: boolean
  allowedHours?: {
    start: string // "09:00"
    end: string   // "17:00"
  }
  allowedDays?: number[] // [1,2,3,4,5] for Mon-Fri
  timezone?: string
  exceptions?: {
    dates: string[] // ["2024-12-25", "2024-01-01"]
    description: string
  }[]
}

// Location-based conditions  
export interface GeoCondition {
  enabled: boolean
  allowedCountries?: string[]
  deniedCountries?: string[]
  allowedRegions?: string[]
  deniedRegions?: string[]
  allowedCities?: string[]
  deniedCities?: string[]
  coordinateRadius?: {
    latitude: number
    longitude: number
    radiusKm: number
  }
}

// IP-based conditions
export interface IPCondition {
  enabled: boolean
  allowedIPs?: string[] // ["192.168.1.0/24", "10.0.0.1"]
  deniedIPs?: string[]
  allowedASNs?: string[] // ["AS15169"] for Google
  deniedASNs?: string[]
  requireVPN?: boolean
  denyVPN?: boolean
  denyTor?: boolean
  denyProxy?: boolean
}

// Device-based conditions
export interface DeviceCondition {
  enabled: boolean
  allowedDeviceTypes?: ('desktop' | 'mobile' | 'tablet')[]
  requiredDeviceTrust?: 'any' | 'trusted' | 'managed'
  allowedOS?: string[] // ["Windows", "macOS", "iOS"]
  deniedOS?: string[]
  allowedBrowsers?: string[]
  deniedBrowsers?: string[]
  requireMFA?: boolean
  maxConcurrentSessions?: number
}

// Risk-based conditions
export interface RiskCondition {
  enabled: boolean
  maxRiskScore?: number // 0-100
  requireAdditionalMFA?: boolean
  allowedRiskLevels?: ('low' | 'medium' | 'high' | 'critical')[]
  autoBlock?: {
    riskThreshold: number
    duration: number // minutes
  }
}

// Combined conditions
export interface PolicyConditions {
  time?: TimeCondition
  geo?: GeoCondition
  ip?: IPCondition
  device?: DeviceCondition
  risk?: RiskCondition
  custom?: Record<string, any> // For custom attributes
}

// Resource definition
export interface PolicyResource {
  id: string
  name: string
  type: 'application' | 'api' | 'database' | 'file' | 'department' | 'custom'
  path?: string // "/api/users", "/app/admin"
  methods?: string[] // ["GET", "POST"] for APIs
  attributes?: Record<string, any>
}

// Subject definition (who the policy applies to)
export interface PolicySubject {
  type: 'user' | 'role' | 'group' | 'everyone'
  identifiers: string[] // user IDs, role names, group IDs
  attributes?: Record<string, any>
}

// Policy rules
export interface PolicyRule {
  effect: PolicyType
  accessLevels: AccessLevel[]
  conditions?: PolicyConditions
  exceptions?: {
    subjects?: PolicySubject[]
    resources?: PolicyResource[]
    reason?: string
  }[]
}

// Rollout configuration
export interface PolicyRollout {
  enabled: boolean
  percentage: number // 0-100
  targetGroups?: string[] // Specific groups for staged rollout
  startDate?: string
  endDate?: string
  canaryUsers?: string[] // Test users
}

// Main Access Policy
export interface AccessPolicy {
  id: string
  name: string
  description: string
  type: PolicyType
  status: PolicyStatus
  scope: PolicyScope
  
  // Core policy definition
  subjects: PolicySubject[]
  resources: PolicyResource[]
  rules: PolicyRule[]
  
  // Metadata
  priority: number // Higher number = higher priority
  version: number
  rollout: PolicyRollout
  
  // Audit info
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  
  // Statistics
  stats?: {
    affectedUsers: number
    affectedResources: number
    accessAttempts: number
    deniedAttempts: number
    lastEnforced?: string
  }
  
  // Tags for organization
  tags: string[]
  category?: string
}

// Policy Conflict
export interface PolicyConflict {
  id: string
  severity: ConflictSeverity
  type: 'priority' | 'contradiction' | 'overlap' | 'circular'
  conflictingPolicies: {
    policyId: string
    policyName: string
    priority: number
  }[]
  affectedResources: PolicyResource[]
  affectedSubjects: PolicySubject[]
  description: string
  recommendation?: string
  autoResolvable: boolean
  detectedAt: string
}

// Policy Simulation
export interface PolicySimulation {
  id: string
  userId: string
  resourceId: string
  requestedAccess: AccessLevel[]
  
  // Simulation results
  result: {
    granted: boolean
    effectiveAccess: AccessLevel[]
    deniedAccess: AccessLevel[]
    appliedPolicies: {
      policyId: string
      policyName: string
      effect: PolicyType
      priority: number
      matchedConditions: string[]
    }[]
    conflicts?: PolicyConflict[]
    recommendations?: string[]
  }
  
  // Context
  simulationContext: {
    timestamp: string
    userAttributes: Record<string, any>
    resourceAttributes: Record<string, any>
    requestAttributes: Record<string, any>
  }
}

// Policy Analytics
export interface PolicyAnalytics {
  timeRange: {
    from: string
    to: string
  }
  
  // KPIs
  totalPolicies: number
  activePolicies: number
  conflictingPolicies: number
  enforcedResources: number
  
  // Access metrics
  accessAttempts: {
    total: number
    granted: number
    denied: number
    byResource: { resourceId: string, resourceName: string, attempts: number }[]
    byUser: { userId: string, userName: string, attempts: number }[]
    byPolicy: { policyId: string, policyName: string, enforcements: number }[]
  }
  
  // Trend data
  accessTrends: {
    date: string
    granted: number
    denied: number
  }[]
  
  // Distribution data
  policyDistribution: {
    type: PolicyType
    count: number
    percentage: number
  }[]
  
  scopeDistribution: {
    scope: PolicyScope
    count: number
    percentage: number
  }[]
  
  // Risk analysis
  riskAnalysis: {
    highRiskAccess: number
    anomalousAccess: number
    privilegedAccess: number
    suspiciousPatterns: {
      pattern: string
      count: number
      severity: ConflictSeverity
    }[]
  }
  
  // Top resources/users
  topResources: {
    resourceId: string
    resourceName: string
    accessCount: number
    denyCount: number
  }[]
  
  topUsers: {
    userId: string
    userName: string
    accessCount: number
    denyCount: number
  }[]
}

// Policy Filters
export interface PolicyFilters {
  search?: string
  types?: PolicyType[]
  statuses?: PolicyStatus[]
  scopes?: PolicyScope[]
  priorities?: {
    min: number
    max: number
  }
  tags?: string[]
  categories?: string[]
  subjects?: string[]
  resources?: string[]
  createdBy?: string[]
  dateRange?: {
    from: string
    to: string
  }
  hasConflicts?: boolean
  rolloutStatus?: 'not_started' | 'in_progress' | 'completed'
}

// Policy Export
export interface PolicyExport {
  format: 'csv' | 'json' | 'yaml'
  filters?: PolicyFilters
  includeAnalytics?: boolean
  includeAuditLog?: boolean
  dateRange?: {
    from: string
    to: string
  }
}

// Policy Import
export interface PolicyImport {
  format: 'csv' | 'json' | 'yaml'
  file: File
  options: {
    overwriteExisting: boolean
    validateOnly: boolean
    skipInvalid: boolean
  }
  result?: {
    imported: number
    skipped: number
    errors: {
      row: number
      error: string
    }[]
  }
}

// Keycloak Integration
export interface KeycloakIntegration {
  realm: string
  clientId: string
  roles: {
    keycloakRole: string
    mappedRole: string
    description: string
  }[]
  resources: {
    keycloakResource: string
    mappedResource: string
    scopes: string[]
  }[]
  syncStatus: {
    lastSync: string
    status: 'success' | 'error' | 'in_progress'
    errors?: string[]
  }
}

// API Response Types
export interface PolicyListResponse {
  policies: AccessPolicy[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PolicyConflictResponse {
  conflicts: PolicyConflict[]
  total: number
  severity: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

// Audit Log for Policies
export interface PolicyAuditLog {
  id: string
  timestamp: string
  action: 'create' | 'update' | 'delete' | 'enable' | 'disable' | 'simulate' | 'enforce'
  policyId?: string
  policyName?: string
  actorId: string
  actorName: string
  actorType: 'user' | 'system' | 'api'
  
  // Details of the action
  details: {
    changes?: Record<string, { from: any, to: any }>
    simulation?: PolicySimulation
    enforcement?: {
      resourceId: string
      userId: string
      granted: boolean
      reason: string
    }
    metadata?: Record<string, any>
  }
  
  // Context
  context: {
    ipAddress?: string
    userAgent?: string
    requestId?: string
    correlationId?: string
  }
}

// Error Types
export interface PolicyError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
  validation?: {
    field: string
    rule: string
    value: any
  }[]
}