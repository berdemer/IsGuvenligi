'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Shield,
  AlertTriangle,
  Users,
  Database,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { PolicyAnalytics, ConflictSeverity } from '@/types/access-policy'

// Mock analytics data
const generateMockAnalytics = (): PolicyAnalytics => ({
  timeRange: {
    from: '2024-01-01T00:00:00Z',
    to: '2024-01-31T23:59:59Z'
  },
  totalPolicies: 47,
  activePolicies: 42,
  conflictingPolicies: 8,
  enforcedResources: 156,
  accessAttempts: {
    total: 15670,
    granted: 14320,
    denied: 1350,
    byResource: [
      { resourceId: 'res-1', resourceName: 'HR Database', attempts: 3240 },
      { resourceId: 'res-2', resourceName: 'Finance API', attempts: 2180 },
      { resourceId: 'res-3', resourceName: 'Admin Panel', attempts: 1890 },
      { resourceId: 'res-4', resourceName: 'Employee Portal', attempts: 4560 },
      { resourceId: 'res-5', resourceName: 'Payroll System', attempts: 1680 },
      { resourceId: 'res-6', resourceName: 'Dev Tools', attempts: 2120 }
    ],
    byUser: [
      { userId: 'user-1', userName: 'John Smith', attempts: 1240 },
      { userId: 'user-2', userName: 'Sarah Johnson', attempts: 980 },
      { userId: 'user-3', userName: 'Mike Chen', attempts: 1560 },
      { userId: 'user-4', userName: 'Lisa Brown', attempts: 890 },
      { userId: 'user-5', userName: 'David Wilson', attempts: 760 }
    ],
    byPolicy: [
      { policyId: 'pol-1', policyName: 'Admin Full Access', enforcements: 2340 },
      { policyId: 'pol-2', policyName: 'HR Data Access', enforcements: 1890 },
      { policyId: 'pol-3', policyName: 'Manager API Access', enforcements: 1560 },
      { policyId: 'pol-4', policyName: 'Employee Portal', enforcements: 3210 },
      { policyId: 'pol-5', policyName: 'Finance Restrictions', enforcements: 890 }
    ]
  },
  accessTrends: [
    { date: '2024-01-01', granted: 420, denied: 35 },
    { date: '2024-01-02', granted: 380, denied: 28 },
    { date: '2024-01-03', granted: 450, denied: 42 },
    { date: '2024-01-04', granted: 520, denied: 38 },
    { date: '2024-01-05', granted: 490, denied: 45 },
    { date: '2024-01-06', granted: 530, denied: 41 },
    { date: '2024-01-07', granted: 470, denied: 36 },
    { date: '2024-01-08', granted: 510, denied: 48 },
    { date: '2024-01-09', granted: 480, denied: 39 },
    { date: '2024-01-10', granted: 540, denied: 52 },
    { date: '2024-01-11', granted: 490, denied: 44 },
    { date: '2024-01-12', granted: 520, denied: 47 },
    { date: '2024-01-13', granted: 460, denied: 41 },
    { date: '2024-01-14', granted: 500, denied: 43 }
  ],
  policyDistribution: [
    { type: 'allow', count: 28, percentage: 66.7 },
    { type: 'deny', count: 9, percentage: 21.4 },
    { type: 'conditional', count: 5, percentage: 11.9 }
  ],
  scopeDistribution: [
    { scope: 'role', count: 18, percentage: 42.9 },
    { scope: 'resource', count: 12, percentage: 28.6 },
    { scope: 'user', count: 6, percentage: 14.3 },
    { scope: 'group', count: 4, percentage: 9.5 },
    { scope: 'global', count: 2, percentage: 4.7 }
  ],
  riskAnalysis: {
    highRiskAccess: 47,
    anomalousAccess: 12,
    privilegedAccess: 134,
    suspiciousPatterns: [
      { pattern: 'Off-hours admin access', count: 15, severity: 'medium' },
      { pattern: 'Multiple failed attempts', count: 8, severity: 'high' },
      { pattern: 'Unusual resource access', count: 12, severity: 'medium' },
      { pattern: 'Cross-department access', count: 6, severity: 'low' }
    ]
  },
  topResources: [
    { resourceId: 'res-4', resourceName: 'Employee Portal', accessCount: 4560, denyCount: 23 },
    { resourceId: 'res-1', resourceName: 'HR Database', accessCount: 3240, denyCount: 156 },
    { resourceId: 'res-2', resourceName: 'Finance API', accessCount: 2180, denyCount: 89 },
    { resourceId: 'res-6', resourceName: 'Dev Tools', accessCount: 2120, denyCount: 45 },
    { resourceId: 'res-3', resourceName: 'Admin Panel', accessCount: 1890, denyCount: 234 }
  ],
  topUsers: [
    { userId: 'user-3', userName: 'Mike Chen', accessCount: 1560, denyCount: 12 },
    { userId: 'user-1', userName: 'John Smith', accessCount: 1240, denyCount: 8 },
    { userId: 'user-2', userName: 'Sarah Johnson', accessCount: 980, denyCount: 15 },
    { userId: 'user-4', userName: 'Lisa Brown', accessCount: 890, denyCount: 6 },
    { userId: 'user-5', userName: 'David Wilson', accessCount: 760, denyCount: 18 }
  ]
})

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316']

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  icon: React.ReactNode
  description?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change !== undefined && (
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          {change > 0 ? '+' : ''}{change}% from last month
        </p>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
)

const SeverityBadge = ({ severity }: { severity: ConflictSeverity }) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  return (
    <Badge variant="outline" className={colors[severity]}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  )
}

export default function PolicyAnalytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [analytics] = useState<PolicyAnalytics>(generateMockAnalytics())

  const successRate = (analytics.accessAttempts.granted / analytics.accessAttempts.total * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Access Policy Analytics
              </CardTitle>
              <CardDescription>
                Monitor policy performance and access patterns across your organization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Access Attempts"
          value={analytics.accessAttempts.total.toLocaleString()}
          change={12}
          trend="up"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description="All resource access requests"
        />
        <MetricCard
          title="Success Rate"
          value={`${successRate}%`}
          change={-2.3}
          trend="down"
          icon={<Shield className="h-4 w-4 text-muted-foreground" />}
          description="Granted vs denied access"
        />
        <MetricCard
          title="Active Policies"
          value={analytics.activePolicies}
          change={5}
          trend="up"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description={`${analytics.totalPolicies} total policies`}
        />
        <MetricCard
          title="Conflicts Detected"
          value={analytics.conflictingPolicies}
          change={-15}
          trend="down"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description="Policies with conflicts"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Access Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Access Attempts Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Access Attempts Over Time</CardTitle>
                <CardDescription>Daily granted vs denied access requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.accessTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="granted" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Granted"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="denied" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      name="Denied"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Policy Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Type Distribution</CardTitle>
                <CardDescription>Breakdown of policy types in use</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.policyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.policyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Resources and Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Accessed Resources</CardTitle>
                <CardDescription>Most frequently accessed resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topResources.map((resource, index) => (
                    <div key={resource.resourceId} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{resource.resourceName}</div>
                          <div className="text-xs text-gray-500">
                            {resource.accessCount} accesses • {resource.denyCount} denies
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{resource.accessCount}</div>
                        <div className="text-xs text-red-600">{resource.denyCount} denied</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
                <CardDescription>Users with highest access activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topUsers.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.userName}</div>
                          <div className="text-xs text-gray-500">
                            {user.accessCount} accesses • {user.denyCount} denies
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{user.accessCount}</div>
                        <div className="text-xs text-red-600">{user.denyCount} denied</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Trend Analysis</CardTitle>
              <CardDescription>Detailed view of access patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.accessTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="granted" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Granted Access"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="denied" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Denied Access"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Type Distribution</CardTitle>
                <CardDescription>Distribution of allow, deny, and conditional policies</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.policyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scope Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Scope Distribution</CardTitle>
                <CardDescription>How policies are scoped across the organization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.scopeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ scope, percentage }) => `${scope} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.scopeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="High Risk Access"
              value={analytics.riskAnalysis.highRiskAccess}
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
              description="Access attempts flagged as high risk"
            />
            <MetricCard
              title="Anomalous Access"
              value={analytics.riskAnalysis.anomalousAccess}
              icon={<Activity className="h-4 w-4 text-orange-500" />}
              description="Unusual access patterns detected"
            />
            <MetricCard
              title="Privileged Access"
              value={analytics.riskAnalysis.privilegedAccess}
              icon={<Shield className="h-4 w-4 text-blue-500" />}
              description="High-privilege resource access"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Suspicious Access Patterns</CardTitle>
              <CardDescription>Detected patterns that may indicate security concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.riskAnalysis.suspiciousPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-sm">{pattern.pattern}</div>
                        <div className="text-xs text-gray-500">{pattern.count} occurrences detected</div>
                      </div>
                    </div>
                    <SeverityBadge severity={pattern.severity} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Enforcement Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Enforcement Activity</CardTitle>
                <CardDescription>Most actively enforced policies</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.accessAttempts.byPolicy} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="policyName" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="enforcements" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Access Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Access Volume</CardTitle>
                <CardDescription>Access attempts by resource</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.accessAttempts.byResource}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="resourceName" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attempts" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}