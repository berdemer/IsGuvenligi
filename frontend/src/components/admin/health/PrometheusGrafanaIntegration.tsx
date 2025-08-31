'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
const generateMockGrafanaDashboards = (t: any): GrafanaDashboard[] => [
  {
    id: '1',
    uid: 'health-overview',
    title: t('health.prometheus.mockData.dashboards.systemHealthOverview'),
    tags: [t('health.prometheus.mockData.tags.health'), t('health.prometheus.mockData.tags.overview')],
    url: 'http://grafana.example.com/d/health-overview',
    embedUrl: 'http://grafana.example.com/d-solo/health-overview',
    panels: [
      {
        id: 1,
        title: t('health.prometheus.mockData.panels.systemHealthScore'),
        type: 'gauge',
        targets: [
          {
            expr: 'system_health_score',
            legendFormat: t('health.prometheus.mockData.legends.healthScore')
          }
        ]
      },
      {
        id: 2,
        title: t('health.prometheus.mockData.panels.serviceResponseTimes'),
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
    title: t('health.prometheus.mockData.dashboards.infrastructureMetrics'),
    tags: [t('health.prometheus.mockData.tags.infrastructure'), t('health.prometheus.mockData.tags.metrics')],
    url: 'http://grafana.example.com/d/infrastructure-metrics',
    embedUrl: 'http://grafana.example.com/d-solo/infrastructure-metrics',
    panels: [
      {
        id: 1,
        title: t('health.prometheus.mockData.panels.cpuUsage'),
        type: 'graph',
        targets: [
          {
            expr: 'cpu_usage_percent',
            legendFormat: t('health.prometheus.mockData.legends.cpuUsage')
          }
        ]
      },
      {
        id: 2,
        title: t('health.prometheus.mockData.panels.memoryUsage'),
        type: 'graph',
        targets: [
          {
            expr: 'memory_usage_percent',
            legendFormat: t('health.prometheus.mockData.legends.memoryUsage')
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
  const t = useTranslations('health.prometheus')
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
          {t('query.title')}
        </CardTitle>
        <CardDescription>
          {t('query.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('query.label')}</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('query.placeholder')}
              className="font-mono"
            />
          </div>
          <Button type="submit" disabled={!query.trim()}>
            {t('query.execute')}
          </Button>
        </form>
        
        <div className="space-y-2">
          <Label>{t('query.recentQueries')}</Label>
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
  const t = useTranslations('health.prometheus')
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('results.title')}</CardTitle>
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
          <CardTitle className="text-base">{t('results.title')}</CardTitle>
          <Badge variant="outline">{metrics.length} {t('results.metrics')}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('results.table.metric')}</TableHead>
                <TableHead>{t('results.table.value')}</TableHead>
                <TableHead>{t('results.table.timestamp')}</TableHead>
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
                      hour12: false,
                      timeZone: 'UTC'
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('results.noData')}</p>
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
  const t = useTranslations('health.prometheus')
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
              {dashboard.panels.length} {t('grafana.panels')}
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
                {t('grafana.actions.viewDashboard')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(dashboard.url, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('grafana.actions.openInGrafana')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(dashboard)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('grafana.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(dashboard.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('grafana.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PrometheusGrafanaIntegration() {
  const t = useTranslations('health.prometheus')
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
  }, [t])

  const loadGrafanaDashboards = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setGrafanaDashboards(generateMockGrafanaDashboards(t))
    } catch (error) {
      toast.error(t('toast.loadFailed'))
    }
  }

  const executePrometheusQuery = async (query: string) => {
    setLoading(true)
    try {
      toast.loading(t('toast.executing'), { id: 'prometheus-query' })
      
      // Simulate API call to Prometheus
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockMetrics = generateMockPrometheusMetrics()
      setPrometheusMetrics(mockMetrics)
      
      toast.success(t('toast.querySuccess', { count: mockMetrics.length }), { 
        id: 'prometheus-query' 
      })
    } catch (error) {
      toast.error(t('toast.queryFailed'), { id: 'prometheus-query' })
    } finally {
      setLoading(false)
    }
  }

  const exportMetrics = async () => {
    try {
      toast.loading(t('toast.exporting'), { id: 'export-metrics' })
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(t('toast.exported'), { id: 'export-metrics' })
    } catch (error) {
      toast.error(t('toast.exportFailed'), { id: 'export-metrics' })
    }
  }

  const handleViewDashboard = (dashboard: GrafanaDashboard) => {
    setSelectedDashboard(dashboard)
  }

  const handleEditDashboard = (dashboard: GrafanaDashboard) => {
    toast.success(t('toast.editing', { dashboardTitle: dashboard.title }))
  }

  const handleDeleteDashboard = async (id: string) => {
    try {
      toast.loading(t('toast.deleting'), { id: 'delete-dashboard' })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setGrafanaDashboards(prev => prev.filter(d => d.id !== id))
      toast.success(t('toast.deleted'), { id: 'delete-dashboard' })
    } catch (error) {
      toast.error(t('toast.deleteFailed'), { id: 'delete-dashboard' })
    }
  }

  const testConnection = async (service: 'prometheus' | 'grafana') => {
    try {
      toast.loading(t('toast.testingConnection', { service }), { id: `test-${service}` })
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const isConnected = Math.random() > 0.2 // 80% success rate for demo
      
      if (isConnected) {
        toast.success(t('toast.connectionSuccess', { service }), { id: `test-${service}` })
      } else {
        toast.error(t('toast.connectionFailed', { service }), { id: `test-${service}` })
      }
    } catch (error) {
      toast.error(t('toast.testFailed', { service }), { id: `test-${service}` })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            {t('export.exportMetrics')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prometheus" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prometheus">
            <Database className="h-4 w-4 mr-2" />
            {t('tabs.prometheus')}
          </TabsTrigger>
          <TabsTrigger value="grafana">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('tabs.grafana')}
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            {t('tabs.configuration')}
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
              <CardTitle className="text-base">{t('export.title')}</CardTitle>
              <CardDescription>
                {t('export.description')}
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
                    {t('export.viewFull')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportMetrics}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('export.download')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grafana" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">{t('grafana.dashboards')}</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('grafana.newDashboard')}
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
                  {t('grafana.preview.title')} {selectedDashboard && t('grafana.preview.panels', { panelCount: selectedDashboard.panels.length })}
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
                              <p className="text-xs">{panel.type} {t('grafana.preview.visualization')}</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {t('grafana.preview.query')} {panel.targets[0]?.expr}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedDashboard(null)}>
                  {t('grafana.preview.close')}
                </Button>
                <Button onClick={() => selectedDashboard && window.open(selectedDashboard.url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('grafana.actions.openInGrafana')}
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
{t('configuration.prometheus.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('configuration.prometheus.enable')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('configuration.prometheus.enableDescription')}
                    </p>
                  </div>
                  <Switch
                    checked={prometheusEnabled}
                    onCheckedChange={setPrometheusEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('configuration.prometheus.url')}</Label>
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
                    {t('configuration.testConnection')}
                  </Button>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">{t('configuration.status.connected')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Grafana Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
{t('configuration.grafana.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('configuration.grafana.enable')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('configuration.grafana.enableDescription')}
                    </p>
                  </div>
                  <Switch
                    checked={grafanaEnabled}
                    onCheckedChange={setGrafanaEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('configuration.grafana.url')}</Label>
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
                    {t('configuration.testConnection')}
                  </Button>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600">{t('configuration.status.warning')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('configuration.advanced.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('configuration.advanced.scrapeInterval')}</Label>
                  <Input defaultValue="15s" placeholder="15s" />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('configuration.advanced.queryTimeout')}</Label>
                  <Input defaultValue="30s" placeholder="30s" />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('configuration.advanced.retentionPeriod')}</Label>
                  <Input defaultValue="30d" placeholder="30d" />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('configuration.advanced.maxSamples')}</Label>
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