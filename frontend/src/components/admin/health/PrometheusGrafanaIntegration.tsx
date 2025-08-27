'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  BarChart3,
  Activity,
  ExternalLink,
  Settings,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Code,
  Download,
  Upload,
  Database,
  Server,
  Monitor,
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react'
import { PrometheusMetric, PrometheusResponse, GrafanaDashboard, GrafanaPanel } from '@/types/health'
import toast from 'react-hot-toast'

// Mock Prometheus metrics
const generateMockPrometheusMetrics = (): PrometheusMetric[] => [
  {
    metric: { instance: 'api-gateway:8080', job: 'api', service: 'gateway' },
    value: [Date.now() / 1000, '0.95']
  },
  {
    metric: { instance: 'postgres:5432', job: 'database', service: 'postgres' },
    value: [Date.now() / 1000, '0.12']
  },
  {
    metric: { instance: 'redis:6379', job: 'cache', service: 'redis' },
    value: [Date.now() / 1000, '78.5']
  }
]

// Mock Grafana dashboards
const generateMockGrafanaDashboards = (): GrafanaDashboard[] => [
  {
    id: '1',
    uid: 'health-overview',
    title: 'System Health Overview',
    tags: ['health', 'overview'],
    url: 'http://grafana.example.com/d/health-overview',
    embedUrl: 'http://grafana.example.com/d-solo/health-overview',
    panels: [
      {
        id: 1,
        title: 'System Health Score',
        type: 'gauge',
        targets: [
          {
            expr: 'system_health_score',
            legendFormat: 'Health Score'
          }
        ]
      },
      {
        id: 2,
        title: 'Service Response Times',
        type: 'graph',
        targets: [
          {
            expr: 'avg(http_request_duration_seconds) by (service)',
            legendFormat: '{{service}}'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    uid: 'infrastructure-metrics',
    title: 'Infrastructure Metrics',
    tags: ['infrastructure', 'metrics'],
    url: 'http://grafana.example.com/d/infrastructure-metrics',
    embedUrl: 'http://grafana.example.com/d-solo/infrastructure-metrics',
    panels: [
      {
        id: 1,
        title: 'CPU Usage',
        type: 'graph',
        targets: [
          {
            expr: 'cpu_usage_percent',
            legendFormat: 'CPU Usage'
          }
        ]
      },
      {
        id: 2,
        title: 'Memory Usage',
        type: 'graph',
        targets: [
          {
            expr: 'memory_usage_percent',
            legendFormat: 'Memory Usage'
          }
        ]
      }
    ]
  }
]

interface PrometheusQueryProps {
  onQuery: (query: string) => void
}

const PrometheusQuery: React.FC<PrometheusQueryProps> = ({ onQuery }) => {
  const [query, setQuery] = useState('')
  const [recentQueries, setRecentQueries] = useState<string[]>([
    'system_health_score',
    'avg(http_request_duration_seconds) by (service)',
    'cpu_usage_percent',
    'memory_usage_percent',
    'up'
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onQuery(query.trim())
      setRecentQueries(prev => [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 10))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Code className="h-4 w-4" />
          Prometheus Query
        </CardTitle>
        <CardDescription>
          Execute PromQL queries to retrieve metrics data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>PromQL Query</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter PromQL query (e.g., up, cpu_usage_percent)"
              className="font-mono"
            />
          </div>
          <Button type="submit" disabled={!query.trim()}>
            Execute Query
          </Button>
        </form>
        
        <div className="space-y-2">
          <Label>Recent Queries</Label>
          <div className="space-y-1">
            {recentQueries.slice(0, 5).map((recentQuery, index) => (
              <div
                key={index}
                className="text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 font-mono"
                onClick={() => setQuery(recentQuery)}
              >
                {recentQuery}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricsResultsProps {
  metrics: PrometheusMetric[]
  loading: boolean
}

const MetricsResults: React.FC<MetricsResultsProps> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Query Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Query Results</CardTitle>
          <Badge variant="outline">{metrics.length} metrics</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {Object.entries(metric.metric).map(([key, value]) => (
                        <div key={key} className="text-xs text-muted-foreground">
                          {key}="{value}"
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {metric.value[1]}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(parseFloat(metric.value[0]) * 1000).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No metrics data</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface GrafanaDashboardCardProps {
  dashboard: GrafanaDashboard
  onView: (dashboard: GrafanaDashboard) => void
  onEdit: (dashboard: GrafanaDashboard) => void
  onDelete: (id: string) => void
}

const GrafanaDashboardCard: React.FC<GrafanaDashboardCardProps> = ({
  dashboard,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium">{dashboard.title}</h4>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {dashboard.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {dashboard.panels.length} panels
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(dashboard)}>
                <Eye className="h-4 w-4 mr-2" />
                View Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(dashboard.url, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Grafana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(dashboard)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(dashboard.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PrometheusGrafanaIntegration() {
  const [prometheusMetrics, setPrometheusMetrics] = useState<PrometheusMetric[]>([])
  const [grafanaDashboards, setGrafanaDashboards] = useState<GrafanaDashboard[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDashboard, setSelectedDashboard] = useState<GrafanaDashboard | null>(null)
  
  // Configuration states
  const [prometheusUrl, setPrometheusUrl] = useState('http://prometheus.example.com:9090')
  const [grafanaUrl, setGrafanaUrl] = useState('http://grafana.example.com:3000')
  const [prometheusEnabled, setPrometheusEnabled] = useState(true)
  const [grafanaEnabled, setGrafanaEnabled] = useState(true)

  useEffect(() => {
    loadGrafanaDashboards()
  }, [])

  const loadGrafanaDashboards = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setGrafanaDashboards(generateMockGrafanaDashboards())
    } catch (error) {
      toast.error('Failed to load Grafana dashboards')
    }
  }

  const executePrometheusQuery = async (query: string) => {
    setLoading(true)
    try {
      toast.loading('Executing Prometheus query...', { id: 'prometheus-query' })
      
      // Simulate API call to Prometheus
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockMetrics = generateMockPrometheusMetrics()
      setPrometheusMetrics(mockMetrics)
      
      toast.success(`Query executed successfully. Found ${mockMetrics.length} metrics.`, { 
        id: 'prometheus-query' 
      })
    } catch (error) {
      toast.error('Failed to execute Prometheus query', { id: 'prometheus-query' })
    } finally {
      setLoading(false)
    }
  }

  const exportMetrics = async () => {
    try {
      toast.loading('Exporting Prometheus metrics...', { id: 'export-metrics' })
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Metrics exported successfully', { id: 'export-metrics' })
    } catch (error) {
      toast.error('Failed to export metrics', { id: 'export-metrics' })
    }
  }

  const handleViewDashboard = (dashboard: GrafanaDashboard) => {
    setSelectedDashboard(dashboard)
  }

  const handleEditDashboard = (dashboard: GrafanaDashboard) => {
    toast.info(`Editing dashboard: ${dashboard.title}`)
  }

  const handleDeleteDashboard = async (id: string) => {
    try {
      toast.loading('Deleting dashboard...', { id: 'delete-dashboard' })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setGrafanaDashboards(prev => prev.filter(d => d.id !== id))
      toast.success('Dashboard deleted successfully', { id: 'delete-dashboard' })
    } catch (error) {
      toast.error('Failed to delete dashboard', { id: 'delete-dashboard' })
    }
  }

  const testConnection = async (service: 'prometheus' | 'grafana') => {
    try {
      toast.loading(`Testing ${service} connection...`, { id: `test-${service}` })
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const isConnected = Math.random() > 0.2 // 80% success rate for demo
      
      if (isConnected) {
        toast.success(`${service} connection successful`, { id: `test-${service}` })
      } else {
        toast.error(`${service} connection failed`, { id: `test-${service}` })
      }
    } catch (error) {
      toast.error(`Failed to test ${service} connection`, { id: `test-${service}` })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Prometheus & Grafana Integration</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and visualize health metrics using Prometheus and Grafana
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Export Metrics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prometheus" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prometheus">
            <Database className="h-4 w-4 mr-2" />
            Prometheus
          </TabsTrigger>
          <TabsTrigger value="grafana">
            <BarChart3 className="h-4 w-4 mr-2" />
            Grafana
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prometheus" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PrometheusQuery onQuery={executePrometheusQuery} />
            <MetricsResults metrics={prometheusMetrics} loading={loading} />
          </div>
          
          {/* Prometheus Metrics Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metrics Export</CardTitle>
              <CardDescription>
                Export health metrics in Prometheus format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm">
                  <div className="space-y-1">
                    <div># HELP system_health_score Overall system health score</div>
                    <div># TYPE system_health_score gauge</div>
                    <div>system_health_score 94.0</div>
                    <div></div>
                    <div># HELP service_uptime Service uptime percentage</div>
                    <div># TYPE service_uptime gauge</div>
                    <div>service_uptime{`{service="api-gateway",type="api"}`} 99.98</div>
                    <div>service_uptime{`{service="postgres-primary",type="database"}`} 99.99</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Metrics
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportMetrics}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grafana" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Grafana Dashboards</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grafanaDashboards.map((dashboard) => (
              <GrafanaDashboardCard
                key={dashboard.id}
                dashboard={dashboard}
                onView={handleViewDashboard}
                onEdit={handleEditDashboard}
                onDelete={handleDeleteDashboard}
              />
            ))}
          </div>
          
          {/* Dashboard Preview Dialog */}
          <Dialog open={!!selectedDashboard} onOpenChange={() => setSelectedDashboard(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {selectedDashboard?.title}
                </DialogTitle>
                <DialogDescription>
                  Dashboard preview with {selectedDashboard?.panels.length} panels
                </DialogDescription>
              </DialogHeader>
              
              {selectedDashboard && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedDashboard.panels.map((panel) => (
                      <Card key={panel.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">{panel.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-xs">{panel.type} visualization</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Query: {panel.targets[0]?.expr}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedDashboard(null)}>
                  Close
                </Button>
                <Button onClick={() => selectedDashboard && window.open(selectedDashboard.url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Grafana
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Prometheus Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Prometheus Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Prometheus Integration</Label>
                    <p className="text-xs text-muted-foreground">
                      Connect to Prometheus for metrics collection
                    </p>
                  </div>
                  <Switch
                    checked={prometheusEnabled}
                    onCheckedChange={setPrometheusEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Prometheus URL</Label>
                  <Input
                    value={prometheusUrl}
                    onChange={(e) => setPrometheusUrl(e.target.value)}
                    placeholder="http://prometheus.example.com:9090"
                    disabled={!prometheusEnabled}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testConnection('prometheus')}
                    disabled={!prometheusEnabled}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Grafana Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Grafana Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Grafana Integration</Label>
                    <p className="text-xs text-muted-foreground">
                      Connect to Grafana for dashboard management
                    </p>
                  </div>
                  <Switch
                    checked={grafanaEnabled}
                    onCheckedChange={setGrafanaEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Grafana URL</Label>
                  <Input
                    value={grafanaUrl}
                    onChange={(e) => setGrafanaUrl(e.target.value)}
                    placeholder="http://grafana.example.com:3000"
                    disabled={!grafanaEnabled}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testConnection('grafana')}
                    disabled={!grafanaEnabled}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600">Warning</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Scrape Interval</Label>
                  <Input defaultValue="15s" placeholder="15s" />
                </div>
                
                <div className="space-y-2">
                  <Label>Query Timeout</Label>
                  <Input defaultValue="30s" placeholder="30s" />
                </div>
                
                <div className="space-y-2">
                  <Label>Retention Period</Label>
                  <Input defaultValue="30d" placeholder="30d" />
                </div>
                
                <div className="space-y-2">
                  <Label>Max Samples</Label>
                  <Input defaultValue="50000" placeholder="50000" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}