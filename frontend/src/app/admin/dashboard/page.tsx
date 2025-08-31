'use client'

import { useTranslations } from 'next-intl'
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
    titleKey: 'totalUsers' as const,
    value: '2,543',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
    descriptionKey: 'stats.activeUsersInSystem' as const,
  },
  {
    titleKey: 'activeSessions' as const,
    value: '1,247',
    change: '+5%',
    changeType: 'positive' as const,
    icon: Activity,
    descriptionKey: 'stats.currentlyLoggedIn' as const,
  },
  {
    titleKey: 'securityAlerts' as const,
    value: '23',
    change: '-18%',
    changeType: 'negative' as const,
    icon: AlertTriangle,
    descriptionKey: 'stats.resolvedThisWeek' as const,
  },
  {
    titleKey: 'systemHealth' as const,
    value: '99.9%',
    change: '+0.1%',
    changeType: 'positive' as const,
    icon: Shield,
    descriptionKey: 'stats.uptimeThisMonth' as const,
  },
]

const recentActivities = [
  {
    id: 1,
    actionKey: 'activities.userLogin' as const,
    user: 'john.doe@company.com',
    timestamp: '2 minutes ago',
    type: 'success' as const,
  },
  {
    id: 2,
    actionKey: 'activities.failedLoginAttempt' as const,
    user: 'suspicious.user@domain.com',
    timestamp: '5 minutes ago',
    type: 'warning' as const,
  },
  {
    id: 3,
    actionKey: 'activities.roleUpdated' as const,
    user: 'admin@isguvenligi.com',
    timestamp: '10 minutes ago',
    type: 'info' as const,
  },
  {
    id: 4,
    actionKey: 'activities.newUserCreated' as const,
    user: 'hr@company.com',
    timestamp: '15 minutes ago',
    type: 'success' as const,
  },
]

const securityOverview = [
  {
    categoryKey: 'security.authentication' as const,
    statusKey: 'security.good' as const,
    issues: 2,
    descriptionKey: 'security.tfaEnabledFor95Percent' as const,
  },
  {
    categoryKey: 'security.accessControl' as const,
    statusKey: 'security.excellent' as const,
    issues: 0,
    descriptionKey: 'security.allRolesProperlyConfigured' as const,
  },
  {
    categoryKey: 'security.sessionManagement' as const,
    statusKey: 'security.good' as const,
    issues: 1,
    descriptionKey: 'security.longLivedSessionsDetected' as const,
  },
  {
    categoryKey: 'security.auditCompliance' as const,
    statusKey: 'security.excellent' as const,
    issues: 0,
    descriptionKey: 'security.allEventsLogged' as const,
  },
]

export default function AdminDashboard() {
  const t = useTranslations('dashboard')
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('welcomeMessage')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            {t('viewReports')}
          </Button>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            {t('notifications')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.titleKey}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t(stat.titleKey)}</CardTitle>
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
                  <span className="text-muted-foreground">{t('common.fromLastMonth')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(stat.descriptionKey)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">{t('recentActivity')}</TabsTrigger>
          <TabsTrigger value="security">{t('securityOverview')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{t(activity.actionKey)}</p>
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
                        {t(`common.${activity.type}`)}
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
              <CardTitle>{t('securityOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityOverview.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t(item.categoryKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(item.descriptionKey)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.issues > 0 && (
                        <Badge variant="outline">{item.issues} {t('security.issues')}</Badge>
                      )}
                      <Badge
                        variant={
                          item.statusKey === 'security.excellent'
                            ? 'default'
                            : item.statusKey === 'security.good'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {t(item.statusKey)}
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
              <CardTitle>{t('analytics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>{t('common.analyticsChartsWillBeImplemented')}</p>
                  <p className="text-xs">{t('common.integrationWithChartingLibraryNeeded')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}