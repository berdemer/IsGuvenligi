"use client"

import { useState, useMemo } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Search, Filter, MoreHorizontal, Edit, Trash2, Play, Pause, 
  Copy, Download, AlertTriangle, CheckCircle, Clock, XCircle,
  Shield, Key, Timer, Globe, LifeBuoy, TrendingUp, Users, Settings
} from "lucide-react"
import { AuthPolicy, PolicyPermissions, PolicyFilters } from "@/types/auth-policy"
import toast from "react-hot-toast"

interface PolicyListProps {
  policies: AuthPolicy[]
  loading: boolean
  onEdit: (policy: AuthPolicy) => void
  onDelete: (policyId: string) => void
  onActivate: (policyId: string) => void
  permissions: PolicyPermissions
}

const PolicyTypeIcons = {
  password: Key,
  mfa: Shield,
  session: Timer,
  provider: Globe,
  recovery: LifeBuoy
}

export function PolicyList({ 
  policies, 
  loading, 
  onEdit, 
  onDelete, 
  onActivate, 
  permissions 
}: PolicyListProps) {
  const t = useTranslations('common.policies')
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedScope, setSelectedScope] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = selectedType === "all" || policy.type === selectedType
      const matchesStatus = selectedStatus === "all" || policy.status === selectedStatus
      const matchesScope = selectedScope === "all" || policy.scope.type === selectedScope
      
      return matchesSearch && matchesType && matchesStatus && matchesScope
    })
  }, [policies, searchTerm, selectedType, selectedStatus, selectedScope])

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'draft':
        return 'outline'
      case 'archived':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />
      case 'inactive':
        return <Pause className="h-3 w-3" />
      case 'draft':
        return <Clock className="h-3 w-3" />
      case 'archived':
        return <XCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    const Icon = PolicyTypeIcons[type as keyof typeof PolicyTypeIcons]
    return Icon ? <Icon className="h-4 w-4" /> : <Settings className="h-4 w-4" />
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDuplicate = async (policy: AuthPolicy) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success(t('toast.duplicated'))
    } catch (error) {
      toast.error(t('toast.duplicateFailed'))
    }
  }

  const handleExport = async (policyIds?: string[]) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(t('toast.exported'))
    } catch (error) {
      toast.error(t('toast.exportFailed'))
    }
  }

  const handleToggleStatus = async (policy: AuthPolicy) => {
    if (!permissions.canActivate) {
      toast.error(t('toast.noPermission'))
      return
    }

    const newStatus = policy.status === 'active' ? 'inactive' : 'active'
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onActivate(policy.id)
      toast.success(newStatus === 'active' ? t('toast.activated') : t('toast.deactivated'))
    } catch (error) {
      toast.error(newStatus === 'active' ? t('toast.activateFailed') : t('toast.deactivateFailed'))
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedType("all")
    setSelectedStatus("all")
    setSelectedScope("all")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Policies ({filteredPolicies.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('filters')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport()}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="mfa">MFA</SelectItem>
                    <SelectItem value="session">Session</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="recovery">Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scope</label>
                <Select value={selectedScope} onValueChange={setSelectedScope}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  {t('clearFilters')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Policy Table */}
        {filteredPolicies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No policies found</h3>
            <p className="text-muted-foreground">
              {policies.length === 0 
                ? "Create your first authentication policy to get started"
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Rollout</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{policy.name}</p>
                          {policy.conflicts.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{policy.conflicts.length} conflict{policy.conflicts.length > 1 ? 's' : ''}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {policy.description}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(policy.type)}
                        <span className="capitalize">{policy.type}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{policy.scope.type}</span>
                        {policy.scope.targets.length > 0 && policy.scope.type !== 'global' && (
                          <Badge variant="outline" className="text-xs">
                            {policy.scope.targets.length}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getBadgeVariant(policy.status)} className="flex items-center space-x-1">
                        {getStatusIcon(policy.status)}
                        <span className="capitalize">{policy.status}</span>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary">{policy.priority}</Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={policy.rollout.phase === 'full' ? 'default' : 'secondary'}>
                          {policy.rollout.percentage}%
                        </Badge>
                        <p className="text-xs text-muted-foreground capitalize">
                          {policy.rollout.phase}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-sm font-medium">
                            {policy.stats.appliedCount.toLocaleString()}
                          </span>
                        </div>
                        {policy.stats.deniedCount > 0 && (
                          <p className="text-xs text-red-500">
                            {policy.stats.deniedCount} denied
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{formatDate(policy.updatedAt)}</p>
                        <p className="text-xs text-muted-foreground">
                          by {policy.updatedBy}
                        </p>
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
                          {permissions.canEdit && (
                            <DropdownMenuItem onClick={() => onEdit(policy)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => handleDuplicate(policy)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {permissions.canActivate && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(policy)}>
                              {policy.status === 'active' ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {permissions.canDelete && (
                            <DropdownMenuItem 
                              onClick={() => setDeleteConfirmId(policy.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Policy</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this policy? This action cannot be undone and may affect active users.
              </DialogDescription>
            </DialogHeader>
            
            {deleteConfirmId && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Policy: <strong>{policies.find(p => p.id === deleteConfirmId)?.name}</strong>
                  <br />
                  This will immediately stop enforcement of this policy.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteConfirmId) {
                    onDelete(deleteConfirmId)
                    setDeleteConfirmId(null)
                  }
                }}
              >
                Delete Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}