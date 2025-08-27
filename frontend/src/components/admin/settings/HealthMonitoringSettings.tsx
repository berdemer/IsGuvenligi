'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertTriangle, Clock, Database } from 'lucide-react'

interface HealthMonitoringSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

export default function HealthMonitoringSettings({ onSettingsChange }: HealthMonitoringSettingsProps) {
  const [config, setConfig] = useState({
    thresholds: {
      cpuWarning: 70,
      cpuCritical: 90,
      memoryWarning: 80,
      memoryCritical: 95,
      diskWarning: 85,
      diskCritical: 95,
      responseTimeWarning: 1000,
      responseTimeCritical: 5000
    },
    monitoring: {
      enabled: true,
      checkInterval: 30,
      retentionDays: 30,
      alerting: true
    }
  })

  const updateThreshold = (key: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value }
    }))
    onSettingsChange(true)
  }

  const updateMonitoring = (key: string, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      monitoring: { ...prev.monitoring, [key]: value }
    }))
    onSettingsChange(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Monitoring Thresholds
            {config.monitoring.enabled ? (
              <Badge variant="default" className="bg-green-500">Enabled</Badge>
            ) : (
              <Badge variant="outline">Disabled</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure system health monitoring thresholds and alerting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Health Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Monitor system resources and performance metrics
              </p>
            </div>
            <Switch
              checked={config.monitoring.enabled}
              onCheckedChange={(checked) => updateMonitoring('enabled', checked)}
            />
          </div>

          {config.monitoring.enabled && (
            <>
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alert Thresholds
                </h4>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h5 className="font-medium text-sm">CPU Usage (%)</h5>
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="cpuWarning" className="text-xs w-16">Warning:</Label>
                        <Input
                          id="cpuWarning"
                          type="number"
                          min="0"
                          max="100"
                          value={config.thresholds.cpuWarning}
                          onChange={(e) => updateThreshold('cpuWarning', parseInt(e.target.value))}
                          className="h-8"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="cpuCritical" className="text-xs w-16">Critical:</Label>
                        <Input
                          id="cpuCritical"
                          type="number"
                          min="0"
                          max="100"
                          value={config.thresholds.cpuCritical}
                          onChange={(e) => updateThreshold('cpuCritical', parseInt(e.target.value))}
                          className="h-8"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-sm">Memory Usage (%)</h5>
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="memoryWarning" className="text-xs w-16">Warning:</Label>
                        <Input
                          id="memoryWarning"
                          type="number"
                          min="0"
                          max="100"
                          value={config.thresholds.memoryWarning}
                          onChange={(e) => updateThreshold('memoryWarning', parseInt(e.target.value))}
                          className="h-8"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="memoryCritical" className="text-xs w-16">Critical:</Label>
                        <Input
                          id="memoryCritical"
                          type="number"
                          min="0"
                          max="100"
                          value={config.thresholds.memoryCritical}
                          onChange={(e) => updateThreshold('memoryCritical', parseInt(e.target.value))}
                          className="h-8"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-sm">Disk Usage (%)</h5>
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="diskWarning" className="text-xs w-16">Warning:</Label>
                        <Input
                          id="diskWarning"
                          type="number"
                          min="0"
                          max="100"
                          value={config.thresholds.diskWarning}
                          onChange={(e) => updateThreshold('diskWarning', parseInt(e.target.value))}
                          className="h-8"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="diskCritical" className="text-xs w-16">Critical:</Label>
                        <Input
                          id="diskCritical"
                          type="number"
                          min="0"
                          max="100"
                          value={config.thresholds.diskCritical}
                          onChange={(e) => updateThreshold('diskCritical', parseInt(e.target.value))}
                          className="h-8"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-sm">Response Time (ms)</h5>
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="responseWarning" className="text-xs w-16">Warning:</Label>
                        <Input
                          id="responseWarning"
                          type="number"
                          min="0"
                          value={config.thresholds.responseTimeWarning}
                          onChange={(e) => updateThreshold('responseTimeWarning', parseInt(e.target.value))}
                          className="h-8"
                        />
                        <span className="text-xs text-muted-foreground">ms</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="responseCritical" className="text-xs w-16">Critical:</Label>
                        <Input
                          id="responseCritical"
                          type="number"
                          min="0"
                          value={config.thresholds.responseTimeCritical}
                          onChange={(e) => updateThreshold('responseTimeCritical', parseInt(e.target.value))}
                          className="h-8"
                        />
                        <span className="text-xs text-muted-foreground">ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Monitoring Configuration
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkInterval">Check Interval (seconds)</Label>
                    <Input
                      id="checkInterval"
                      type="number"
                      min="10"
                      max="300"
                      value={config.monitoring.checkInterval}
                      onChange={(e) => updateMonitoring('checkInterval', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retentionDays">Data Retention (days)</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      min="7"
                      max="365"
                      value={config.monitoring.retentionDays}
                      onChange={(e) => updateMonitoring('retentionDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Alerting</Label>
                  <Switch
                    checked={config.monitoring.alerting}
                    onCheckedChange={(checked) => updateMonitoring('alerting', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}