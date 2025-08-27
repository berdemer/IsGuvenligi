'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Users,
  Activity,
  Puzzle,
  Download,
  Upload,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Key,
  Server,
  Globe,
  FileText,
  Eye,
  Lock,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Import setting components
import GeneralSettings from '@/components/admin/settings/GeneralSettings'
import SecuritySettings from '@/components/admin/settings/SecuritySettings'
import NotificationSettings from '@/components/admin/settings/NotificationSettings'
import AccessPolicySettings from '@/components/admin/settings/AccessPolicySettings'
import HealthMonitoringSettings from '@/components/admin/settings/HealthMonitoringSettings'
import IntegrationSettings from '@/components/admin/settings/IntegrationSettings'
import DataManagementSettings from '@/components/admin/settings/DataManagementSettings'
import AuditSettings from '@/components/admin/settings/AuditSettings'

interface SettingsState {
  activeTab: string
  unsavedChanges: boolean
  lastSaved: string | null
  loading: boolean
}

interface SettingsSummary {
  totalSettings: number
  modifiedSettings: number
  lastBackup: string | null
  systemStatus: 'healthy' | 'warning' | 'error'
  cacheStatus: 'active' | 'inactive' | 'error'
  auditEnabled: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [state, setState] = useState<SettingsState>({
    activeTab: 'general',
    unsavedChanges: false,
    lastSaved: null,
    loading: false
  })

  const [summary, setSummary] = useState<SettingsSummary>({
    totalSettings: 156,
    modifiedSettings: 3,
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    systemStatus: 'healthy',
    cacheStatus: 'active',
    auditEnabled: true
  })

  const handleAutoSave = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setState(prev => ({
        ...prev,
        unsavedChanges: false,
        lastSaved: new Date().toISOString(),
        loading: false
      }))
      
      toast({
        title: "Auto-saved",
        description: "Your changes have been automatically saved.",
      })
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      toast({
        title: "Auto-save failed",
        description: "Could not auto-save changes. Please save manually.",
        variant: "destructive"
      })
    }
  }, [toast])

  // Memoized callback for settings changes
  const handleSettingsChange = useCallback((hasChanges: boolean) => {
    setState(prev => ({ ...prev, unsavedChanges: hasChanges }))
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (state.unsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave()
      }, 30000) // Auto-save after 30 seconds

      return () => clearTimeout(autoSaveTimer)
    }
  }, [state.unsavedChanges, handleAutoSave])

  const handleSave = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setState(prev => ({
        ...prev,
        unsavedChanges: false,
        lastSaved: new Date().toISOString(),
        loading: false
      }))
      
      toast({
        title: "Settings saved",
        description: "All settings have been saved successfully.",
      })
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      toast({
        title: "Save failed",
        description: "Could not save settings. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleReset = () => {
    setState(prev => ({ ...prev, unsavedChanges: false }))
    toast({
      title: "Settings reset",
      description: "All unsaved changes have been discarded.",
    })
  }

  const handleExportSettings = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create and download file
      const settingsData = {
        general: {},
        security: {},
        notifications: {},
        policies: {},
        monitoring: {},
        integrations: {},
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `settings-backup-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setState(prev => ({ ...prev, loading: false }))
      toast({
        title: "Settings exported",
        description: "Settings have been exported successfully.",
      })
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      toast({
        title: "Export failed",
        description: "Could not export settings.",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
      case 'inactive':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Configure system preferences, security, monitoring, and integrations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {state.unsavedChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <Clock className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          
          {state.lastSaved && (
            <span className="text-xs text-muted-foreground">
              Last saved: {new Date(state.lastSaved).toLocaleTimeString()}
            </span>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            disabled={!state.unsavedChanges || state.loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportSettings}
            disabled={state.loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={!state.unsavedChanges || state.loading}
            className="min-w-20"
          >
            {state.loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Settings Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Settings</p>
                <p className="text-2xl font-bold">{summary.totalSettings}</p>
              </div>
              <SettingsIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modified</p>
                <p className="text-2xl font-bold text-orange-600">{summary.modifiedSettings}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(summary.systemStatus)}
                  <p className="text-sm font-medium capitalize">{summary.systemStatus}</p>
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cache Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(summary.cacheStatus)}
                  <p className="text-sm font-medium capitalize">{summary.cacheStatus}</p>
                </div>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs 
        value={state.activeTab} 
        onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Policies</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Puzzle className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings onSettingsChange={handleSettingsChange} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings onSettingsChange={handleSettingsChange} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings onSettingsChange={handleSettingsChange} />
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <AccessPolicySettings onSettingsChange={handleSettingsChange} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <HealthMonitoringSettings onSettingsChange={handleSettingsChange} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationSettings onSettingsChange={handleSettingsChange} />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataManagementSettings onSettingsChange={handleSettingsChange} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditSettings onSettingsChange={handleSettingsChange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}