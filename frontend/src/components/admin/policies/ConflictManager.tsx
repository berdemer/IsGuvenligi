'use client'

import React, { useState, useEffect } from 'react'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  AlertTriangle,
  GripVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { AccessPolicy, PolicyConflict, ConflictSeverity } from '@/types/access-policy'

// Mock data for conflicts
const generateMockConflicts = (): PolicyConflict[] => [
  {
    id: 'conflict-1',
    severity: 'critical',
    type: 'contradiction',
    conflictingPolicies: [
      { policyId: 'pol-1', policyName: 'Admin Full Access', priority: 100 },
      { policyId: 'pol-2', policyName: 'HR Data Deny', priority: 90 }
    ],
    affectedResources: [
      { id: 'res-1', name: 'HR Database', type: 'database', path: '/hr/employees' }
    ],
    affectedSubjects: [
      { type: 'role', identifiers: ['admin', 'hr-manager'] }
    ],
    description: 'Admin role has full access while HR policy explicitly denies access to HR database',
    recommendation: 'Either exclude HR database from Admin policy or remove deny rule for admin role',
    autoResolvable: false,
    detectedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'conflict-2',
    severity: 'high',
    type: 'priority',
    conflictingPolicies: [
      { policyId: 'pol-3', policyName: 'Manager API Access', priority: 80 },
      { policyId: 'pol-4', policyName: 'Department Restrictions', priority: 85 }
    ],
    affectedResources: [
      { id: 'res-2', name: 'Finance API', type: 'api', path: '/api/finance' }
    ],
    affectedSubjects: [
      { type: 'role', identifiers: ['finance-manager'] }
    ],
    description: 'Conflicting priority levels for Finance API access',
    recommendation: 'Adjust priority levels to ensure proper access hierarchy',
    autoResolvable: true,
    detectedAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 'conflict-3',
    severity: 'medium',
    type: 'overlap',
    conflictingPolicies: [
      { policyId: 'pol-5', policyName: 'Developer Tools', priority: 70 },
      { policyId: 'pol-6', policyName: 'QA Environment', priority: 75 }
    ],
    affectedResources: [
      { id: 'res-3', name: 'Development Environment', type: 'application', path: '/dev/tools' }
    ],
    affectedSubjects: [
      { type: 'role', identifiers: ['developer', 'qa-tester'] }
    ],
    description: 'Overlapping access permissions for development resources',
    recommendation: 'Consolidate policies or define clearer boundaries',
    autoResolvable: true,
    detectedAt: '2024-01-15T08:45:00Z'
  }
]

// Mock policy data for priority management
const generateMockPoliciesForConflict = (): AccessPolicy[] => [
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
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    tags: ['admin', 'system']
  },
  {
    id: 'pol-2',
    name: 'HR Data Deny',
    description: 'Restrict access to sensitive HR data',
    type: 'deny',
    status: 'active',
    scope: 'resource',
    subjects: [{ type: 'everyone', identifiers: ['*'] }],
    resources: [{ id: 'hr-db', name: 'HR Database', type: 'database', path: '/hr/*' }],
    rules: [{ effect: 'deny', accessLevels: ['read', 'write'] }],
    priority: 90,
    version: 1,
    rollout: { enabled: true, percentage: 100 },
    createdBy: 'hr-admin',
    updatedBy: 'hr-admin',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
    tags: ['hr', 'security']
  },
  {
    id: 'pol-3',
    name: 'Manager API Access',
    description: 'API access for managers',
    type: 'allow',
    status: 'active',
    scope: 'role',
    subjects: [{ type: 'role', identifiers: ['manager'] }],
    resources: [{ id: 'api', name: 'Management APIs', type: 'api', path: '/api/management/*' }],
    rules: [{ effect: 'allow', accessLevels: ['read', 'write'] }],
    priority: 80,
    version: 1,
    rollout: { enabled: true, percentage: 100 },
    createdBy: 'sys-admin',
    updatedBy: 'sys-admin',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
    tags: ['manager', 'api']
  },
  {
    id: 'pol-4',
    name: 'Department Restrictions',
    description: 'Department-based access restrictions',
    type: 'conditional',
    status: 'active',
    scope: 'group',
    subjects: [{ type: 'group', identifiers: ['finance-dept'] }],
    resources: [{ id: 'finance-api', name: 'Finance API', type: 'api', path: '/api/finance/*' }],
    rules: [{ effect: 'conditional', accessLevels: ['read'] }],
    priority: 85,
    version: 1,
    rollout: { enabled: true, percentage: 100 },
    createdBy: 'dept-admin',
    updatedBy: 'dept-admin',
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-13T00:00:00Z',
    tags: ['department', 'restrictions']
  }
]

const SeverityIcon = ({ severity }: { severity: ConflictSeverity }) => {
  switch (severity) {
    case 'critical':
      return <ShieldX className="h-4 w-4 text-red-500" />
    case 'high':
      return <ShieldAlert className="h-4 w-4 text-orange-500" />
    case 'medium':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'low':
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

const SeverityBadge = ({ severity }: { severity: ConflictSeverity }) => {
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

interface SortablePolicyProps {
  policy: AccessPolicy
  isConflicting?: boolean
}

const SortablePolicy: React.FC<SortablePolicyProps> = ({ policy, isConflicting = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: policy.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        isConflicting ? 'border-red-200 bg-red-50' : 'border-gray-200'
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{policy.name}</h4>
              <Badge variant={policy.type === 'allow' ? 'default' : policy.type === 'deny' ? 'destructive' : 'secondary'}>
                {policy.type}
              </Badge>
              {isConflicting && <Badge variant="destructive">Conflict</Badge>}
            </div>
            <p className="text-xs text-gray-600 mt-1">{policy.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{policy.priority}</div>
          <div className="text-xs text-gray-500">Priority</div>
        </div>
      </div>
    </div>
  )
}

interface ConflictCardProps {
  conflict: PolicyConflict
  onResolve: (conflictId: string, resolution: 'auto' | 'manual') => void
}

const ConflictCard: React.FC<ConflictCardProps> = ({ conflict, onResolve }) => {
  return (
    <Card className={`border-l-4 ${
      conflict.severity === 'critical' ? 'border-l-red-500' :
      conflict.severity === 'high' ? 'border-l-orange-500' :
      conflict.severity === 'medium' ? 'border-l-yellow-500' :
      'border-l-blue-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={conflict.severity} />
              <Badge variant="outline" className="capitalize">
                {conflict.type.replace('_', ' ')}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {conflict.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {conflict.autoResolvable && (
              <Button 
                size="sm" 
                onClick={() => onResolve(conflict.id, 'auto')}
                className="h-8"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Auto Resolve
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onResolve(conflict.id, 'manual')}
              className="h-8"
            >
              Manage
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h5 className="text-sm font-medium mb-2">Conflicting Policies:</h5>
          <div className="space-y-1">
            {conflict.conflictingPolicies.map((policy) => (
              <div key={policy.policyId} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                <span>{policy.policyName}</span>
                <Badge variant="outline">Priority: {policy.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium mb-2">Affected Resources:</h5>
          <div className="flex flex-wrap gap-1">
            {conflict.affectedResources.map((resource) => (
              <Badge key={resource.id} variant="secondary" className="text-xs">
                {resource.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {conflict.recommendation && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-sm text-blue-800">
              <strong>Recommendation:</strong> {conflict.recommendation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ConflictManager() {
  const [conflicts, setConflicts] = useState<PolicyConflict[]>(generateMockConflicts())
  const [policies, setPolicies] = useState<AccessPolicy[]>(generateMockPoliciesForConflict())
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<ConflictSeverity | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showResolved, setShowResolved] = useState(false)
  const [isResolving, setIsResolving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredConflicts = conflicts.filter(conflict => {
    const matchesSearch = conflict.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conflict.conflictingPolicies.some(p => p.policyName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSeverity = severityFilter === 'all' || conflict.severity === severityFilter
    const matchesType = typeFilter === 'all' || conflict.type === typeFilter
    
    return matchesSearch && matchesSeverity && matchesType
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    setPolicies((policies) => {
      const oldIndex = policies.findIndex((policy) => policy.id === active.id)
      const newIndex = policies.findIndex((policy) => policy.id === over.id)

      const newPolicies = arrayMove(policies, oldIndex, newIndex)
      
      // Update priorities based on new order
      return newPolicies.map((policy, index) => ({
        ...policy,
        priority: 100 - (index * 5)
      }))
    })
  }

  const handleResolveConflict = async (conflictId: string, resolution: 'auto' | 'manual') => {
    setIsResolving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (resolution === 'auto') {
      setConflicts(prev => prev.filter(c => c.id !== conflictId))
    }
    
    setIsResolving(false)
  }

  const conflictingPolicyIds = new Set(
    conflicts.flatMap(conflict => conflict.conflictingPolicies.map(p => p.policyId))
  )

  const conflictStats = {
    total: conflicts.length,
    critical: conflicts.filter(c => c.severity === 'critical').length,
    high: conflicts.filter(c => c.severity === 'high').length,
    medium: conflicts.filter(c => c.severity === 'medium').length,
    low: conflicts.filter(c => c.severity === 'low').length,
    autoResolvable: conflicts.filter(c => c.autoResolvable).length
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflictStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <ShieldX className="h-4 w-4 text-red-500" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conflictStats.critical}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              High
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{conflictStats.high}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Medium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{conflictStats.medium}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500" />
              Low
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{conflictStats.low}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Auto Fix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conflictStats.autoResolvable}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conflicts List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Policy Conflicts
              </CardTitle>
              <CardDescription>
                Resolve conflicting policies to ensure proper access control
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search conflicts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="contradiction">Contradiction</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="overlap">Overlap</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-9">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conflicts */}
          <div className="space-y-3">
            {filteredConflicts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No conflicts found</p>
                    <p className="text-sm">All policies are properly configured</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredConflicts.map((conflict) => (
                <ConflictCard
                  key={conflict.id}
                  conflict={conflict}
                  onResolve={handleResolveConflict}
                />
              ))
            )}
          </div>
        </div>

        {/* Policy Priority Manager */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policy Priority Order
              </CardTitle>
              <CardDescription>
                Drag policies to reorder their priority. Higher priority policies override lower ones.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={policies} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {policies.map((policy) => (
                      <SortablePolicy
                        key={policy.id}
                        policy={policy}
                        isConflicting={conflictingPolicyIds.has(policy.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}