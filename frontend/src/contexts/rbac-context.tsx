"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserRole, SessionPermissions } from '@/types/session'
import { 
  PermissionChecker, 
  createPermissionChecker, 
  createDefaultPermissionChecker,
  Permission,
  PERMISSIONS 
} from '@/lib/rbac'

interface User {
  id: string
  name: string
  email: string
  roles: UserRole[]
  customPermissions?: Permission[]
  department?: string
}

interface RBACContextType {
  // User and permissions
  user: User | null
  permissionChecker: PermissionChecker
  permissions: SessionPermissions
  
  // Authentication state
  isAuthenticated: boolean
  isLoading: boolean
  
  // Permission checking methods
  hasPermission: (permission: Permission) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  canManageSession: (sessionId: string, sessionOwnerId: string) => {
    canView: boolean
    canRevoke: boolean
    canFlag: boolean
    canViewDetails: boolean
  }
  
  // Session management
  login: (user: User) => void
  logout: () => void
  refreshPermissions: () => void
}

const RBACContext = createContext<RBACContextType | undefined>(undefined)

interface RBACProviderProps {
  children: ReactNode
  initialUser?: User
}

export function RBACProvider({ children, initialUser }: RBACProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissionChecker, setPermissionChecker] = useState<PermissionChecker>(
    createDefaultPermissionChecker()
  )
  
  // Convert PermissionChecker results to SessionPermissions format
  const getSessionPermissions = (checker: PermissionChecker): SessionPermissions => {
    return {
      canViewSessions: checker.hasPermission(PERMISSIONS.VIEW_SESSIONS),
      canViewSessionDetails: checker.hasPermission(PERMISSIONS.VIEW_SESSION_DETAILS),
      canRevokeSessions: checker.hasPermission(PERMISSIONS.REVOKE_SESSIONS),
      canFlagSessions: checker.hasPermission(PERMISSIONS.FLAG_SESSIONS),
      canBulkRevokeSessions: checker.hasPermission(PERMISSIONS.BULK_REVOKE_SESSIONS),
      canQuarantineIPs: checker.hasPermission(PERMISSIONS.QUARANTINE_IPS),
      canBlockIPs: checker.hasPermission(PERMISSIONS.BLOCK_IPS),
      canViewAnalytics: checker.hasPermission(PERMISSIONS.VIEW_ANALYTICS),
      canViewAuditLogs: checker.hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS),
      canExportData: checker.hasPermission(PERMISSIONS.EXPORT_DATA),
      canManageUsers: checker.hasPermission(PERMISSIONS.MANAGE_USERS),
      canConfigureSettings: checker.hasPermission(PERMISSIONS.CONFIGURE_SETTINGS),
      canReceiveRealtimeUpdates: checker.hasPermission(PERMISSIONS.RECEIVE_REALTIME_UPDATES),
      canConfigureAlerts: checker.hasPermission(PERMISSIONS.CONFIGURE_ALERTS),
      canModifyRiskScores: checker.hasPermission(PERMISSIONS.MODIFY_RISK_SCORES),
      canViewAnomalies: checker.hasPermission(PERMISSIONS.VIEW_ANOMALIES)
    }
  }

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // In a real app, you would check for existing session/token
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          updatePermissionChecker(parsedUser)
        } else {
          // For demo purposes, set a default user
          const defaultUser: User = {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@company.com',
            roles: ['security_admin'],
            department: 'Security'
          }
          setUser(defaultUser)
          updatePermissionChecker(defaultUser)
          localStorage.setItem('user', JSON.stringify(defaultUser))
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error)
        setUser(null)
        setPermissionChecker(createDefaultPermissionChecker())
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const updatePermissionChecker = (user: User | null) => {
    if (user) {
      const checker = createPermissionChecker(
        user.roles,
        user.id,
        user.customPermissions
      )
      setPermissionChecker(checker)
    } else {
      setPermissionChecker(createDefaultPermissionChecker())
    }
  }

  const login = (newUser: User) => {
    setUser(newUser)
    updatePermissionChecker(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setPermissionChecker(createDefaultPermissionChecker())
    localStorage.removeItem('user')
  }

  const refreshPermissions = () => {
    if (user) {
      updatePermissionChecker(user)
    }
  }

  const hasPermission = (permission: Permission): boolean => {
    return permissionChecker.hasPermission(permission)
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissionChecker.hasAllPermissions(permissions)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissionChecker.hasAnyPermission(permissions)
  }

  const canManageSession = (sessionId: string, sessionOwnerId: string) => {
    return permissionChecker.canManageSession(sessionId, sessionOwnerId)
  }

  const contextValue: RBACContextType = {
    user,
    permissionChecker,
    permissions: getSessionPermissions(permissionChecker),
    isAuthenticated: !!user,
    isLoading,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canManageSession,
    login,
    logout,
    refreshPermissions
  }

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  )
}

// Hook to use RBAC context
export function useRBAC(): RBACContextType {
  const context = useContext(RBACContext)
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider')
  }
  return context
}

// Higher-order component for permission-based rendering
interface WithPermissionProps {
  permission: Permission | Permission[]
  fallback?: ReactNode
  requireAll?: boolean
  children: ReactNode
}

export function WithPermission({ 
  permission, 
  fallback = null, 
  requireAll = false,
  children 
}: WithPermissionProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useRBAC()

  const hasRequiredPermission = Array.isArray(permission)
    ? requireAll 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission)

  if (!hasRequiredPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Component for role-based rendering
interface WithRoleProps {
  roles: UserRole | UserRole[]
  fallback?: ReactNode
  children: ReactNode
}

export function WithRole({ roles, fallback = null, children }: WithRoleProps) {
  const { user } = useRBAC()
  
  if (!user) {
    return <>{fallback}</>
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role))

  if (!hasRequiredRole) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Hook for permission-based effects
export function usePermissions() {
  const { permissions, hasPermission, hasAllPermissions, hasAnyPermission } = useRBAC()
  
  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canView: permissions.canViewSessions,
    canManage: permissions.canRevokeSessions || permissions.canFlagSessions,
    canAnalyze: permissions.canViewAnalytics,
    canAdminister: permissions.canManageUsers || permissions.canConfigureSettings,
    canExport: permissions.canExportData,
    canBulkAction: permissions.canBulkRevokeSessions || permissions.canBlockIPs,
    canConfigureAlerts: permissions.canConfigureAlerts,
    canViewSensitiveData: hasPermission(PERMISSIONS.VIEW_SENSITIVE_DATA),
    canModifyRiskScores: permissions.canModifyRiskScores
  }
}

// Hook for user info
export function useCurrentUser() {
  const { user, isAuthenticated, isLoading } = useRBAC()
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.roles.some(role => 
      ['super_admin', 'security_admin', 'system_admin'].includes(role)
    ) ?? false,
    isSecurity: user?.roles.some(role => 
      ['super_admin', 'security_admin', 'security_analyst'].includes(role)
    ) ?? false,
    canAccessAdmin: user?.roles.some(role => 
      role !== 'user' && role !== 'manager'
    ) ?? false
  }
}

// Permission guard for routes/components
interface PermissionGuardProps {
  permissions: Permission | Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({ 
  permissions, 
  requireAll = false,
  fallback = (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-lg font-semibold text-muted-foreground">Access Denied</div>
        <div className="text-sm text-muted-foreground mt-1">
          You don't have permission to view this content.
        </div>
      </div>
    </div>
  ),
  children 
}: PermissionGuardProps) {
  return (
    <WithPermission 
      permission={permissions} 
      requireAll={requireAll}
      fallback={fallback}
    >
      {children}
    </WithPermission>
  )
}