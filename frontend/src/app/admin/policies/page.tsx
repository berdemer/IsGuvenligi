"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, FileText, AlertTriangle, CheckCircle, 
  Download, Plus, BarChart3, Eye, Settings,
  Activity, Users, Database, TrendingUp, 
  RefreshCw, Clock, MapPin
} from "lucide-react"
import { 
  AccessPolicy, 
  PolicyAnalytics, 
  PolicyFilters, 
  PolicyConflict 
} from "@/types/access-policy"
import { PolicyList } from "@/components/admin/policies/PolicyList"
import ConflictManager from "@/components/admin/policies/ConflictManager"
import PolicySimulation from "@/components/admin/policies/PolicySimulation"
import PolicyAnalyticsComponent from "@/components/admin/policies/PolicyAnalytics"
import PolicyAuditLog from "@/components/admin/policies/PolicyAuditLog"
import KeycloakIntegration from "@/components/admin/policies/KeycloakIntegration"
import toast from "react-hot-toast"

export default function AccessPoliciesPage() {
  const [activeTab, setActiveTab] = useState("policies")
  const [policies, setPolicies] = useState<AccessPolicy[]>([])
  const [analytics, setAnalytics] = useState<PolicyAnalytics | null>(null)
  const [conflicts, setConflicts] = useState<PolicyConflict[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock data generator
  const generateMockPolicies = useCallback((): AccessPolicy[] => {
    const mockPolicies: AccessPolicy[] = [
      {
        id: "policy-1",
        name: "Admin Full Access",
        description: "Full access to all resources for administrators",
        type: "allow",
        status: "active",
        scope: "role",
        subjects: [{
          type: "role",
          identifiers: ["admin", "super_admin"],
          attributes: {}
        }],
        resources: [{
          id: "all-resources",
          name: "All Resources",
          type: "custom",
          path: "*",
          methods: ["GET", "POST", "PUT", "DELETE"],
          attributes: {}
        }],
        rules: [{
          effect: "allow",
          accessLevels: ["full"],
          conditions: {
            time: {
              enabled: true,
              allowedHours: { start: "00:00", end: "23:59" },
              allowedDays: [1,2,3,4,5,6,7]
            },
            device: {
              enabled: true,
              requireMFA: true,
              requiredDeviceTrust: "trusted"
            }
          }
        }],
        priority: 100,
        version: 1,
        rollout: {
          enabled: true,
          percentage: 100
        },
        createdBy: "system",
        updatedBy: "admin@company.com",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-08-20T14:30:00Z",
        stats: {
          affectedUsers: 5,
          affectedResources: 50,
          accessAttempts: 1250,
          deniedAttempts: 12,
          lastEnforced: "2024-08-25T08:15:00Z"
        },
        tags: ["admin", "critical", "full-access"],
        category: "administration"
      },
      {
        id: "policy-2", 
        name: "Employee Basic Access",
        description: "Basic read access to workplace safety applications during business hours",
        type: "allow",
        status: "active",
        scope: "role",
        subjects: [{
          type: "role",
          identifiers: ["employee", "contractor"],
          attributes: {}
        }],
        resources: [{
          id: "safety-apps",
          name: "Safety Applications",
          type: "application",
          path: "/app/safety/*",
          methods: ["GET"],
          attributes: { department: "safety" }
        }],
        rules: [{
          effect: "allow",
          accessLevels: ["read"],
          conditions: {
            time: {
              enabled: true,
              allowedHours: { start: "08:00", end: "18:00" },
              allowedDays: [1,2,3,4,5],
              timezone: "UTC"
            },
            geo: {
              enabled: true,
              allowedCountries: ["TR", "DE", "US"]
            },
            device: {
              enabled: true,
              allowedDeviceTypes: ["desktop", "mobile"],
              requireMFA: false
            }
          }
        }],
        priority: 50,
        version: 2,
        rollout: {
          enabled: true,
          percentage: 85,
          targetGroups: ["safety-team", "operations"]
        },
        createdBy: "admin@company.com",
        updatedBy: "security@company.com", 
        createdAt: "2024-02-01T09:00:00Z",
        updatedAt: "2024-08-22T11:45:00Z",
        stats: {
          affectedUsers: 234,
          affectedResources: 12,
          accessAttempts: 15420,
          deniedAttempts: 89,
          lastEnforced: "2024-08-25T09:30:00Z"
        },
        tags: ["employee", "safety", "business-hours"],
        category: "workplace-access"
      },
      {
        id: "policy-3",
        name: "External Vendor Restricted",
        description: "Limited access for external vendors with geo and IP restrictions",
        type: "conditional",
        status: "active",
        scope: "group",
        subjects: [{
          type: "group",
          identifiers: ["external-vendors", "contractors"],
          attributes: { userType: "external" }
        }],
        resources: [{
          id: "vendor-portal",
          name: "Vendor Portal",
          type: "application",
          path: "/vendor/*",
          methods: ["GET", "POST"],
          attributes: { classification: "restricted" }
        }],
        rules: [{
          effect: "allow",
          accessLevels: ["read", "write"],
          conditions: {
            ip: {
              enabled: true,
              allowedIPs: ["203.0.113.0/24", "198.51.100.0/24"],
              denyVPN: true,
              denyTor: true
            },
            geo: {
              enabled: true,
              allowedCountries: ["TR"],
              allowedCities: ["Istanbul", "Ankara", "Izmir"]
            },
            device: {
              enabled: true,
              requireMFA: true,
              maxConcurrentSessions: 2,
              requiredDeviceTrust: "managed"
            },
            time: {
              enabled: true,
              allowedHours: { start: "09:00", end: "17:00" },
              allowedDays: [1,2,3,4,5]
            }
          }
        }],
        priority: 75,
        version: 1,
        rollout: {
          enabled: true,
          percentage: 100
        },
        createdBy: "security@company.com",
        updatedBy: "security@company.com",
        createdAt: "2024-03-10T14:20:00Z",
        updatedAt: "2024-08-18T16:10:00Z",
        stats: {
          affectedUsers: 45,
          affectedResources: 8,
          accessAttempts: 892,
          deniedAttempts: 156,
          lastEnforced: "2024-08-25T10:05:00Z"
        },
        tags: ["vendor", "restricted", "conditional"],
        category: "external-access"
      },
      {
        id: "policy-4",
        name: "High Risk Deny",
        description: "Deny access for high-risk users and suspicious activities",
        type: "deny",
        status: "active", 
        scope: "global",
        subjects: [{
          type: "everyone",
          identifiers: ["*"],
          attributes: {}
        }],
        resources: [{
          id: "sensitive-data",
          name: "Sensitive Data",
          type: "database",
          path: "/data/sensitive/*",
          attributes: { classification: "confidential" }
        }],
        rules: [{
          effect: "deny",
          accessLevels: ["read", "write", "execute"],
          conditions: {
            risk: {
              enabled: true,
              maxRiskScore: 70,
              allowedRiskLevels: ["low", "medium"],
              autoBlock: {
                riskThreshold: 80,
                duration: 60
              }
            },
            geo: {
              enabled: true,
              deniedCountries: ["XX", "YY"] // High-risk countries
            },
            ip: {
              enabled: true,
              denyTor: true,
              denyProxy: true,
              deniedASNs: ["AS12345"] // Malicious ASNs
            }
          }
        }],
        priority: 90,
        version: 1,
        rollout: {
          enabled: true,
          percentage: 100
        },
        createdBy: "security@company.com",
        updatedBy: "security@company.com",
        createdAt: "2024-04-05T10:30:00Z", 
        updatedAt: "2024-08-15T13:45:00Z",
        stats: {
          affectedUsers: 1200,
          affectedResources: 25,
          accessAttempts: 45,
          deniedAttempts: 45,
          lastEnforced: "2024-08-25T07:22:00Z"
        },
        tags: ["security", "deny", "high-risk"],
        category: "security"
      }
    ]

    return mockPolicies
  }, [])

  const generateMockAnalytics = useCallback((): PolicyAnalytics => {
    return {
      timeRange: {
        from: "2024-08-18T00:00:00Z",
        to: "2024-08-25T23:59:59Z"
      },
      totalPolicies: 45,
      activePolicies: 38,
      conflictingPolicies: 3,
      enforcedResources: 127,
      accessAttempts: {
        total: 125670,
        granted: 118450,
        denied: 7220,
        byResource: [
          { resourceId: "safety-apps", resourceName: "Safety Applications", attempts: 45200 },
          { resourceId: "vendor-portal", resourceName: "Vendor Portal", attempts: 12500 },
          { resourceId: "admin-panel", resourceName: "Admin Panel", attempts: 8900 }
        ],
        byUser: [
          { userId: "user-1", userName: "John Doe", attempts: 2450 },
          { userId: "user-2", userName: "Jane Smith", attempts: 1890 },
          { userId: "user-3", userName: "Mike Johnson", attempts: 1670 }
        ],
        byPolicy: [
          { policyId: "policy-2", policyName: "Employee Basic Access", enforcements: 45200 },
          { policyId: "policy-1", policyName: "Admin Full Access", enforcements: 8900 },
          { policyId: "policy-3", policyName: "External Vendor Restricted", enforcements: 12500 }
        ]
      },
      accessTrends: [
        { date: "2024-08-18", granted: 16500, denied: 890 },
        { date: "2024-08-19", granted: 17200, denied: 920 },
        { date: "2024-08-20", granted: 16800, denied: 1100 },
        { date: "2024-08-21", granted: 17500, denied: 980 },
        { date: "2024-08-22", granted: 16900, denied: 1050 },
        { date: "2024-08-23", granted: 17100, denied: 1150 },
        { date: "2024-08-24", granted: 16950, denied: 1120 },
        { date: "2024-08-25", granted: 13500, denied: 900 }
      ],
      policyDistribution: [
        { type: "allow", count: 28, percentage: 62.2 },
        { type: "deny", count: 8, percentage: 17.8 },
        { type: "conditional", count: 9, percentage: 20.0 }
      ],
      scopeDistribution: [
        { scope: "role", count: 20, percentage: 44.4 },
        { scope: "group", count: 12, percentage: 26.7 },
        { scope: "user", count: 8, percentage: 17.8 },
        { scope: "resource", count: 3, percentage: 6.7 },
        { scope: "global", count: 2, percentage: 4.4 }
      ],
      riskAnalysis: {
        highRiskAccess: 456,
        anomalousAccess: 89,
        privilegedAccess: 1234,
        suspiciousPatterns: [
          { pattern: "Off-hours admin access", count: 23, severity: "medium" },
          { pattern: "Geo-velocity violations", count: 12, severity: "high" },
          { pattern: "Multiple failed attempts", count: 45, severity: "low" }
        ]
      },
      topResources: [
        { resourceId: "safety-apps", resourceName: "Safety Applications", accessCount: 45200, denyCount: 892 },
        { resourceId: "vendor-portal", resourceName: "Vendor Portal", accessCount: 12500, denyCount: 2100 },
        { resourceId: "admin-panel", resourceName: "Admin Panel", accessCount: 8900, denyCount: 145 }
      ],
      topUsers: [
        { userId: "user-1", userName: "John Doe", accessCount: 2450, denyCount: 34 },
        { userId: "user-2", userName: "Jane Smith", accessCount: 1890, denyCount: 12 },
        { userId: "user-3", userName: "Mike Johnson", accessCount: 1670, denyCount: 89 }
      ]
    }
  }, [])

  const generateMockConflicts = useCallback((): PolicyConflict[] => {
    return [
      {
        id: "conflict-1",
        severity: "high",
        type: "contradiction",
        conflictingPolicies: [
          { policyId: "policy-2", policyName: "Employee Basic Access", priority: 50 },
          { policyId: "policy-4", policyName: "High Risk Deny", priority: 90 }
        ],
        affectedResources: [{
          id: "safety-apps",
          name: "Safety Applications", 
          type: "application",
          attributes: {}
        }],
        affectedSubjects: [{
          type: "role",
          identifiers: ["employee"],
          attributes: {}
        }],
        description: "Allow policy for employees conflicts with high-risk deny policy",
        recommendation: "Add risk score condition to employee policy to exclude high-risk users",
        autoResolvable: true,
        detectedAt: "2024-08-24T15:30:00Z"
      },
      {
        id: "conflict-2", 
        severity: "medium",
        type: "overlap",
        conflictingPolicies: [
          { policyId: "policy-1", policyName: "Admin Full Access", priority: 100 },
          { policyId: "policy-3", policyName: "External Vendor Restricted", priority: 75 }
        ],
        affectedResources: [{
          id: "vendor-portal",
          name: "Vendor Portal",
          type: "application", 
          attributes: {}
        }],
        affectedSubjects: [{
          type: "user",
          identifiers: ["admin@vendor.com"],
          attributes: { userType: "external" }
        }],
        description: "Admin with vendor group membership has conflicting access rules",
        recommendation: "Create specific policy for admin vendors or adjust group membership",
        autoResolvable: false,
        detectedAt: "2024-08-23T11:20:00Z"
      }
    ]
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      // Mock API calls
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockPolicies = generateMockPolicies()
      const mockAnalytics = generateMockAnalytics()
      const mockConflicts = generateMockConflicts()
      
      setPolicies(mockPolicies)
      setAnalytics(mockAnalytics)
      setConflicts(mockConflicts)
      setLastUpdated(new Date())
    } catch (error) {
      toast.error("Failed to load access policies data")
    } finally {
      setLoading(false)
    }
  }, [generateMockPolicies, generateMockAnalytics, generateMockConflicts])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreatePolicy = () => {
    toast.success("Create Policy dialog would open here")
    // TODO: Open policy creation dialog/page
  }

  const handleExport = () => {
    toast.success("Policy export would start here")
    // TODO: Export functionality
  }

  const handleViewReports = () => {
    toast.success("Navigate to reports page")
    // TODO: Navigate to detailed reports
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading access policies...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Access Policies</h2>
          <p className="text-muted-foreground">
            Manage resource access controls, permissions, and security policies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleViewReports}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleCreatePolicy}>
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalPolicies || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +3</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.activePolicies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics && Math.round((analytics.activePolicies / analytics.totalPolicies) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics?.conflictingPolicies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">Requires attention</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enforced Resources</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.enforcedResources || 0}</div>
            <p className="text-xs text-muted-foreground">
              Applications and APIs protected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{conflicts.length} policy conflicts detected.</strong> 
            {" "}Review the Conflicts tab to resolve issues and ensure proper access control.
          </AlertDescription>
        </Alert>
      )}

      {/* Last Updated Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated.toLocaleString()}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="policies" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Policies</span>
            <Badge variant="secondary">{analytics?.totalPolicies || 0}</Badge>
          </TabsTrigger>
          
          <TabsTrigger value="conflicts" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Conflicts</span>
            {conflicts.length > 0 && (
              <Badge variant="destructive">{conflicts.length}</Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="simulation" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Simulation</span>
          </TabsTrigger>
          
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Audit Log</span>
          </TabsTrigger>
          
          <TabsTrigger value="keycloak" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Keycloak</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <PolicyList 
            policies={policies}
            loading={loading}
            onPolicyUpdate={(policy) => {
              setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p))
              toast.success("Policy updated")
            }}
            onPolicyDelete={(policyId) => {
              setPolicies(prev => prev.filter(p => p.id !== policyId))
              toast.success("Policy deleted")
            }}
            onPolicyClone={(policy) => {
              const clonedPolicy = {
                ...policy,
                id: `policy-${Date.now()}`,
                name: `${policy.name} (Copy)`,
                status: 'draft' as const,
                version: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              setPolicies(prev => [clonedPolicy, ...prev])
              toast.success("Policy cloned")
            }}
            onPolicyEdit={(policy) => {
              toast.success(`Edit policy: ${policy.name}`)
              // TODO: Open policy editor
            }}
          />
        </TabsContent>

        <TabsContent value="conflicts">
          <ConflictManager />
        </TabsContent>

        <TabsContent value="simulation">
          <PolicySimulation />
        </TabsContent>

        <TabsContent value="analytics">
          <PolicyAnalyticsComponent />
        </TabsContent>

        <TabsContent value="audit">
          <PolicyAuditLog />
        </TabsContent>

        <TabsContent value="keycloak">
          <KeycloakIntegration />
        </TabsContent>
      </Tabs>
    </div>
  )
}