'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Activity,
  Search,
  MoreHorizontal,
  RefreshCw,
  Power,
  Trash2,
  Eye,
  Settings,
  Database,
  Server,
  Shield,
  MessageSquare,
  Layers,
  Archive,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { ServiceHealth, ServiceType, ServiceStatus, HealthIncident } from '@/types/health'
import toast from 'react-hot-toast'

interface ServicesMonitoringProps {
  services: ServiceHealth[]
  loading: boolean
  showUnhealthyOnly: boolean
  onToggleFilter: (show: boolean) => void
}

const getServiceIcon = (type: ServiceType) => {
  switch (type) {
    case 'api': return <Server className="h-4 w-4" />
    case 'database': return <Database className="h-4 w-4" />
    case 'redis': return <Archive className="h-4 w-4" />
    case 'keycloak': return <Shield className="h-4 w-4" />
    case 'notification': return <MessageSquare className="h-4 w-4" />
    case 'queue': return <Layers className="h-4 w-4" />
    case 'worker': return <Activity className="h-4 w-4" />
    default: return <Server className="h-4 w-4" />
  }
}

const getStatusIcon = (status: ServiceStatus) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

const getStatusBadge = (status: ServiceStatus) => {
  const variants = {
    healthy: 'default',
    warning: 'secondary',
    critical: 'destructive',
    unknown: 'outline'
  } as const

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  )
}

const formatLastCheck = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return time.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

interface ServiceDetailProps {
  service: ServiceHealth
  onClose: () => void
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onClose }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleServiceAction = async (action: string) => {
    setActionLoading(action)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      switch (action) {
        case 'restart':
          toast.success(`${service.name} restarted successfully`)
          break
        case 'clear_cache':
          toast.success(`${service.name} cache cleared`)
          break
        case 'health_check':
          toast.success(`Health check completed for ${service.name}`)
          break
      }
    } catch (error) {
      toast.error(`Failed to ${action} ${service.name}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Mock dependency data
  const dependencies = service.dependencies.map(depId => ({
    id: depId,
    name: depId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    status: Math.random() > 0.8 ? 'warning' : 'healthy' as ServiceStatus
  }))

  // Mock incident history
  const recentIncidents: HealthIncident[] = service.lastIncident ? [{
    id: service.lastIncident.id,
    serviceId: service.id,
    serviceName: service.name,
    title: `Service Degradation`,
    description: `${service.name} experienced performance issues`,
    severity: service.lastIncident.impact,
    status: 'resolved' as const,
    startedAt: service.lastIncident.timestamp,
    resolvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duration: service.lastIncident.duration,
    impact: {
      affectedServices: [service.id],
      userImpact: 'moderate' as const,
      estimatedUsers: 150
    },
    timeline: []
  }] : []

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 border rounded-lg">
          {getServiceIcon(service.type)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Type: {service.type}</span>
            {service.version && (
              <>
                <span>•</span>
                <span>Version: {service.version}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(service.status)}
          {getStatusBadge(service.status)}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {service.uptime.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">Uptime (7d)</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {service.avgLatency}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Latency</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                service.errorRate > 1 ? 'text-red-600' : 
                service.errorRate > 0.5 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {service.errorRate.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">Error Rate</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                service.healthScore >= 95 ? 'text-green-600' : 
                service.healthScore >= 85 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {service.healthScore}/100
              </div>
              <div className="text-xs text-muted-foreground">Health Score</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(service.metrics).map(([key, metric]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{metric.value.toFixed(1)}{metric.unit}</span>
                    {metric.threshold && (
                      <Badge 
                        variant={
                          metric.value >= metric.threshold.critical ? 'destructive' :
                          metric.value >= metric.threshold.warning ? 'secondary' : 'default'
                        }
                        className="text-xs"
                      >
                        {metric.value >= metric.threshold.critical ? 'Critical' :
                         metric.value >= metric.threshold.warning ? 'Warning' : 'Good'}
                      </Badge>
                    )}
                  </div>
                </div>
                {metric.threshold && (
                  <Progress 
                    value={(metric.value / metric.threshold.critical) * 100} 
                    className="h-2"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dependencies</CardTitle>
            <CardDescription>
              Services that this service depends on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dependencies.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(dep.status)}
                    <span className="font-medium">{dep.name}</span>
                  </div>
                  {getStatusBadge(dep.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Incidents */}
      {recentIncidents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{incident.title}</h4>
                    <Badge variant="outline">{incident.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Duration: {incident.duration}min</span>
                    <span>Impact: {incident.impact.userImpact}</span>
                    <span>Status: {incident.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Actions</CardTitle>
          <CardDescription>
            Administrative actions for this service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleServiceAction('health_check')}
              disabled={actionLoading === 'health_check'}
            >
              {actionLoading === 'health_check' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Health Check
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleServiceAction('clear_cache')}
              disabled={actionLoading === 'clear_cache'}
            >
              {actionLoading === 'clear_cache' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Cache
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleServiceAction('restart')}
              disabled={actionLoading === 'restart'}
              className="text-red-600 hover:text-red-700"
            >
              {actionLoading === 'restart' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              Restart Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ServicesMonitoring({
  services,
  loading,
  showUnhealthyOnly,
  onToggleFilter
}: ServicesMonitoringProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null)

  // Filter services based on search and unhealthy filter
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesHealthFilter = showUnhealthyOnly ? 
      service.status !== 'healthy' : true

    return matchesSearch && matchesHealthFilter
  })

  const handleServiceAction = async (serviceId: string, action: string) => {
    try {
      toast.loading(`Performing ${action} on service...`, { id: `${serviceId}-${action}` })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Service ${action} completed successfully`, { 
        id: `${serviceId}-${action}` 
      })
    } catch (error) {
      toast.error(`Failed to ${action} service`, { 
        id: `${serviceId}-${action}` 
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
                </div>
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-80"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="unhealthy-only"
              checked={showUnhealthyOnly}
              onCheckedChange={onToggleFilter}
            />
            <label htmlFor="unhealthy-only" className="text-sm">
              Show unhealthy only
            </label>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filteredServices.length} of {services.length} services
          </div>
        </div>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>
            Real-time health status of all system services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 border rounded">
                        {getServiceIcon(service.type)}
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.type}
                          {service.version && ` v${service.version}`}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      {getStatusBadge(service.status)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {formatLastCheck(service.lastCheck)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {service.avgLatency}ms
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className={`text-sm ${
                      service.errorRate > 1 ? 'text-red-600' : 
                      service.errorRate > 0.5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {service.errorRate.toFixed(2)}%
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {service.uptime.toFixed(2)}%
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedService(service)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle>Service Details</SheetTitle>
                            <SheetDescription>
                              Detailed health metrics and controls for {selectedService?.name}
                            </SheetDescription>
                          </SheetHeader>
                          {selectedService && (
                            <div className="mt-6">
                              <ServiceDetail
                                service={selectedService}
                                onClose={() => setSelectedService(null)}
                              />
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleServiceAction(service.id, 'health_check')}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Health Check
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleServiceAction(service.id, 'clear_cache')}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Cache
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleServiceAction(service.id, 'restart')}
                            className="text-red-600"
                          >
                            <Power className="h-4 w-4 mr-2" />
                            Restart
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No services found</p>
              <p className="text-sm">
                {searchTerm ? 
                  'Try adjusting your search criteria' : 
                  'No services match the current filters'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}