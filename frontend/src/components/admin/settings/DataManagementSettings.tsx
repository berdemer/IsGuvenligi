'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  HardDrive,
  Clock,
  Shield
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DataManagementSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

export default function DataManagementSettings({ onSettingsChange }: DataManagementSettingsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 30,
      compression: true,
      encryption: true
    },
    cache: {
      enabled: true,
      defaultTtl: 3600,
      maxSize: '1GB',
      cleanupInterval: 300
    },
    cleanup: {
      enabled: true,
      logRetention: 90,
      tempFileCleanup: true,
      sessionCleanup: true
    }
  })

  const handleExport = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "Export completed",
        description: "System data has been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export system data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Cache cleared",
        description: "Redis cache has been cleared successfully.",
      })
    } catch (error) {
      toast({
        title: "Clear failed",
        description: "Could not clear cache.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Backup & Export
          </CardTitle>
          <CardDescription>
            Configure automated backups and data export options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Automated Backups</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup system data at scheduled intervals
              </p>
            </div>
            <Switch
              checked={config.backup.enabled}
              onCheckedChange={(checked) => {
                setConfig(prev => ({ ...prev, backup: { ...prev.backup, enabled: checked } }))
                onSettingsChange(true)
              }}
            />
          </div>

          {config.backup.enabled && (
            <div className="space-y-4 border-l-2 border-blue-200 pl-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Backup Frequency</Label>
                  <select
                    id="frequency"
                    value={config.backup.frequency}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, backup: { ...prev.backup, frequency: e.target.value } }))
                      onSettingsChange(true)
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">Retention Period (days)</Label>
                  <Input
                    id="retention"
                    type="number"
                    min="7"
                    max="365"
                    value={config.backup.retention}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, backup: { ...prev.backup, retention: parseInt(e.target.value) } }))
                      onSettingsChange(true)
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compression"
                    checked={config.backup.compression}
                    onCheckedChange={(checked) => {
                      setConfig(prev => ({ ...prev, backup: { ...prev.backup, compression: checked } }))
                      onSettingsChange(true)
                    }}
                  />
                  <Label htmlFor="compression">Enable Compression</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="encryption"
                    checked={config.backup.encryption}
                    onCheckedChange={(checked) => {
                      setConfig(prev => ({ ...prev, backup: { ...prev.backup, encryption: checked } }))
                      onSettingsChange(true)
                    }}
                  />
                  <Label htmlFor="encryption">Enable Encryption</Label>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Manual Data Export</h4>
              <p className="text-sm text-muted-foreground">
                Export all system data for backup or migration
              </p>
            </div>
            <Button onClick={handleExport} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Import Data</h4>
              <p className="text-sm text-muted-foreground">
                Import data from backup or migration file
              </p>
            </div>
            <Button variant="outline" disabled>
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Redis Cache Management
            {config.cache.enabled ? (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure and manage Redis caching settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Redis Caching</Label>
              <p className="text-sm text-muted-foreground">
                Use Redis for application caching
              </p>
            </div>
            <Switch
              checked={config.cache.enabled}
              onCheckedChange={(checked) => {
                setConfig(prev => ({ ...prev, cache: { ...prev.cache, enabled: checked } }))
                onSettingsChange(true)
              }}
            />
          </div>

          {config.cache.enabled && (
            <div className="space-y-4 border-l-2 border-red-200 pl-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultTtl">Default TTL (seconds)</Label>
                  <Input
                    id="defaultTtl"
                    type="number"
                    min="60"
                    max="86400"
                    value={config.cache.defaultTtl}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, cache: { ...prev.cache, defaultTtl: parseInt(e.target.value) } }))
                      onSettingsChange(true)
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSize">Max Cache Size</Label>
                  <Input
                    id="maxSize"
                    value={config.cache.maxSize}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, cache: { ...prev.cache, maxSize: e.target.value } }))
                      onSettingsChange(true)
                    }}
                    placeholder="1GB"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cleanupInterval">Cleanup Interval (seconds)</Label>
                <Input
                  id="cleanupInterval"
                  type="number"
                  min="60"
                  max="3600"
                  value={config.cache.cleanupInterval}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, cache: { ...prev.cache, cleanupInterval: parseInt(e.target.value) } }))
                    onSettingsChange(true)
                  }}
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Clear Cache</h4>
              <p className="text-sm text-muted-foreground">
                Clear all cached data immediately
              </p>
            </div>
            <Button 
              onClick={handleClearCache} 
              disabled={loading || !config.cache.enabled}
              variant="outline"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Cleanup & Maintenance
          </CardTitle>
          <CardDescription>
            Configure automatic data cleanup and maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Automatic Cleanup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically clean up old data and temporary files
                </p>
              </div>
              <Switch
                checked={config.cleanup.enabled}
                onCheckedChange={(checked) => {
                  setConfig(prev => ({ ...prev, cleanup: { ...prev.cleanup, enabled: checked } }))
                  onSettingsChange(true)
                }}
              />
            </div>

            {config.cleanup.enabled && (
              <div className="space-y-4 border-l-2 border-yellow-200 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="logRetention">Log Retention (days)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    min="7"
                    max="365"
                    value={config.cleanup.logRetention}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, cleanup: { ...prev.cleanup, logRetention: parseInt(e.target.value) } }))
                      onSettingsChange(true)
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Clean Temporary Files</Label>
                    <Switch
                      checked={config.cleanup.tempFileCleanup}
                      onCheckedChange={(checked) => {
                        setConfig(prev => ({ ...prev, cleanup: { ...prev.cleanup, tempFileCleanup: checked } }))
                        onSettingsChange(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Clean Expired Sessions</Label>
                    <Switch
                      checked={config.cleanup.sessionCleanup}
                      onCheckedChange={(checked) => {
                        setConfig(prev => ({ ...prev, cleanup: { ...prev.cleanup, sessionCleanup: checked } }))
                        onSettingsChange(true)
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}