"use client"

import { useState, useMemo, useCallback } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Search, Filter, MoreHorizontal, Edit, Copy, Trash2, 
  Power, PowerOff, Eye, Users, Database, Globe,
  Clock, Shield, AlertTriangle, CheckCircle, XCircle,
  Calendar, User, Tag, Activity, Settings
} from "lucide-react"
import { AccessPolicy, PolicyFilters, PolicyType, PolicyStatus, PolicyScope } from "@/types/access-policy"
import toast from "react-hot-toast"

interface PolicyListProps {
  policies: AccessPolicy[]
  loading?: boolean
  onPolicyUpdate?: (policy: AccessPolicy) => void
  onPolicyDelete?: (policyId: string) => void
  onPolicyClone?: (policy: AccessPolicy) => void
  onPolicyEdit?: (policy: AccessPolicy) => void
}

export function PolicyList({ 
  policies, 
  loading = false,
  onPolicyUpdate,
  onPolicyDelete,
  onPolicyClone,
  onPolicyEdit
}: PolicyListProps) {
  const t = useTranslations('policies.policyList')
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([])
  const [filters, setFilters] = useState<PolicyFilters>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("updatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Filter and sort policies
  const filteredPolicies = useMemo(() => {
    let filtered = policies.filter(policy => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!policy.name.toLowerCase().includes(query) &&
            !policy.description.toLowerCase().includes(query) &&
            !policy.tags.some(tag => tag.toLowerCase().includes(query))) {
          return false
        }
      }

      // Type filter
      if (filters.types && filters.types.length > 0 && !filters.types.includes(policy.type)) {
        return false
      }

      // Status filter
      if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(policy.status)) {
        return false
      }

      // Scope filter
      if (filters.scopes && filters.scopes.length > 0 && !filters.scopes.includes(policy.scope)) {
        return false
      }

      // Priority filter
      if (filters.priorities) {
        if (policy.priority < filters.priorities.min || policy.priority > filters.priorities.max) {
          return false
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some(tag => policy.tags.includes(tag))) {
          return false
        }
      }

      return true
    })

    // Sort policies
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "priority":
          aValue = a.priority
          bValue = b.priority
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "updatedAt":
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [policies, searchQuery, filters, sortBy, sortOrder])

  const handleSelectPolicy = useCallback((policyId: string, selected: boolean) => {
    setSelectedPolicies(prev => 
      selected 
        ? [...prev, policyId]
        : prev.filter(id => id !== policyId)
    )
  }, [])

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedPolicies(selected ? filteredPolicies.map(p => p.id) : [])
  }, [filteredPolicies])

  const handleToggleStatus = useCallback((policy: AccessPolicy) => {
    const newStatus = policy.status === 'active' ? 'disabled' : 'active'
    const updatedPolicy = { ...policy, status: newStatus as PolicyStatus }
    onPolicyUpdate?.(updatedPolicy)
    toast.success(newStatus === 'active' ? t('toast.enabled') : t('toast.disabled'))
  }, [onPolicyUpdate])

  const handleDeletePolicy = useCallback((policyId: string) => {
    onPolicyDelete?.(policyId)
    toast.success(t('toast.deleted'))
  }, [onPolicyDelete])

  const handleClonePolicy = useCallback((policy: AccessPolicy) => {
    onPolicyClone?.(policy)
    toast.success(t('toast.cloned'))
  }, [onPolicyClone])

  const getPolicyTypeColor = (type: PolicyType) => {
    switch (type) {
      case 'allow': return 'bg-green-100 text-green-800 border-green-200'
      case 'deny': return 'bg-red-100 text-red-800 border-red-200'
      case 'conditional': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPolicyStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'disabled': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScopeIcon = (scope: PolicyScope) => {
    switch (scope) {
      case 'user': return <User className="h-4 w-4" />
      case 'role': return <Shield className="h-4 w-4" />
      case 'group': return <Users className="h-4 w-4" />
      case 'resource': return <Database className="h-4 w-4" />
      case 'global': return <Globe className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatConditions = (policy: AccessPolicy) => {
    const conditions: string[] = []
    const rule = policy.rules[0]
    if (!rule?.conditions) return t('noConditions')

    if (rule.conditions.time?.enabled) conditions.push(t('conditions.time'))
    if (rule.conditions.geo?.enabled) conditions.push(t('conditions.location')) 
    if (rule.conditions.ip?.enabled) conditions.push(t('conditions.ip'))
    if (rule.conditions.device?.enabled) conditions.push(t('conditions.device'))
    if (rule.conditions.risk?.enabled) conditions.push(t('conditions.risk'))

    return conditions.length > 0 ? conditions.join(", ") : t('noConditions')
  }

  const formatAffectedUsers = (policy: AccessPolicy) => {
    return policy.stats?.affectedUsers || 0
  }

  const formatLastUpdated = (policy: AccessPolicy) => {
    const date = new Date(policy.updatedAt)
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 animate-spin" />
              <span>{t('loading')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Select 
                value={filters.types?.[0] || "all"} 
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  types: value === "all" ? undefined : [value as PolicyType]
                }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.types.all')}</SelectItem>
                  <SelectItem value="allow">{t('filters.types.allow')}</SelectItem>
                  <SelectItem value="deny">{t('filters.types.deny')}</SelectItem>
                  <SelectItem value="conditional">{t('filters.types.conditional')}</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.statuses?.[0] || "all"} 
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  statuses: value === "all" ? undefined : [value as PolicyStatus]
                }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.statuses.all')}</SelectItem>
                  <SelectItem value="active">{t('filters.statuses.active')}</SelectItem>
                  <SelectItem value="disabled">{t('filters.statuses.disabled')}</SelectItem>
                  <SelectItem value="draft">{t('filters.statuses.draft')}</SelectItem>
                  <SelectItem value="expired">{t('filters.statuses.expired')}</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.scopes?.[0] || "all"} 
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  scopes: value === "all" ? undefined : [value as PolicyScope]
                }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.scopes.all')}</SelectItem>
                  <SelectItem value="global">{t('filters.scopes.global')}</SelectItem>
                  <SelectItem value="role">{t('filters.scopes.role')}</SelectItem>
                  <SelectItem value="group">{t('filters.scopes.group')}</SelectItem>
                  <SelectItem value="user">{t('filters.scopes.user')}</SelectItem>
                  <SelectItem value="resource">{t('filters.scopes.resource')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                {t('viewModes.table')}
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                {t('viewModes.cards')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {filteredPolicies.length} of {policies.length} policies
          </span>
          {selectedPolicies.length > 0 && (
            <Badge variant="secondary">
              {selectedPolicies.length} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{t('sorting.sortBy')}</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="updatedAt">Updated</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Policy Table */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPolicies.length === filteredPolicies.length && filteredPolicies.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Rollout</TableHead>
                  <TableHead>Affected Users</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPolicies.includes(policy.id)}
                        onCheckedChange={(checked) => handleSelectPolicy(policy.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{policy.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {policy.description}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          {policy.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {policy.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{policy.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPolicyTypeColor(policy.type)}>
                        {policy.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getScopeIcon(policy.scope)}
                        <span className="capitalize">{policy.scope}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatConditions(policy)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPolicyStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{policy.priority}</Badge>
                        {policy.priority >= 90 && (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-20">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{policy.rollout.percentage}%</span>
                        </div>
                        <Progress value={policy.rollout.percentage} className="h-1" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatAffectedUsers(policy)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatLastUpdated(policy)}
                        <div className="text-xs text-muted-foreground">
                          by {policy.updatedBy.split('@')[0]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onPolicyEdit?.(policy)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClonePolicy(policy)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(policy)}>
                            {policy.status === 'active' ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeletePolicy(policy.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredPolicies.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No policies found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || Object.keys(filters).length > 0
                  ? "Try adjusting your search or filters"
                  : "Create your first access policy to get started"
                }
              </p>
              {!(searchQuery || Object.keys(filters).length > 0) && (
                <Button onClick={() => toast.success("Create policy dialog would open")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Policy
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}