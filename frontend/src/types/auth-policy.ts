// Auth Policy Types and Interfaces

export type PolicyType = 'password' | 'mfa' | 'session' | 'provider' | 'recovery'

export type PolicyStatus = 'draft' | 'active' | 'inactive' | 'archived'

export type ScopeType = 'global' | 'role' | 'group' | 'user'

export type ConditionType = 'ip' | 'geo' | 'device' | 'time' | 'risk'

export type RolloutPhase = 'testing' | 'partial' | 'full'

// Scope Configuration
export interface PolicyScope {
  type: ScopeType
  targets: string[]  // role IDs, group IDs, or user IDs
  exclusions?: string[]
  includeSubGroups?: boolean
}

// Condition Configuration
export interface IpCondition {
  type: 'ip'
  allowedRanges: string[]
  blockedRanges: string[]
  requireVPN?: boolean
}

export interface GeoCondition {
  type: 'geo'
  allowedCountries: string[]
  blockedCountries: string[]
  allowedCities?: string[]
  blockedCities?: string[]
  requireTrustedLocation?: boolean
}

export interface DeviceCondition {
  type: 'device'
  allowedPlatforms: ('windows' | 'macos' | 'linux' | 'ios' | 'android')[]
  blockedPlatforms: ('windows' | 'macos' | 'linux' | 'ios' | 'android')[]
  requireManagedDevice?: boolean
  requireEncryption?: boolean
}

export interface TimeCondition {
  type: 'time'
  allowedHours: {
    start: string  // HH:MM
    end: string    // HH:MM
    timezone: string
  }[]
  allowedDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
  blockWeekends?: boolean
}

export interface RiskCondition {
  type: 'risk'
  maxRiskLevel: 'low' | 'medium' | 'high'
  requireAdditionalAuth?: boolean
  blockHighRisk?: boolean
}

export type PolicyCondition = IpCondition | GeoCondition | DeviceCondition | TimeCondition | RiskCondition

// Password Policy Rules
export interface PasswordRules {
  minLength: number
  maxLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  prohibitCommonPasswords: boolean
  prohibitPersonalInfo: boolean
  maxAge: number  // days
  historyCount: number  // prevent reuse of last N passwords
  lockoutThreshold: number
  lockoutDuration: number  // minutes
}

// MFA Policy Rules
export interface MfaRules {
  required: boolean
  methods: ('totp' | 'sms' | 'email' | 'webauthn' | 'push')[]
  gracePeriod: number  // days before enforcement
  backupCodes: boolean
  trustedDevices: boolean
  trustedDeviceDuration: number  // days
}

// Session Policy Rules
export interface SessionRules {
  maxDuration: number  // minutes
  idleTimeout: number  // minutes
  maxConcurrentSessions: number
  requireReauth: boolean
  reauthInterval: number  // minutes
  terminateOnPasswordChange: boolean
  terminateOnMfaChange: boolean
}

// Provider Policy Rules  
export interface ProviderRules {
  allowedProviders: ('google' | 'microsoft' | 'github' | 'facebook')[]
  blockedProviders: ('google' | 'microsoft' | 'github' | 'facebook')[]
  requireEmailVerification: boolean
  requireDomainMatch: boolean
  allowedDomains: string[]
  blockedDomains: string[]
}

// Recovery Policy Rules
export interface RecoveryRules {
  allowPasswordReset: boolean
  resetMethods: ('email' | 'sms' | 'security_questions' | 'admin_override')[]
  resetTokenExpiry: number  // minutes
  maxResetAttempts: number
  resetCooldown: number  // minutes
  requireMfaForReset: boolean
  allowSelfUnlock: boolean
}

export type PolicyRules = PasswordRules | MfaRules | SessionRules | ProviderRules | RecoveryRules

// Rollout Configuration
export interface PolicyRollout {
  phase: RolloutPhase
  percentage: number  // 0-100
  startDate: string
  endDate?: string
  targetGroups?: string[]
  monitoringEnabled: boolean
  rollbackThreshold?: number  // error rate percentage
  autoRollback: boolean
}

// Version and History
export interface PolicyVersion {
  version: string
  createdAt: string
  createdBy: string
  changes: string[]
  rollbackSupported: boolean
}

// Conflict Detection
export interface PolicyConflict {
  conflictId: string
  type: 'overlap' | 'contradiction' | 'dependency'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedPolicies: string[]
  resolution?: string
  autoResolvable: boolean
}

// Simulation Result
export interface SimulationResult {
  simulationId: string
  timestamp: string
  testCases: {
    scenario: string
    user: string
    conditions: Record<string, any>
    expectedResult: 'allow' | 'deny' | 'challenge'
    actualResult: 'allow' | 'deny' | 'challenge'
    passed: boolean
    details: string
  }[]
  overallResult: 'pass' | 'fail' | 'warning'
  coverage: number  // percentage
  recommendations: string[]
}

// Audit Log Entry
export interface PolicyAuditLog {
  id: string
  policyId: string
  action: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted' | 'simulated' | 'rolled_back'
  timestamp: string
  userId: string
  userEmail: string
  changes?: Record<string, { old: any, new: any }>
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
}

// Main Policy Interface
export interface AuthPolicy {
  id: string
  name: string
  description: string
  type: PolicyType
  status: PolicyStatus
  
  // Core Configuration
  scope: PolicyScope
  conditions: PolicyCondition[]
  rules: PolicyRules
  
  // Management
  priority: number  // 1-100, higher = more priority
  rollout: PolicyRollout
  
  // Metadata
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  version: string
  
  // Version Control
  versions: PolicyVersion[]
  
  // Conflict Management
  conflicts: PolicyConflict[]
  
  // Keycloak Integration
  keycloakPolicyId?: string
  keycloakSyncStatus: 'pending' | 'synced' | 'error'
  keycloakLastSync?: string
  
  // Redis Cache
  cacheKey: string
  cacheTTL: number
  
  // Statistics
  stats: {
    appliedCount: number
    deniedCount: number
    challengedCount: number
    errorCount: number
    lastApplied?: string
  }
}

// API Interfaces
export interface PolicyListResponse {
  policies: AuthPolicy[]
  total: number
  page: number
  pageSize: number
  filters: PolicyFilters
}

export interface PolicyFilters {
  search?: string
  type?: PolicyType[]
  status?: PolicyStatus[]
  scope?: ScopeType[]
  createdBy?: string
  dateRange?: {
    start: string
    end: string
  }
  hasConflicts?: boolean
  rolloutPhase?: RolloutPhase[]
}

export interface PolicyFormData extends Omit<AuthPolicy, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'version' | 'versions' | 'conflicts' | 'stats'> {
  // Form-specific fields
  saveAsDraft?: boolean
  simulateBeforeSave?: boolean
  notifyUsers?: boolean
}

// Keycloak Integration Types
export interface KeycloakPolicy {
  id: string
  name: string
  type: string
  config: Record<string, any>
  description?: string
  decisionStrategy: 'UNANIMOUS' | 'AFFIRMATIVE' | 'CONSENSUS'
  logic: 'POSITIVE' | 'NEGATIVE'
}

export interface KeycloakSyncResult {
  success: boolean
  syncedPolicies: number
  errors: {
    policyId: string
    error: string
  }[]
  warnings: string[]
}

// Redis Cache Types
export interface CachePolicy {
  key: string
  policy: AuthPolicy
  ttl: number
  lastUpdated: string
}

export interface CacheStats {
  totalPolicies: number
  hitRate: number
  missRate: number
  evictions: number
  memory: {
    used: number
    max: number
  }
}

// RBAC Types for Policy Management
export interface PolicyPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canActivate: boolean
  canSimulate: boolean
  canViewAudit: boolean
  canManageRollout: boolean
  scopeRestrictions: ScopeType[]  // which scopes user can manage
}

// Bulk Operations
export interface BulkPolicyOperation {
  operation: 'activate' | 'deactivate' | 'delete' | 'duplicate' | 'export'
  policyIds: string[]
  options?: Record<string, any>
}

export interface BulkOperationResult {
  success: boolean
  processed: number
  failed: number
  errors: {
    policyId: string
    error: string
  }[]
}

// Export/Import Types
export interface PolicyExport {
  version: string
  exportDate: string
  exportedBy: string
  policies: AuthPolicy[]
  metadata: Record<string, any>
}

export interface PolicyImport {
  validateOnly?: boolean
  overwriteExisting?: boolean
  skipConflicts?: boolean
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  conflicts: PolicyConflict[]
  errors: string[]
}