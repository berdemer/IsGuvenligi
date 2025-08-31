'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Power,
  Play,
  Gavel
} from 'lucide-react'
import { PolicyAuditLog } from '@/types/access-policy'
import { DateRange } from "react-day-picker"
import { useTranslations } from 'next-intl'

// Mock audit log data
const generateMockAuditLogs = (): PolicyAuditLog[] => [
  {
    id: 'audit-1',
    timestamp: '2024-01-15T14:30:25Z',
    action: 'create',
    policyId: 'pol-1',
    policyName: 'Admin Full Access',
    actorId: 'user-1',
    actorName: 'John Smith',
    actorType: 'user',
    details: {
      changes: {
        name: { from: null, to: 'Admin Full Access' },
        type: { from: null, to: 'allow' },
        priority: { from: null, to: 100 }
      },
      metadata: {
        reason: 'Initial admin policy setup',
        approvedBy: 'system-admin'
      }
    },
    context: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      requestId: 'req-12345',
      correlationId: 'corr-abc123'
    }
  },
  {
    id: 'audit-2',
    timestamp: '2024-01-15T13:45:12Z',
    action: 'update',
    policyId: 'pol-2',
    policyName: 'HR Data Access',
    actorId: 'user-4',
    actorName: 'Lisa Brown',
    actorType: 'user',
    details: {
      changes: {
        priority: { from: 85, to: 90 },
        description: { 
          from: 'HR managers can access HR database', 
          to: 'HR managers and directors can access HR database with full permissions'
        }
      },
      metadata: {
        reason: 'Expanded access for HR directors',
        ticketId: 'TICK-5678'
      }
    },
    context: {
      ipAddress: '10.0.1.50',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      requestId: 'req-12346',
      correlationId: 'corr-def456'
    }
  },
  {
    id: 'audit-3',
    timestamp: '2024-01-15T12:20:45Z',
    action: 'enforce',
    policyId: 'pol-3',
    policyName: 'Finance Restrictions',
    actorId: 'system',
    actorName: 'Policy Engine',
    actorType: 'system',
    details: {
      enforcement: {
        resourceId: 'res-2',
        userId: 'user-5',
        granted: false,
        reason: 'User role "employee" is denied access to Finance API by policy'
      }
    },
    context: {
      ipAddress: '172.16.0.25',
      userAgent: 'Internal-Service/1.0',
      requestId: 'req-12347',
      correlationId: 'corr-ghi789'
    }
  },
  {
    id: 'audit-4',
    timestamp: '2024-01-15T11:15:30Z',
    action: 'simulate',
    policyId: null,
    policyName: null,
    actorId: 'user-2',
    actorName: 'Sarah Johnson',
    actorType: 'user',
    details: {
      simulation: {
        id: 'sim-test-1',
        userId: 'user-3',
        resourceId: 'res-1',
        requestedAccess: ['read', 'write'],
        result: {
          granted: true,
          effectiveAccess: ['read', 'write'],
          deniedAccess: [],
          appliedPolicies: [
            {
              policyId: 'pol-2',
              policyName: 'HR Data Access',
              effect: 'allow',
              priority: 90,
              matchedConditions: []
            }
          ]
        },
        simulationContext: {
          timestamp: '2024-01-15T11:15:30Z',
          userAttributes: { role: 'developer', department: 'Engineering' },
          resourceAttributes: { name: 'HR Database', type: 'database' },
          requestAttributes: {}
        }
      }
    },
    context: {
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      requestId: 'req-12348'
    }
  },
  {
    id: 'audit-5',
    timestamp: '2024-01-15T10:30:15Z',
    action: 'disable',
    policyId: 'pol-4',
    policyName: 'Temporary Access Policy',
    actorId: 'user-1',
    actorName: 'John Smith',
    actorType: 'user',
    details: {
      changes: {
        status: { from: 'active', to: 'disabled' }
      },
      metadata: {
        reason: 'Temporary access period expired',
        scheduledBy: 'system'
      }
    },
    context: {
      ipAddress: '192.168.1.100',
      userAgent: 'Internal-Scheduler/2.1',
      requestId: 'req-12349'
    }
  },
  {
    id: 'audit-6',
    timestamp: '2024-01-15T09:45:20Z',
    action: 'delete',
    policyId: 'pol-5',
    policyName: 'Deprecated API Access',
    actorId: 'user-1',
    actorName: 'John Smith',
    actorType: 'user',
    details: {
      changes: {
        entire_policy: {
          from: {
            name: 'Deprecated API Access',
            type: 'deny',
            priority: 10,
            subjects: [{ type: 'everyone', identifiers: ['*'] }]
          },
          to: null
        }
      },
      metadata: {
        reason: 'API endpoint removed - policy no longer needed',
        backupId: 'backup-pol-5-20240115'
      }
    },
    context: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      requestId: 'req-12350'
    }
  }
]

const ActionIcon = ({ action }: { action: PolicyAuditLog['action'] }) => {
  switch (action) {
    case 'create':
      return <Plus className="h-4 w-4 text-green-600" />
    case 'update':
      return <Edit className="h-4 w-4 text-blue-600" />
    case 'delete':
      return <Trash2 className="h-4 w-4 text-red-600" />
    case 'enable':
      return <Power className="h-4 w-4 text-green-600" />
    case 'disable':
      return <Power className="h-4 w-4 text-gray-600" />
    case 'simulate':
      return <Play className="h-4 w-4 text-purple-600" />
    case 'enforce':
      return <Gavel className="h-4 w-4 text-orange-600" />
    default:
      return <Activity className="h-4 w-4 text-gray-600" />
  }
}

const ActionBadge = ({ action }: { action: PolicyAuditLog['action'] }) => {
  const variants = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    enable: 'bg-green-100 text-green-800',
    disable: 'bg-gray-100 text-gray-800',
    simulate: 'bg-purple-100 text-purple-800',
    enforce: 'bg-orange-100 text-orange-800'
  }

  return (
    <Badge className={variants[action]}>
      <ActionIcon action={action} />
      <span className="ml-1 capitalize">{action}</span>
    </Badge>
  )
}

const ActorIcon = ({ actorType }: { actorType: PolicyAuditLog['actorType'] }) => {
  switch (actorType) {
    case 'user':
      return <User className="h-4 w-4 text-blue-500" />
    case 'system':
      return <Shield className="h-4 w-4 text-gray-500" />
    case 'api':
      return <Activity className="h-4 w-4 text-green-500" />
    default:
      return <User className="h-4 w-4 text-gray-500" />
  }
}

interface AuditLogDetailProps {
  log: PolicyAuditLog
}

const AuditLogDetail: React.FC<AuditLogDetailProps> = ({ log }) => {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-sm mb-2">Action Details</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Action:</strong> <ActionBadge action={log.action} /></div>
            <div><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</div>
            {log.policyId && (
              <>
                <div><strong>Policy ID:</strong> <code className="bg-gray-100 px-1 rounded">{log.policyId}</code></div>
                <div><strong>Policy Name:</strong> {log.policyName}</div>
              </>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-2">Actor Information</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <strong>Actor:</strong> 
              <ActorIcon actorType={log.actorType} />
              {log.actorName}
            </div>
            <div><strong>Actor ID:</strong> <code className="bg-gray-100 px-1 rounded">{log.actorId}</code></div>
            <div><strong>Actor Type:</strong> <Badge variant="outline">{log.actorType}</Badge></div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Changes */}
      {log.details.changes && (
        <div>
          <h4 className="font-medium text-sm mb-2">Changes Made</h4>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <pre className="whitespace-pre-wrap">{JSON.stringify(log.details.changes, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Enforcement Details */}
      {log.details.enforcement && (
        <div>
          <h4 className="font-medium text-sm mb-2">Enforcement Details</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Resource:</strong> {log.details.enforcement.resourceId}</div>
            <div><strong>User:</strong> {log.details.enforcement.userId}</div>
            <div className="flex items-center gap-2">
              <strong>Result:</strong>
              {log.details.enforcement.granted ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Granted
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Denied
                </Badge>
              )}
            </div>
            <div><strong>Reason:</strong> {log.details.enforcement.reason}</div>
          </div>
        </div>
      )}

      {/* Simulation Details */}
      {log.details.simulation && (
        <div>
          <h4 className="font-medium text-sm mb-2">Simulation Details</h4>
          <div className="bg-purple-50 rounded p-3 text-sm space-y-2">
            <div><strong>Simulation ID:</strong> {log.details.simulation.id}</div>
            <div><strong>Test User:</strong> {log.details.simulation.userId}</div>
            <div><strong>Test Resource:</strong> {log.details.simulation.resourceId}</div>
            <div><strong>Requested Access:</strong> {log.details.simulation.requestedAccess.join(', ')}</div>
            <div className="flex items-center gap-2">
              <strong>Result:</strong>
              {log.details.simulation.result.granted ? (
                <Badge className="bg-green-100 text-green-800">Access Granted</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Access Denied</Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      {log.details.metadata && (
        <div>
          <h4 className="font-medium text-sm mb-2">Additional Metadata</h4>
          <div className="bg-blue-50 rounded p-3 text-sm">
            <pre className="whitespace-pre-wrap">{JSON.stringify(log.details.metadata, null, 2)}</pre>
          </div>
        </div>
      )}

      <Separator />

      {/* Context */}
      <div>
        <h4 className="font-medium text-sm mb-2">Request Context</h4>
        <div className="space-y-1 text-sm">
          {log.context.ipAddress && (
            <div><strong>IP Address:</strong> <code className="bg-gray-100 px-1 rounded">{log.context.ipAddress}</code></div>
          )}
          {log.context.userAgent && (
            <div><strong>User Agent:</strong> <span className="text-xs break-all">{log.context.userAgent}</span></div>
          )}
          {log.context.requestId && (
            <div><strong>Request ID:</strong> <code className="bg-gray-100 px-1 rounded">{log.context.requestId}</code></div>
          )}
          {log.context.correlationId && (
            <div><strong>Correlation ID:</strong> <code className="bg-gray-100 px-1 rounded">{log.context.correlationId}</code></div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PolicyAuditLog() {
  const [auditLogs, setAuditLogs] = useState<PolicyAuditLog[]>(generateMockAuditLogs())
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [actorFilter, setActorFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedLog, setSelectedLog] = useState<PolicyAuditLog | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const t = useTranslations('policies.policyAuditLog')

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    const matchesActor = actorFilter === 'all' || log.actorType === actorFilter
    
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (new Date(log.timestamp) >= dateRange.from && new Date(log.timestamp) <= dateRange.to)
    
    return matchesSearch && matchesAction && matchesActor && matchesDateRange
  })

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const exportLogs = () => {
    const csvData = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      policy: log.policyName || 'N/A',
      actor: log.actorName,
      actorType: log.actorType,
      ipAddress: log.context.ipAddress || 'N/A'
    }))
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `policy_audit_log_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('title')}
              </CardTitle>
              <CardDescription>
                {t('description')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                {t('actions.exportCsv')}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder={t('filters.actionPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allActions')}</SelectItem>
                <SelectItem value="create">{t('actionTypes.create')}</SelectItem>
                <SelectItem value="update">{t('actionTypes.update')}</SelectItem>
                <SelectItem value="delete">{t('actionTypes.delete')}</SelectItem>
                <SelectItem value="enable">{t('actionTypes.enable')}</SelectItem>
                <SelectItem value="disable">{t('actionTypes.disable')}</SelectItem>
                <SelectItem value="simulate">{t('actionTypes.simulate')}</SelectItem>
                <SelectItem value="enforce">{t('actionTypes.enforce')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder={t('filters.actorPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allActors')}</SelectItem>
                <SelectItem value="user">{t('actorTypes.user')}</SelectItem>
                <SelectItem value="system">{t('actorTypes.system')}</SelectItem>
                <SelectItem value="api">{t('actorTypes.api')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-[280px]">
              <DatePickerWithRange
                value={dateRange}
                onChange={setDateRange}
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.headers.timestamp')}</TableHead>
                <TableHead>{t('table.headers.action')}</TableHead>
                <TableHead>{t('table.headers.policy')}</TableHead>
                <TableHead>{t('table.headers.actor')}</TableHead>
                <TableHead>{t('table.headers.details')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="text-sm">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell>
                    {log.policyName ? (
                      <div>
                        <div className="text-sm font-medium">{log.policyName}</div>
                        <div className="text-xs text-gray-500">{log.policyId}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No policy</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ActorIcon actorType={log.actorType} />
                      <div>
                        <div className="text-sm font-medium">{log.actorName}</div>
                        <div className="text-xs text-gray-500">{log.actorType}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {log.action === 'enforce' && log.details.enforcement && (
                        <div className="flex items-center gap-1">
                          {log.details.enforcement.granted ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs">
                            {log.details.enforcement.granted ? 'Access granted' : 'Access denied'}
                          </span>
                        </div>
                      )}
                      {log.action === 'simulate' && (
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3 text-purple-500" />
                          <span className="text-xs">Policy simulation</span>
                        </div>
                      )}
                      {(log.action === 'create' || log.action === 'update' || log.action === 'delete') && log.details.changes && (
                        <div className="text-xs text-gray-600">
                          {Object.keys(log.details.changes).length} field(s) changed
                        </div>
                      )}
                      {log.context.ipAddress && (
                        <div className="text-xs text-gray-500">
                          from {log.context.ipAddress}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Audit Log Details
                          </DialogTitle>
                          <DialogDescription>
                            Complete details for audit log entry {log.id}
                          </DialogDescription>
                        </DialogHeader>
                        <AuditLogDetail log={log} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {paginatedLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>No audit logs found</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}