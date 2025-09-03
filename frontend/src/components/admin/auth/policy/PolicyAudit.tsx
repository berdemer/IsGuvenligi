"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Search, Filter, Download, History, Eye, User, 
  Calendar, AlertCircle, CheckCircle, Edit, Trash2, 
  Play, Pause, TestTube, RotateCcw, RefreshCw,
  FileText, Settings
} from "lucide-react"
import { PolicyAuditLog } from "@/types/auth-policy"
import toast from "react-hot-toast"

const mockAuditLogs: PolicyAuditLog[] = [
  {
    id: "audit_001",
    policyId: "pol_1",
    action: "updated",
    timestamp: "2024-01-15T10:30:00Z",
    userId: "admin_001",
    userEmail: "admin@company.com",
    changes: {
      priority: { old: 80, new: 90 },
      rollout: { old: { percentage: 75 }, new: { percentage: 100 } }
    },
    metadata: {
      policyName: "Strong Password Policy",
      policyType: "password",
      reason: "Increase enforcement priority"
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  {
    id: "audit_002",
    policyId: "pol_2",
    action: "activated",
    timestamp: "2024-01-15T09:15:00Z",
    userId: "security_001",
    userEmail: "security@company.com",
    changes: {
      status: { old: "inactive", new: "active" }
    },
    metadata: {
      policyName: "Executive MFA Requirement",
      policyType: "mfa",
      reason: "Security compliance requirement"
    },
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
  },
  {
    id: "audit_003",
    policyId: "pol_3",
    action: "created",
    timestamp: "2024-01-14T16:45:00Z",
    userId: "policy_001",
    userEmail: "policy@company.com",
    changes: undefined,
    metadata: {
      policyName: "Remote Work Session Policy",
      policyType: "session",
      reason: "New remote work policy"
    },
    ipAddress: "192.168.1.120",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  {
    id: "audit_004",
    policyId: "pol_1",
    action: "simulated",
    timestamp: "2024-01-14T14:20:00Z",
    userId: "admin_001",
    userEmail: "admin@company.com",
    changes: undefined,
    metadata: {
      policyName: "Strong Password Policy",
      policyType: "password",
      simulationResults: {
        testCases: 5,
        passed: 5,
        coverage: 95
      }
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  {
    id: "audit_005",
    policyId: "pol_4",
    action: "deleted",
    timestamp: "2024-01-13T11:30:00Z",
    userId: "admin_001",
    userEmail: "admin@company.com",
    changes: undefined,
    metadata: {
      policyName: "Legacy Authentication Policy",
      policyType: "provider",
      reason: "Policy no longer needed"
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }
]

export function PolicyAudit() {
  const t = useTranslations('common.policy.audit')
  const [auditLogs, setAuditLogs] = useState<PolicyAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<PolicyAuditLog | null>(null)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAuditLogs(mockAuditLogs)
    } catch (error) {
      toast.error(t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.metadata.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = selectedAction === "all" || log.action === selectedAction
    const matchesUser = selectedUser === "all" || log.userEmail === selectedUser
    
    return matchesSearch && matchesAction && matchesUser
  })

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-500" />
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />
      case 'activated':
        return <Play className="h-4 w-4 text-green-500" />
      case 'deactivated':
        return <Pause className="h-4 w-4 text-amber-500" />
      case 'simulated':
        return <TestTube className="h-4 w-4 text-purple-500" />
      case 'rolled_back':
        return <RotateCcw className="h-4 w-4 text-red-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'created':
        return <Badge variant="default" className="bg-green-500">{t('actions.created')}</Badge>
      case 'updated':
        return <Badge variant="default" className="bg-blue-500">{t('actions.updated')}</Badge>
      case 'deleted':
        return <Badge variant="destructive">{t('actions.deleted')}</Badge>
      case 'activated':
        return <Badge variant="default" className="bg-green-500">{t('actions.activated')}</Badge>
      case 'deactivated':
        return <Badge variant="secondary" className="bg-amber-500 text-white">{t('actions.deactivated')}</Badge>
      case 'simulated':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{t('actions.simulated')}</Badge>
      case 'rolled_back':
        return <Badge variant="destructive">{t('actions.rolledBack')}</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
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

  const formatChanges = (changes?: Record<string, { old: any, new: any }>) => {
    if (!changes) return null

    return Object.entries(changes).map(([key, change]) => (
      <div key={key} className="text-xs">
        <span className="font-medium capitalize">{key}:</span>
        <span className="text-red-500 line-through ml-1">{JSON.stringify(change.old)}</span>
        <span className="text-green-500 ml-1">→ {JSON.stringify(change.new)}</span>
      </div>
    ))
  }

  const handleExportLogs = async () => {
    try {
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const csvContent = [
        ['Timestamp', 'Action', 'Policy', 'User', 'IP Address', 'Details'],
        ...filteredLogs.map(log => [
          log.timestamp,
          log.action,
          log.metadata.policyName || '',
          log.userEmail,
          log.ipAddress,
          log.metadata.reason || ''
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `policy-audit-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success(t('messages.exportSuccess'))
    } catch (error) {
      toast.error(t('errors.exportFailed'))
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedAction("all")
    setSelectedUser("all")
  }

  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.userEmail))).sort()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>{t('title')}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('description')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('buttons.filters')}
              </Button>
              <Button variant="outline" size="sm" onClick={loadAuditLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('buttons.refresh')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="h-4 w-4 mr-2" />
                {t('buttons.export')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('filters.action')}</label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allActions')}</SelectItem>
                    <SelectItem value="created">{t('actions.created')}</SelectItem>
                    <SelectItem value="updated">{t('actions.updated')}</SelectItem>
                    <SelectItem value="activated">{t('actions.activated')}</SelectItem>
                    <SelectItem value="deactivated">{t('actions.deactivated')}</SelectItem>
                    <SelectItem value="deleted">{t('actions.deleted')}</SelectItem>
                    <SelectItem value="simulated">{t('actions.simulated')}</SelectItem>
                    <SelectItem value="rolled_back">{t('actions.rolledBack')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('filters.user')}</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allUsers')}</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  {t('buttons.clearFilters')}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('stats.showing', {filtered: filteredLogs.length, total: auditLogs.length})}</span>
            <span>{t('stats.lastUpdated', {date: formatDate(new Date().toISOString())})}</span>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">{t('empty.title')}</h3>
              <p className="text-muted-foreground">
                {auditLogs.length === 0 
                  ? t('empty.noLogs')
                  : t('empty.noResults')
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.timestamp')}</TableHead>
                  <TableHead>{t('table.action')}</TableHead>
                  <TableHead>{t('table.policy')}</TableHead>
                  <TableHead>{t('table.user')}</TableHead>
                  <TableHead>{t('table.changes')}</TableHead>
                  <TableHead>{t('table.ipAddress')}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(log.timestamp)}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{log.metadata.policyName}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.metadata.policyType}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{log.userEmail}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 max-w-xs">
                        {log.changes ? (
                          <div className="space-y-1">
                            {formatChanges(log.changes)}
                          </div>
                        ) : log.metadata.reason ? (
                          <p className="text-sm text-muted-foreground">
                            {log.metadata.reason}
                          </p>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t('table.noChanges')}</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <FileText className="h-5 w-5" />
                              <span>{t('details.title')}</span>
                            </DialogTitle>
                            <DialogDescription>
                              {t('details.description')}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedLog && (
                            <div className="space-y-6">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">{t('details.fields.action')}</Label>
                                  <div className="flex items-center space-x-2">
                                    {getActionIcon(selectedLog.action)}
                                    {getActionBadge(selectedLog.action)}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">{t('details.fields.timestamp')}</Label>
                                  <p className="text-sm">{formatDate(selectedLog.timestamp)}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('details.fields.policy')}</Label>
                                <div className="flex items-center space-x-2">
                                  <span>{selectedLog.metadata.policyName}</span>
                                  <Badge variant="outline" className="capitalize">
                                    {selectedLog.metadata.policyType}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('details.fields.userInfo')}</Label>
                                <div className="grid gap-2 md:grid-cols-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">{t('details.fields.email')}:</span>
                                    <span className="ml-2">{selectedLog.userEmail}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">{t('details.fields.ipAddress')}:</span>
                                    <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                                      {selectedLog.ipAddress}
                                    </code>
                                  </div>
                                </div>
                              </div>
                              
                              {selectedLog.changes && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">{t('details.fields.changesMade')}</Label>
                                  <div className="bg-muted p-3 rounded space-y-2">
                                    {formatChanges(selectedLog.changes)}
                                  </div>
                                </div>
                              )}
                              
                              {selectedLog.metadata.reason && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">{t('details.fields.reason')}</Label>
                                  <p className="text-sm bg-muted p-3 rounded">
                                    {selectedLog.metadata.reason}
                                  </p>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('details.fields.userAgent')}</Label>
                                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                                  {selectedLog.userAgent}
                                </p>
                              </div>
                              
                              {selectedLog.metadata.simulationResults && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">{t('details.fields.simulationResults')}</Label>
                                  <div className="bg-muted p-3 rounded">
                                    <div className="grid gap-2 md:grid-cols-3 text-sm">
                                      <div>{t('details.simulation.testCases')}: {selectedLog.metadata.simulationResults.testCases}</div>
                                      <div>{t('details.simulation.passed')}: {selectedLog.metadata.simulationResults.passed}</div>
                                      <div>{t('details.simulation.coverage')}: {selectedLog.metadata.simulationResults.coverage}%</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Compliance Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('compliance.title')}:</strong> {t('compliance.description')}
        </AlertDescription>
      </Alert>
    </div>
  )
}