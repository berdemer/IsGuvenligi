'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Shield,
  Database,
  Clock,
  MapPin,
  Smartphone,
  Activity,
  RefreshCw,
  Save,
  Download,
  Eye
} from 'lucide-react'
import { PolicySimulation, AccessLevel, AccessPolicy, PolicyResource } from '@/types/access-policy'

// Mock users for simulation
const mockUsers = [
  { id: 'user-1', name: 'John Smith', email: 'john.smith@company.com', role: 'admin', department: 'IT' },
  { id: 'user-2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'manager', department: 'Finance' },
  { id: 'user-3', name: 'Mike Chen', email: 'mike.chen@company.com', role: 'developer', department: 'Engineering' },
  { id: 'user-4', name: 'Lisa Brown', email: 'lisa.brown@company.com', role: 'hr-manager', department: 'HR' },
  { id: 'user-5', name: 'David Wilson', email: 'david.wilson@company.com', role: 'employee', department: 'Sales' }
]

// Mock resources for simulation
const mockResources = [
  { id: 'res-1', name: 'HR Database', type: 'database' as const, path: '/hr/employees' },
  { id: 'res-2', name: 'Finance API', type: 'api' as const, path: '/api/finance' },
  { id: 'res-3', name: 'Admin Panel', type: 'application' as const, path: '/admin' },
  { id: 'res-4', name: 'Employee Portal', type: 'application' as const, path: '/portal' },
  { id: 'res-5', name: 'Payroll System', type: 'database' as const, path: '/payroll' },
  { id: 'res-6', name: 'Development Tools', type: 'application' as const, path: '/dev/tools' }
]

// Mock policies for simulation
const mockPolicies: AccessPolicy[] = [
  {
    id: 'pol-1',
    name: 'Admin Full Access',
    description: 'Complete system access for administrators',
    type: 'allow',
    status: 'active',
    scope: 'role',
    subjects: [{ type: 'role', identifiers: ['admin'] }],
    resources: [{ id: 'all', name: 'All Resources', type: 'custom', path: '/*' }],
    rules: [{ effect: 'allow', accessLevels: ['full'] }],
    priority: 100,
    version: 1,
    rollout: { enabled: true, percentage: 100 },
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    tags: ['admin', 'system']
  },
  {
    id: 'pol-2',
    name: 'HR Data Access',
    description: 'HR managers can access HR database',
    type: 'allow',
    status: 'active',
    scope: 'role',
    subjects: [{ type: 'role', identifiers: ['hr-manager'] }],
    resources: [{ id: 'res-1', name: 'HR Database', type: 'database', path: '/hr/*' }],
    rules: [{ effect: 'allow', accessLevels: ['read', 'write'] }],
    priority: 90,
    version: 1,
    rollout: { enabled: true, percentage: 100 },
    createdBy: 'hr-admin',
    updatedBy: 'hr-admin',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
    tags: ['hr', 'data']
  },
  {
    id: 'pol-3',
    name: 'Finance Restrictions',
    description: 'Restrict finance data access',
    type: 'deny',
    status: 'active',
    scope: 'resource',
    subjects: [{ type: 'role', identifiers: ['employee'] }],
    resources: [{ id: 'res-2', name: 'Finance API', type: 'api', path: '/api/finance/*' }],
    rules: [{ effect: 'deny', accessLevels: ['read', 'write', 'execute'] }],
    priority: 85,
    version: 1,
    rollout: { enabled: true, percentage: 100 },
    createdBy: 'finance-admin',
    updatedBy: 'finance-admin',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
    tags: ['finance', 'security']
  }
]

interface SimulationResultProps {
  simulation: PolicySimulation | null
  isLoading: boolean
}

const SimulationResult: React.FC<SimulationResultProps> = ({ simulation, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Running simulation...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!simulation) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-2" />
            <p>Configure parameters and run simulation to see results</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { result } = simulation

  return (
    <div className="space-y-4">
      {/* Access Decision */}
      <Card className={`border-l-4 ${result.granted ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {result.granted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Access {result.granted ? 'Granted' : 'Denied'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.effectiveAccess.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Effective Access:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.effectiveAccess.map((access) => (
                  <Badge key={access} variant="default" className="bg-green-100 text-green-800">
                    {access}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {result.deniedAccess.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Denied Access:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.deniedAccess.map((access) => (
                  <Badge key={access} variant="destructive" className="bg-red-100 text-red-800">
                    {access}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applied Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Applied Policies</CardTitle>
          <CardDescription>Policies evaluated during this simulation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.appliedPolicies.map((policy) => (
              <div
                key={policy.policyId}
                className={`p-3 rounded border ${
                  policy.effect === 'allow' 
                    ? 'bg-green-50 border-green-200' 
                    : policy.effect === 'deny'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{policy.policyName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      policy.effect === 'allow' ? 'default' : 
                      policy.effect === 'deny' ? 'destructive' : 'secondary'
                    }>
                      {policy.effect}
                    </Badge>
                    <Badge variant="outline">Priority: {policy.priority}</Badge>
                  </div>
                </div>
                {policy.matchedConditions.length > 0 && (
                  <div className="text-xs text-gray-600">
                    Matched conditions: {policy.matchedConditions.join(', ')}
                  </div>
                )}
              </div>
            ))}
            
            {result.appliedPolicies.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No policies matched this simulation</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Conflicts */}
      {result.conflicts && result.conflicts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Detected Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.conflicts.map((conflict) => (
                <div key={conflict.id} className="p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="text-sm font-medium">{conflict.type} conflict</div>
                  <div className="text-xs text-gray-600">{conflict.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function PolicySimulation() {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedResource, setSelectedResource] = useState<string>('')
  const [requestedAccess, setRequestedAccess] = useState<AccessLevel[]>(['read'])
  const [customAttributes, setCustomAttributes] = useState<string>('{}')
  const [simulation, setSimulation] = useState<PolicySimulation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savedSimulations, setSavedSimulations] = useState<PolicySimulation[]>([])

  const accessLevels: AccessLevel[] = ['read', 'write', 'execute', 'admin', 'full']

  const runSimulation = async () => {
    if (!selectedUser || !selectedResource) return

    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const user = mockUsers.find(u => u.id === selectedUser)
    const resource = mockResources.find(r => r.id === selectedResource)
    
    if (!user || !resource) return

    // Simple policy evaluation logic
    const appliedPolicies = mockPolicies
      .filter(policy => {
        // Check if policy applies to this user
        const subjectMatch = policy.subjects.some(subject => {
          if (subject.type === 'role' && subject.identifiers.includes(user.role)) return true
          if (subject.type === 'user' && subject.identifiers.includes(user.id)) return true
          if (subject.type === 'everyone') return true
          return false
        })
        
        // Check if policy applies to this resource
        const resourceMatch = policy.resources.some(policyRes => {
          if (policyRes.id === resource.id) return true
          if (policyRes.path === '/*') return true
          if (resource.path.startsWith(policyRes.path?.replace('*', '') || '')) return true
          return false
        })
        
        return subjectMatch && resourceMatch
      })
      .sort((a, b) => b.priority - a.priority)
      .map(policy => ({
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.type,
        priority: policy.priority,
        matchedConditions: []
      }))

    // Determine access decision
    let granted = false
    let effectiveAccess: AccessLevel[] = []
    let deniedAccess: AccessLevel[] = []

    for (const requestedLevel of requestedAccess) {
      let levelGranted = false
      
      for (const appliedPolicy of appliedPolicies) {
        const policy = mockPolicies.find(p => p.id === appliedPolicy.policyId)
        if (!policy) continue
        
        if (policy.type === 'allow' && policy.rules.some(rule => 
          rule.accessLevels.includes(requestedLevel) || rule.accessLevels.includes('full')
        )) {
          levelGranted = true
          break
        } else if (policy.type === 'deny' && policy.rules.some(rule =>
          rule.accessLevels.includes(requestedLevel) || rule.accessLevels.includes('full')
        )) {
          levelGranted = false
          break
        }
      }
      
      if (levelGranted) {
        effectiveAccess.push(requestedLevel)
        granted = true
      } else {
        deniedAccess.push(requestedLevel)
      }
    }

    const newSimulation: PolicySimulation = {
      id: `sim-${Date.now()}`,
      userId: selectedUser,
      resourceId: selectedResource,
      requestedAccess,
      result: {
        granted,
        effectiveAccess,
        deniedAccess,
        appliedPolicies,
        recommendations: granted ? [] : [
          'Consider creating an allow policy for this user-resource combination',
          'Review existing deny policies that might be blocking access'
        ]
      },
      simulationContext: {
        timestamp: new Date().toISOString(),
        userAttributes: {
          name: user.name,
          role: user.role,
          department: user.department
        },
        resourceAttributes: {
          name: resource.name,
          type: resource.type,
          path: resource.path
        },
        requestAttributes: JSON.parse(customAttributes || '{}')
      }
    }

    setSimulation(newSimulation)
    setIsLoading(false)
  }

  const saveSimulation = () => {
    if (simulation) {
      setSavedSimulations(prev => [simulation, ...prev])
    }
  }

  const toggleAccessLevel = (level: AccessLevel) => {
    setRequestedAccess(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Policy Simulation
          </CardTitle>
          <CardDescription>
            Test how your access policies behave with different user-resource combinations
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="simulate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulate">New Simulation</TabsTrigger>
          <TabsTrigger value="history">Simulation History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simulation Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Simulation Parameters</CardTitle>
                <CardDescription>Configure the scenario you want to test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user to simulate" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {user.name} ({user.role})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Resource</Label>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resource to access" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockResources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          <div className="flex items-center gap-2">
                            {resource.type === 'database' ? <Database className="h-4 w-4" /> :
                             resource.type === 'api' ? <Activity className="h-4 w-4" /> :
                             <Shield className="h-4 w-4" />}
                            {resource.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Requested Access Levels</Label>
                  <div className="flex flex-wrap gap-2">
                    {accessLevels.map((level) => (
                      <Button
                        key={level}
                        variant={requestedAccess.includes(level) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAccessLevel(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Attributes (JSON)</Label>
                  <Textarea
                    placeholder='{"location": "office", "device": "trusted"}'
                    value={customAttributes}
                    onChange={(e) => setCustomAttributes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    onClick={runSimulation} 
                    disabled={!selectedUser || !selectedResource || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run Simulation
                  </Button>
                  {simulation && (
                    <Button variant="outline" onClick={saveSimulation}>
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Simulation Context */}
            {(selectedUser || selectedResource) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Simulation Context</CardTitle>
                  <CardDescription>Details about the selected user and resource</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedUser && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User Details
                      </h4>
                      {(() => {
                        const user = mockUsers.find(u => u.id === selectedUser)
                        return user ? (
                          <div className="space-y-1 text-xs">
                            <div><strong>Name:</strong> {user.name}</div>
                            <div><strong>Email:</strong> {user.email}</div>
                            <div><strong>Role:</strong> <Badge variant="outline">{user.role}</Badge></div>
                            <div><strong>Department:</strong> {user.department}</div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}

                  {selectedResource && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Resource Details
                      </h4>
                      {(() => {
                        const resource = mockResources.find(r => r.id === selectedResource)
                        return resource ? (
                          <div className="space-y-1 text-xs">
                            <div><strong>Name:</strong> {resource.name}</div>
                            <div><strong>Type:</strong> <Badge variant="outline">{resource.type}</Badge></div>
                            <div><strong>Path:</strong> <code className="bg-gray-100 px-1 rounded">{resource.path}</code></div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}

                  {requestedAccess.length > 0 && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                      <h4 className="font-medium text-sm mb-2">Requested Access</h4>
                      <div className="flex flex-wrap gap-1">
                        {requestedAccess.map((level) => (
                          <Badge key={level} variant="secondary">{level}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Simulation Results */}
          <SimulationResult simulation={simulation} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Simulation History</span>
                <Button variant="outline" size="sm" onClick={() => setSavedSimulations([])}>
                  Clear History
                </Button>
              </CardTitle>
              <CardDescription>
                Previously run simulations for reference and comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedSimulations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2" />
                  <p>No saved simulations yet</p>
                  <p className="text-sm">Run simulations and save them to build a history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSimulations.map((sim) => {
                    const user = mockUsers.find(u => u.id === sim.userId)
                    const resource = mockResources.find(r => r.id === sim.resourceId)
                    
                    return (
                      <div key={sim.id} className="border rounded p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {sim.result.granted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium text-sm">
                              {user?.name} → {resource?.name}
                            </span>
                            <Badge variant={sim.result.granted ? "default" : "destructive"}>
                              {sim.result.granted ? 'Granted' : 'Denied'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(sim.simulationContext.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Requested: {sim.requestedAccess.join(', ')} | 
                          Effective: {sim.result.effectiveAccess.join(', ') || 'None'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}