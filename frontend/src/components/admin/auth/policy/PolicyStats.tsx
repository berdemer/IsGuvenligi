"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart, Shield, 
  CheckCircle, XCircle, AlertTriangle, Clock, Users,
  Calendar, Download, RefreshCw
} from "lucide-react"
import { AuthPolicy } from "@/types/auth-policy"

interface PolicyStatsProps {
  policies: AuthPolicy[]
}

type TimeRange = '24h' | '7d' | '30d' | '90d'

export function PolicyStats({ policies }: PolicyStatsProps) {
  const t = useTranslations('policies.policyStats')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [selectedPolicy, setSelectedPolicy] = useState<string>('all')

  const stats = useMemo(() => {
    const totalApplications = policies.reduce((acc, p) => acc + p.stats.appliedCount, 0)
    const totalDenials = policies.reduce((acc, p) => acc + p.stats.deniedCount, 0)
    const totalChallenges = policies.reduce((acc, p) => acc + p.stats.challengedCount, 0)
    const totalErrors = policies.reduce((acc, p) => acc + p.stats.errorCount, 0)

    const successRate = totalApplications > 0 ? ((totalApplications - totalDenials - totalErrors) / totalApplications) * 100 : 0
    const denyRate = totalApplications > 0 ? (totalDenials / totalApplications) * 100 : 0
    const challengeRate = totalApplications > 0 ? (totalChallenges / totalApplications) * 100 : 0
    const errorRate = totalApplications > 0 ? (totalErrors / totalApplications) * 100 : 0

    return {
      totalApplications,
      totalDenials,
      totalChallenges,
      totalErrors,
      successRate,
      denyRate,
      challengeRate,
      errorRate
    }
  }, [policies])

  const policyPerformance = useMemo(() => {
    return policies.map(policy => {
      const total = policy.stats.appliedCount + policy.stats.deniedCount + policy.stats.challengedCount
      const successRate = total > 0 ? ((policy.stats.appliedCount) / total) * 100 : 0
      
      return {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        status: policy.status,
        applications: policy.stats.appliedCount,
        denials: policy.stats.deniedCount,
        challenges: policy.stats.challengedCount,
        errors: policy.stats.errorCount,
        successRate,
        lastApplied: policy.stats.lastApplied
      }
    }).sort((a, b) => b.applications - a.applications)
  }, [policies])

  const handleExportStats = async () => {
    // Mock export functionality
    await new Promise(resolve => setTimeout(resolve, 1000))
    // In real implementation, this would generate and download a report
    console.log("Exporting stats...")
  }

  const handleRefreshStats = async () => {
    // Mock refresh functionality
    await new Promise(resolve => setTimeout(resolve, 500))
    // In real implementation, this would refetch the latest stats
    console.log("Refreshing stats...")
  }

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '24h': return t('timeRanges.last24Hours')
      case '7d': return t('timeRanges.last7Days')
      case '30d': return t('timeRanges.last30Days')
      case '90d': return t('timeRanges.last90Days')
      default: return t('timeRanges.last7Days')
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return t('common.never')
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>{t('title')}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">{t('timeRanges.last24Hours')}</SelectItem>
                  <SelectItem value="7d">{t('timeRanges.last7Days')}</SelectItem>
                  <SelectItem value="30d">{t('timeRanges.last30Days')}</SelectItem>
                  <SelectItem value="90d">{t('timeRanges.last90Days')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefreshStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('buttons.refresh')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportStats}>
                <Download className="h-4 w-4 mr-2" />
                {t('buttons.export')}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('description', { timeRange: getTimeRangeLabel(timeRange).toLowerCase() })}
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="performance">{t('tabs.performance')}</TabsTrigger>
          <TabsTrigger value="trends">{t('tabs.trends')}</TabsTrigger>
          <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{formatNumber(stats.totalApplications)}</p>
                    <p className="text-xs text-muted-foreground">{t('metrics.totalApplications')}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+12.5%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{t('metrics.successRate')}</p>
                  </div>
                </div>
                <Progress value={stats.successRate} className="mt-2 h-1" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{formatNumber(stats.totalDenials)}</p>
                    <p className="text-xs text-muted-foreground">{t('metrics.denials')}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {t('metrics.percentOfTotal', { percent: stats.denyRate.toFixed(1) })}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{formatNumber(stats.totalChallenges)}</p>
                    <p className="text-xs text-muted-foreground">{t('metrics.challenges')}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {t('metrics.percentOfTotal', { percent: stats.challengeRate.toFixed(1) })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy Type Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>{t('charts.policyTypeDistribution')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['password', 'mfa', 'session', 'provider', 'recovery'].map(type => {
                    const typePolicies = policies.filter(p => p.type === type)
                    const typeApplications = typePolicies.reduce((acc, p) => acc + p.stats.appliedCount, 0)
                    const percentage = stats.totalApplications > 0 ? (typeApplications / stats.totalApplications) * 100 : 0
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-sm ${
                              type === 'password' ? 'bg-blue-500' :
                              type === 'mfa' ? 'bg-green-500' :
                              type === 'session' ? 'bg-purple-500' :
                              type === 'provider' ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm capitalize">{type}</span>
                            <Badge variant="outline" className="text-xs">
                              {typePolicies.length}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-1" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{t('charts.topPerformingPolicies')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policyPerformance.slice(0, 5).map((policy, index) => (
                    <div key={policy.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{policy.name}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {policy.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{t('performance.applications', { count: formatNumber(policy.applications) })}</span>
                          <span>{t('performance.success', { rate: policy.successRate.toFixed(1) })}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          policy.successRate >= 95 ? 'bg-green-100 text-green-800' :
                          policy.successRate >= 85 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {policy.successRate >= 95 ? t('performance.ratings.excellent') :
                           policy.successRate >= 85 ? t('performance.ratings.good') : t('performance.ratings.needsAttention')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('performance.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('performance.description')}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('performance.table.policy')}</TableHead>
                    <TableHead>{t('performance.table.type')}</TableHead>
                    <TableHead>{t('performance.table.status')}</TableHead>
                    <TableHead>{t('performance.table.applications')}</TableHead>
                    <TableHead>{t('performance.table.successRate')}</TableHead>
                    <TableHead>{t('performance.table.denials')}</TableHead>
                    <TableHead>{t('performance.table.challenges')}</TableHead>
                    <TableHead>{t('performance.table.errors')}</TableHead>
                    <TableHead>{t('performance.table.lastApplied')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policyPerformance.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div className="font-medium">{policy.name}</div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {policy.type}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={
                          policy.status === 'active' ? 'default' :
                          policy.status === 'inactive' ? 'secondary' :
                          policy.status === 'draft' ? 'outline' : 'destructive'
                        }>
                          {policy.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{formatNumber(policy.applications)}</span>
                          {policy.applications > 1000 && (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`text-sm font-medium ${
                            policy.successRate >= 95 ? 'text-green-600' :
                            policy.successRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {policy.successRate.toFixed(1)}%
                          </div>
                          <Progress value={policy.successRate} className="h-1 w-16" />
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className={policy.denials > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                          {policy.denials}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className={policy.challenges > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
                          {policy.challenges}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className={policy.errors > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                          {policy.errors}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(policy.lastApplied)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('trends.title')}</h3>
            <p className="text-muted-foreground">
              {t('trends.comingSoon')}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('security.title')}</h3>
            <p className="text-muted-foreground">
              {t('security.comingSoon')}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}