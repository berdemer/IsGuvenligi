'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, FileText, Database, Shield, Clock, AlertTriangle } from 'lucide-react'

interface AuditSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

export default function AuditSettings({ onSettingsChange }: AuditSettingsProps) {
  const [config, setConfig] = useState({
    general: {
      enabled: true,
      logLevel: 'INFO',
      retentionDays: 365,
      compression: true,
      encryption: false
    },
    events: {
      userActions: true,
      systemActions: true,
      authEvents: true,
      dataChanges: true,
      configChanges: true,
      errorEvents: true,
      performanceMetrics: false
    },
    storage: {
      location: 'database',
      maxFileSize: '10MB',
      rotationPolicy: 'daily',
      backupEnabled: true
    },
    alerts: {
      failedLogins: true,
      suspiciousActivity: true,
      dataExfiltration: true,
      configurationChanges: true,
      thresholdBreaches: false
    }
  })

  const updateGeneral = (key: string, value: boolean | string | number) => {
    setConfig(prev => ({
      ...prev,
      general: { ...prev.general, [key]: value }
    }))
    onSettingsChange(true)
  }

  const updateEvents = (key: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      events: { ...prev.events, [key]: value }
    }))
    onSettingsChange(true)
  }

  const updateStorage = (key: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      storage: { ...prev.storage, [key]: value }
    }))
    onSettingsChange(true)
  }

  const updateAlerts = (key: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      alerts: { ...prev.alerts, [key]: value }
    }))
    onSettingsChange(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Audit Logging Configuration
            {config.general.enabled ? (
              <Badge variant="default" className="bg-green-500">Enabled</Badge>
            ) : (
              <Badge variant="outline">Disabled</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure comprehensive audit logging for security and compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Record all system activities for security monitoring and compliance
              </p>
            </div>
            <Switch
              checked={config.general.enabled}
              onCheckedChange={(checked) => updateGeneral('enabled', checked)}
            />
          </div>

          {config.general.enabled && (
            <>
              <div className="space-y-4">
                <h4 className="font-medium">General Settings</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logLevel">Log Level</Label>
                    <select
                      id="logLevel"
                      value={config.general.logLevel}
                      onChange={(e) => updateGeneral('logLevel', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="DEBUG">Debug</option>
                      <option value="INFO">Info</option>
                      <option value="WARN">Warning</option>
                      <option value="ERROR">Error</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retentionDays">Retention Period (days)</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      min="30"
                      max="2555"
                      value={config.general.retentionDays}
                      onChange={(e) => updateGeneral('retentionDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compression"
                      checked={config.general.compression}
                      onCheckedChange={(checked) => updateGeneral('compression', checked)}
                    />
                    <Label htmlFor="compression">Enable Compression</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encryption"
                      checked={config.general.encryption}
                      onCheckedChange={(checked) => updateGeneral('encryption', checked)}
                    />
                    <Label htmlFor="encryption">Enable Encryption</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Event Types
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>User Actions</Label>
                      <Switch
                        checked={config.events.userActions}
                        onCheckedChange={(checked) => updateEvents('userActions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>System Actions</Label>
                      <Switch
                        checked={config.events.systemActions}
                        onCheckedChange={(checked) => updateEvents('systemActions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Authentication Events</Label>
                      <Switch
                        checked={config.events.authEvents}
                        onCheckedChange={(checked) => updateEvents('authEvents', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Data Changes</Label>
                      <Switch
                        checked={config.events.dataChanges}
                        onCheckedChange={(checked) => updateEvents('dataChanges', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Configuration Changes</Label>
                      <Switch
                        checked={config.events.configChanges}
                        onCheckedChange={(checked) => updateEvents('configChanges', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Error Events</Label>
                      <Switch
                        checked={config.events.errorEvents}
                        onCheckedChange={(checked) => updateEvents('errorEvents', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Performance Metrics</Label>
                      <Switch
                        checked={config.events.performanceMetrics}
                        onCheckedChange={(checked) => updateEvents('performanceMetrics', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Storage Configuration
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Storage Location</Label>
                    <select
                      id="location"
                      value={config.storage.location}
                      onChange={(e) => updateStorage('location', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="database">Database</option>
                      <option value="file">File System</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size</Label>
                    <Input
                      id="maxFileSize"
                      value={config.storage.maxFileSize}
                      onChange={(e) => updateStorage('maxFileSize', e.target.value)}
                      placeholder="10MB"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rotationPolicy">Rotation Policy</Label>
                    <select
                      id="rotationPolicy"
                      value={config.storage.rotationPolicy}
                      onChange={(e) => updateStorage('rotationPolicy', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Backup</Label>
                    <Switch
                      checked={config.storage.backupEnabled}
                      onCheckedChange={(checked) => updateStorage('backupEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Security Alerts
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Failed Login Attempts</Label>
                      <Switch
                        checked={config.alerts.failedLogins}
                        onCheckedChange={(checked) => updateAlerts('failedLogins', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Suspicious Activity</Label>
                      <Switch
                        checked={config.alerts.suspiciousActivity}
                        onCheckedChange={(checked) => updateAlerts('suspiciousActivity', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Data Exfiltration</Label>
                      <Switch
                        checked={config.alerts.dataExfiltration}
                        onCheckedChange={(checked) => updateAlerts('dataExfiltration', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Configuration Changes</Label>
                      <Switch
                        checked={config.alerts.configurationChanges}
                        onCheckedChange={(checked) => updateAlerts('configurationChanges', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Threshold Breaches</Label>
                      <Switch
                        checked={config.alerts.thresholdBreaches}
                        onCheckedChange={(checked) => updateAlerts('thresholdBreaches', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}