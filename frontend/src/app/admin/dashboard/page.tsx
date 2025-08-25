'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  TrendingUp,
  Eye,
  UserCheck,
  Bell,
} from 'lucide-react'

// Mock data for dashboard
const stats = [
  {
    title: 'Total Users',
    value: '2,543',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
    description: 'Active users in system',
  },
  {
    title: 'Active Sessions',
    value: '1,247',
    change: '+5%',
    changeType: 'positive' as const,
    icon: Activity,
    description: 'Currently logged in',
  },
  {
    title: 'Security Alerts',
    value: '23',
    change: '-18%',
    changeType: 'negative' as const,
    icon: AlertTriangle,
    description: 'Resolved this week',
  },
  {
    title: 'System Health',
    value: '99.9%',
    change: '+0.1%',
    changeType: 'positive' as const,
    icon: Shield,
    description: 'Uptime this month',
  },
]

const recentActivities = [
  {
    id: 1,
    action: 'User login',
    user: 'john.doe@company.com',
    timestamp: '2 minutes ago',
    type: 'success' as const,
  },
  {
    id: 2,
    action: 'Failed login attempt',
    user: 'suspicious.user@domain.com',
    timestamp: '5 minutes ago',
    type: 'warning' as const,
  },
  {
    id: 3,
    action: 'Role updated',
    user: 'admin@isguvenligi.com',
    timestamp: '10 minutes ago',
    type: 'info' as const,
  },
  {
    id: 4,
    action: 'New user created',
    user: 'hr@company.com',
    timestamp: '15 minutes ago',
    type: 'success' as const,
  },
]

const securityOverview = [
  {
    category: 'Authentication',
    status: 'Good',
    issues: 2,
    description: '2FA enabled for 95% of users',
  },
  {
    category: 'Access Control',
    status: 'Excellent',
    issues: 0,
    description: 'All roles properly configured',
  },
  {
    category: 'Session Management',
    status: 'Good',
    issues: 1,
    description: 'Long-lived sessions detected',
  },
  {
    category: 'Audit Compliance',
    status: 'Excellent',
    issues: 0,
    description: 'All events logged',
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your workplace safety management system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Reports
          </Button>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className={
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="security">Security Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          activity.type === 'success'
                            ? 'default'
                            : activity.type === 'warning'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityOverview.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.category}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.issues > 0 && (
                        <Badge variant="outline">{item.issues} issues</Badge>
                      )}
                      <Badge
                        variant={
                          item.status === 'Excellent'
                            ? 'default'
                            : item.status === 'Good'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>Analytics charts will be implemented here</p>
                  <p className="text-xs">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}