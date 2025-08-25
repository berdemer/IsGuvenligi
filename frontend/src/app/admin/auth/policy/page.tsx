"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PolicyList } from "@/components/admin/auth/policy/PolicyList"
import { PolicyForm } from "@/components/admin/auth/policy/PolicyForm"
import { PolicySimulation } from "@/components/admin/auth/policy/PolicySimulation"
import { PolicyAudit } from "@/components/admin/auth/policy/PolicyAudit"
import { PolicyConflicts } from "@/components/admin/auth/policy/PolicyConflicts"
import { PolicyStats } from "@/components/admin/auth/policy/PolicyStats"
import { Shield, Plus, AlertTriangle, Activity, TestTube, History, TrendingUp } from "lucide-react"
import { AuthPolicy, PolicyFilters, PolicyPermissions } from "@/types/auth-policy"
import toast from "react-hot-toast"

// Mock permissions - in real app, this would come from RBAC
const mockPermissions: PolicyPermissions = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canActivate: true,
  canSimulate: true,
  canViewAudit: true,
  canManageRollout: true,
  scopeRestrictions: []
}

export default function AuthPolicyPage() {
  const [activeTab, setActiveTab] = useState("policies")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<AuthPolicy | null>(null)
  const [policies, setPolicies] = useState<AuthPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [conflictCount, setConflictCount] = useState(0)
  const [permissions] = useState<PolicyPermissions>(mockPermissions)

  useEffect(() => {
    loadPolicies()
    loadConflictCount()
  }, [])

  const loadPolicies = async () => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockPolicies: AuthPolicy[] = [
        {
          id: "pol_1",
          name: "Strong Password Policy",
          description: "Enforces strong password requirements for all users",
          type: "password",
          status: "active",
          scope: {
            type: "global",
            targets: ["all"]
          },
          conditions: [],
          rules: {
            minLength: 12,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            prohibitCommonPasswords: true,
            prohibitPersonalInfo: true,
            maxAge: 90,
            historyCount: 12,
            lockoutThreshold: 5,
            lockoutDuration: 30
          },
          priority: 90,
          rollout: {
            phase: "full",
            percentage: 100,
            startDate: "2024-01-01T00:00:00Z",
            monitoringEnabled: true,
            autoRollback: false
          },
          createdAt: "2024-01-01T00:00:00Z",
          createdBy: "admin@company.com",
          updatedAt: "2024-01-10T00:00:00Z",
          updatedBy: "admin@company.com",
          version: "1.2",
          versions: [],
          conflicts: [],
          keycloakSyncStatus: "synced",
          keycloakLastSync: "2024-01-10T00:00:00Z",
          cacheKey: "policy:pol_1",
          cacheTTL: 3600,
          stats: {
            appliedCount: 1250,
            deniedCount: 45,
            challengedCount: 0,
            errorCount: 2,
            lastApplied: "2024-01-15T10:30:00Z"
          }
        },
        {
          id: "pol_2",
          name: "Executive MFA Requirement",
          description: "Mandatory MFA for executive roles and sensitive operations",
          type: "mfa",
          status: "active",
          scope: {
            type: "role",
            targets: ["executive", "admin", "security"]
          },
          conditions: [],
          rules: {
            required: true,
            methods: ["totp", "webauthn"],
            gracePeriod: 7,
            backupCodes: true,
            trustedDevices: false,
            trustedDeviceDuration: 0
          },
          priority: 95,
          rollout: {
            phase: "full",
            percentage: 100,
            startDate: "2024-01-05T00:00:00Z",
            monitoringEnabled: true,
            autoRollback: false
          },
          createdAt: "2024-01-05T00:00:00Z",
          createdBy: "security@company.com",
          updatedAt: "2024-01-05T00:00:00Z",
          updatedBy: "security@company.com",
          version: "1.0",
          versions: [],
          conflicts: [],
          keycloakSyncStatus: "synced",
          cacheKey: "policy:pol_2",
          cacheTTL: 3600,
          stats: {
            appliedCount: 45,
            deniedCount: 3,
            challengedCount: 42,
            errorCount: 0,
            lastApplied: "2024-01-15T09:15:00Z"
          }
        },
        {
          id: "pol_3",
          name: "Remote Work Session Policy",
          description: "Session management for remote workers with IP restrictions",
          type: "session",
          status: "active",
          scope: {
            type: "group",
            targets: ["remote_workers"]
          },
          conditions: [
            {
              type: "ip",
              allowedRanges: ["10.0.0.0/8", "192.168.0.0/16"],
              blockedRanges: [],
              requireVPN: true
            }
          ],
          rules: {
            maxDuration: 480,
            idleTimeout: 30,
            maxConcurrentSessions: 2,
            requireReauth: true,
            reauthInterval: 240,
            terminateOnPasswordChange: true,
            terminateOnMfaChange: true
          },
          priority: 80,
          rollout: {
            phase: "partial",
            percentage: 75,
            startDate: "2024-01-12T00:00:00Z",
            monitoringEnabled: true,
            autoRollback: true
          },
          createdAt: "2024-01-12T00:00:00Z",
          createdBy: "policy@company.com",
          updatedAt: "2024-01-14T00:00:00Z",
          updatedBy: "policy@company.com",
          version: "1.1",
          versions: [],
          conflicts: [
            {
              conflictId: "conf_1",
              type: "overlap",
              severity: "medium",
              description: "Overlaps with Global Session Policy for concurrent sessions",
              affectedPolicies: ["pol_3", "pol_4"],
              autoResolvable: false
            }
          ],
          keycloakSyncStatus: "pending",
          cacheKey: "policy:pol_3",
          cacheTTL: 3600,
          stats: {
            appliedCount: 320,
            deniedCount: 15,
            challengedCount: 0,
            errorCount: 1,
            lastApplied: "2024-01-15T08:45:00Z"
          }
        }
      ]
      
      setPolicies(mockPolicies)
    } catch (error) {
      toast.error("Failed to load policies")
    } finally {
      setLoading(false)
    }
  }

  const loadConflictCount = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setConflictCount(2)
    } catch (error) {
      console.error("Failed to load conflict count:", error)
    }
  }

  const handleCreatePolicy = () => {
    if (!permissions.canCreate) {
      toast.error("You don't have permission to create policies")
      return
    }
    setEditingPolicy(null)
    setShowCreateForm(true)
  }

  const handleEditPolicy = (policy: AuthPolicy) => {
    if (!permissions.canEdit) {
      toast.error("You don't have permission to edit policies")
      return
    }
    setEditingPolicy(policy)
    setShowCreateForm(true)
  }

  const handlePolicySubmit = async (policyData: any) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingPolicy) {
        // Update existing policy
        setPolicies(prev => 
          prev.map(p => p.id === editingPolicy.id 
            ? { ...editingPolicy, ...policyData, updatedAt: new Date().toISOString() }
            : p
          )
        )
        toast.success("Policy updated successfully")
      } else {
        // Create new policy
        const newPolicy: AuthPolicy = {
          id: `pol_${Date.now()}`,
          ...policyData,
          createdAt: new Date().toISOString(),
          createdBy: "admin@company.com",
          updatedAt: new Date().toISOString(),
          updatedBy: "admin@company.com",
          version: "1.0",
          versions: [],
          conflicts: [],
          keycloakSyncStatus: "pending",
          cacheKey: `policy:pol_${Date.now()}`,
          cacheTTL: 3600,
          stats: {
            appliedCount: 0,
            deniedCount: 0,
            challengedCount: 0,
            errorCount: 0
          }
        }
        
        setPolicies(prev => [...prev, newPolicy])
        toast.success("Policy created successfully")
      }
      
      setShowCreateForm(false)
      setEditingPolicy(null)
    } catch (error) {
      toast.error("Failed to save policy")
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    if (!permissions.canDelete) {
      toast.error("You don't have permission to delete policies")
      return
    }

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPolicies(prev => prev.filter(p => p.id !== policyId))
      toast.success("Policy deleted successfully")
    } catch (error) {
      toast.error("Failed to delete policy")
    }
  }

  const handleActivatePolicy = async (policyId: string) => {
    if (!permissions.canActivate) {
      toast.error("You don't have permission to activate policies")
      return
    }

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPolicies(prev => 
        prev.map(p => p.id === policyId 
          ? { ...p, status: 'active' as const, updatedAt: new Date().toISOString() }
          : p
        )
      )
      toast.success("Policy activated successfully")
    } catch (error) {
      toast.error("Failed to activate policy")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Authentication Policies</span>
          </h1>
          <p className="text-muted-foreground">
            Manage authentication, authorization, and security policies for your organization
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {conflictCount > 0 && (
            <Alert className="w-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {conflictCount} policy conflict{conflictCount > 1 ? 's' : ''} detected
              </AlertDescription>
            </Alert>
          )}
          
          {permissions.canCreate && (
            <Button onClick={handleCreatePolicy}>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{policies.length}</p>
                <p className="text-xs text-muted-foreground">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{policies.filter(p => p.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Active Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{conflictCount}</p>
                <p className="text-xs text-muted-foreground">Conflicts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{policies.reduce((acc, p) => acc + p.stats.appliedCount, 0)}</p>
                <p className="text-xs text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="policies" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Policies</span>
            <Badge variant="secondary">{policies.length}</Badge>
          </TabsTrigger>
          
          <TabsTrigger value="conflicts" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Conflicts</span>
            {conflictCount > 0 && (
              <Badge variant="destructive">{conflictCount}</Badge>
            )}
          </TabsTrigger>
          
          {permissions.canSimulate && (
            <TabsTrigger value="simulation" className="flex items-center space-x-2">
              <TestTube className="h-4 w-4" />
              <span>Simulation</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          
          {permissions.canViewAudit && (
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Audit Log</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          {showCreateForm ? (
            <PolicyForm
              policy={editingPolicy}
              onSubmit={handlePolicySubmit}
              onCancel={() => {
                setShowCreateForm(false)
                setEditingPolicy(null)
              }}
              permissions={permissions}
            />
          ) : (
            <PolicyList
              policies={policies}
              loading={loading}
              onEdit={handleEditPolicy}
              onDelete={handleDeletePolicy}
              onActivate={handleActivatePolicy}
              permissions={permissions}
            />
          )}
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-6">
          <PolicyConflicts policies={policies} />
        </TabsContent>

        {permissions.canSimulate && (
          <TabsContent value="simulation" className="space-y-6">
            <PolicySimulation policies={policies} />
          </TabsContent>
        )}

        <TabsContent value="stats" className="space-y-6">
          <PolicyStats policies={policies} />
        </TabsContent>

        {permissions.canViewAudit && (
          <TabsContent value="audit" className="space-y-6">
            <PolicyAudit />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}