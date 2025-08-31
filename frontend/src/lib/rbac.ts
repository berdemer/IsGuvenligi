"use client"

import { SessionPermissions, UserRole } from '@/types/session'

// Define available permissions for session management
export const PERMISSIONS = {
  // Session viewing permissions
  VIEW_SESSIONS: 'view_sessions',
  VIEW_SESSION_DETAILS: 'view_session_details',
  VIEW_SENSITIVE_DATA: 'view_sensitive_data',
  
  // Session management permissions
  REVOKE_SESSIONS: 'revoke_sessions',
  REVOKE_OWN_SESSIONS: 'revoke_own_sessions',
  BULK_REVOKE_SESSIONS: 'bulk_revoke_sessions',
  FLAG_SESSIONS: 'flag_sessions',
  QUARANTINE_IPS: 'quarantine_ips',
  BLOCK_IPS: 'block_ips',
  
  // Analytics and monitoring
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_ANOMALIES: 'view_anomalies',
  EXPORT_DATA: 'export_data',
  
  // Administrative permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  CONFIGURE_SETTINGS: 'configure_settings',
  MANAGE_INTEGRATIONS: 'manage_integrations',
  
  // Real-time features
  RECEIVE_REALTIME_UPDATES: 'receive_realtime_updates',
  CONFIGURE_ALERTS: 'configure_alerts',
  
  // Risk management
  MODIFY_RISK_SCORES: 'modify_risk_scores',
  CONFIGURE_RISK_RULES: 'configure_risk_rules',
  OVERRIDE_SECURITY_POLICIES: 'override_security_policies'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Define role hierarchies and their permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Super admin has all permissions
  super_admin: Object.values(PERMISSIONS),
  
  // Security admin - full security management
  security_admin: [
    PERMISSIONS.VIEW_SESSIONS,
    PERMISSIONS.VIEW_SESSION_DETAILS,
    PERMISSIONS.VIEW_SENSITIVE_DATA,
    PERMISSIONS.REVOKE_SESSIONS,
    PERMISSIONS.BULK_REVOKE_SESSIONS,
    PERMISSIONS.FLAG_SESSIONS,
    PERMISSIONS.QUARANTINE_IPS,
    PERMISSIONS.BLOCK_IPS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_ANOMALIES,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.RECEIVE_REALTIME_UPDATES,
    PERMISSIONS.CONFIGURE_ALERTS,
    PERMISSIONS.MODIFY_RISK_SCORES,
    PERMISSIONS.CONFIGURE_RISK_RULES,
    PERMISSIONS.CONFIGURE_SETTINGS
  ],
  
  // System admin - system management focused
  system_admin: [
    PERMISSIONS.VIEW_SESSIONS,
    PERMISSIONS.VIEW_SESSION_DETAILS,
    PERMISSIONS.REVOKE_SESSIONS,
    PERMISSIONS.FLAG_SESSIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.CONFIGURE_SETTINGS,
    PERMISSIONS.MANAGE_INTEGRATIONS,
    PERMISSIONS.RECEIVE_REALTIME_UPDATES
  ],
  
  // Security analyst - monitoring and analysis
  security_analyst: [
    PERMISSIONS.VIEW_SESSIONS,
    PERMISSIONS.VIEW_SESSION_DETAILS,
    PERMISSIONS.VIEW_SENSITIVE_DATA,
    PERMISSIONS.FLAG_SESSIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_ANOMALIES,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.RECEIVE_REALTIME_UPDATES,
    PERMISSIONS.CONFIGURE_ALERTS
  ],
  
  // IT admin - technical operations
  it_admin: [
    PERMISSIONS.VIEW_SESSIONS,
    PERMISSIONS.VIEW_SESSION_DETAILS,
    PERMISSIONS.REVOKE_SESSIONS,
    PERMISSIONS.BULK_REVOKE_SESSIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.RECEIVE_REALTIME_UPDATES,
    PERMISSIONS.CONFIGURE_SETTINGS
  ],
  
  // HR admin - user-focused management
  hr_admin: [
    PERMISSIONS.VIEW_SESSIONS,
    PERMISSIONS.VIEW_SESSION_DETAILS,
    PERMISSIONS.REVOKE_SESSIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  // Auditor - read-only access for compliance
  auditor: [
    PERMISSIONS.VIEW_SESSIONS,
    PERMISSIONS.VIEW_SESSION_DETAILS,
    PERMISSIONS.VIEW_SENSITIVE_DATA,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_ANOMALIES,
    PERMISSIONS.EXPORT_DATA
  ],
  
  // Manager - departmental oversight
  manager: [
    PERMISSIONS.VIEW_SESSIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  // User - basic self-service
  user: [
    PERMISSIONS.REVOKE_OWN_SESSIONS
  ]
}

// Resource-based permissions for fine-grained access control
export interface ResourcePermission {
  resourceType: 'session' | 'user' | 'audit_log' | 'analytics' | 'settings'
  resourceId?: string
  action: Permission
  conditions?: {
    ownerId?: string
    department?: string
    riskLevel?: 'low' | 'medium' | 'high'
    timeConstraint?: {
      start: string
      end: string
    }
  }
}

// Permission checker class
export class PermissionChecker {
  private userRoles: UserRole[]
  private userId: string
  private customPermissions: Permission[]

  constructor(userRoles: UserRole[], userId: string, customPermissions: Permission[] = []) {
    this.userRoles = userRoles
    this.userId = userId
    this.customPermissions = customPermissions
  }

  // Check if user has a specific permission
  hasPermission(permission: Permission): boolean {
    // Check role-based permissions
    const rolePermissions = this.userRoles.flatMap(role => ROLE_PERMISSIONS[role] || [])
    const hasRolePermission = rolePermissions.includes(permission)
    
    // Check custom permissions
    const hasCustomPermission = this.customPermissions.includes(permission)
    
    return hasRolePermission || hasCustomPermission
  }

  // Check multiple permissions (AND logic)
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  // Check multiple permissions (OR logic)
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  // Check resource-specific permission with conditions
  hasResourcePermission(resourcePermission: ResourcePermission, context?: {
    ownerId?: string
    department?: string
    currentTime?: Date
  }): boolean {
    // First check if user has the base permission
    if (!this.hasPermission(resourcePermission.action)) {
      return false
    }

    // Check conditions if specified
    if (resourcePermission.conditions && context) {
      const { conditions } = resourcePermission
      
      // Owner check
      if (conditions.ownerId && context.ownerId && 
          conditions.ownerId !== context.ownerId && 
          conditions.ownerId !== this.userId) {
        return false
      }
      
      // Department check
      if (conditions.department && context.department && 
          conditions.department !== context.department) {
        return false
      }
      
      // Time constraint check
      if (conditions.timeConstraint && context.currentTime) {
        const startTime = new Date(`1970-01-01T${conditions.timeConstraint.start}`)
        const endTime = new Date(`1970-01-01T${conditions.timeConstraint.end}`)
        const currentTime = new Date(`1970-01-01T${context.currentTime.toTimeString().slice(0, 8)}`)
        
        if (currentTime < startTime || currentTime > endTime) {
          return false
        }
      }
    }

    return true
  }

  // Get all permissions for the user
  getAllPermissions(): Permission[] {
    const rolePermissions = this.userRoles.flatMap(role => ROLE_PERMISSIONS[role] || [])
    const allPermissions = [...new Set([...rolePermissions, ...this.customPermissions])]
    return allPermissions
  }

  // Check if user can perform bulk operations
  canPerformBulkOperations(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.BULK_REVOKE_SESSIONS,
      PERMISSIONS.QUARANTINE_IPS,
      PERMISSIONS.BLOCK_IPS
    ])
  }

  // Check if user can access sensitive data
  canAccessSensitiveData(): boolean {
    return this.hasPermission(PERMISSIONS.VIEW_SENSITIVE_DATA)
  }

  // Check if user can modify security settings
  canModifySecuritySettings(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.CONFIGURE_SETTINGS,
      PERMISSIONS.CONFIGURE_RISK_RULES,
      PERMISSIONS.OVERRIDE_SECURITY_POLICIES
    ])
  }

  // Check session-specific permissions
  canManageSession(sessionId: string, sessionOwnerId: string): {
    canView: boolean
    canRevoke: boolean
    canFlag: boolean
    canViewDetails: boolean
  } {
    const isOwnSession = sessionOwnerId === this.userId
    
    return {
      canView: this.hasPermission(PERMISSIONS.VIEW_SESSIONS),
      canRevoke: isOwnSession 
        ? this.hasPermission(PERMISSIONS.REVOKE_OWN_SESSIONS) 
        : this.hasPermission(PERMISSIONS.REVOKE_SESSIONS),
      canFlag: this.hasPermission(PERMISSIONS.FLAG_SESSIONS),
      canViewDetails: this.hasPermission(PERMISSIONS.VIEW_SESSION_DETAILS)
    }
  }
}

// Permission context for React components
export interface PermissionContext {
  checker: PermissionChecker
  user: {
    id: string
    roles: UserRole[]
    customPermissions?: Permission[]
  }
}

// Helper functions for common permission checks
export const canViewSessions = (permissions: SessionPermissions): boolean => {
  return permissions.canViewSessions
}

export const canManageSessions = (permissions: SessionPermissions): boolean => {
  return permissions.canRevokeSessions || permissions.canFlagSessions
}

export const canAccessAnalytics = (permissions: SessionPermissions): boolean => {
  return permissions.canViewAnalytics
}

export const canPerformAdminActions = (permissions: SessionPermissions): boolean => {
  return permissions.canManageUsers || permissions.canConfigureSettings
}

// Role hierarchy checker
export const isHigherRole = (role1: UserRole, role2: UserRole): boolean => {
  const hierarchy: Record<UserRole, number> = {
    super_admin: 8,
    security_admin: 7,
    system_admin: 6,
    security_analyst: 5,
    it_admin: 4,
    hr_admin: 3,
    auditor: 2,
    manager: 1,
    user: 0
  }
  
  return hierarchy[role1] > hierarchy[role2]
}

// Default permission checker for unauthenticated users
export const createDefaultPermissionChecker = (): PermissionChecker => {
  return new PermissionChecker(['user'], 'anonymous', [])
}

// Create permission checker from session data
export const createPermissionChecker = (
  userRoles: UserRole[], 
  userId: string, 
  customPermissions?: Permission[]
): PermissionChecker => {
  return new PermissionChecker(userRoles, userId, customPermissions)
}