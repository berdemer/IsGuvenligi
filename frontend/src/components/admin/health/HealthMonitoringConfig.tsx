'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Save,
  RefreshCw,
  TrendingUp,
  Clock,
  Database
} from 'lucide-react'
import { 
  HealthMonitoringConfig,
  MetricType,
  DEFAULT_HEALTH_CONFIG,
  useHealthMonitoringTranslations,
  getHealthStatus,
  formatMetricValue,
  getMetricIcon,
  validateHealthConfig
} from '@/utils/health-monitoring'
import { useLocale } from '@/i18n/LocaleProvider'

interface HealthMonitoringConfigProps {
  initialConfig?: HealthMonitoringConfig
  onSave?: (config: HealthMonitoringConfig) => void
  onTest?: () => void
  isLoading?: boolean
}

export function HealthMonitoringConfig({ 
  initialConfig, 
  onSave, 
  onTest,
  isLoading = false 
}: HealthMonitoringConfigProps) {
  const t = useHealthMonitoringTranslations()
  const tMonitoring = useTranslations('health.monitoring')
  const { locale } = useLocale()
  
  const [config, setConfig] = useState<HealthMonitoringConfig>(
    initialConfig || DEFAULT_HEALTH_CONFIG
  )
  const [errors, setErrors] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
    }
  }, [initialConfig])

  const handleConfigChange = (updates: Partial<HealthMonitoringConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    setHasChanges(true)
    
    // Validate configuration
    const validation = validateHealthConfig(newConfig)
    setErrors(validation.errors)
  }

  const handleThresholdChange = (
    metric: MetricType, 
    level: 'warning' | 'critical', 
    value: number
  ) => {
    const newThresholds = {
      ...config.thresholds,
      [metric]: {
        ...config.thresholds[metric],
        [level]: value
      }
    }
    handleConfigChange({ thresholds: newThresholds })
  }

  const handleSave = () => {
    if (errors.length === 0 && onSave) {
      onSave(config)
      setHasChanges(false)
    }
  }

  const handleReset = () => {
    setConfig(initialConfig || DEFAULT_HEALTH_CONFIG)
    setHasChanges(false)
    setErrors([])
  }

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-600' : 'text-gray-400'
  }

  const metricTypes: MetricType[] = ['cpu', 'memory', 'disk', 'responseTime']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            {t.title}
          </h2>
          <p className="text-gray-600 mt-1">{t.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.enabled ? 'default' : 'secondary'}>
            {config.enabled ? tMonitoring('enabled') : tMonitoring('disabled')}
          </Badge>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">{tMonitoring('configurationErrors')}</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t.monitoringConfiguration}
            </CardTitle>
            <CardDescription>
              {tMonitoring('basicMonitoringSettings')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Health Monitoring */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  {t.title}
                </Label>
                <p className="text-sm text-gray-500">
                  {t.description}
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(enabled) => handleConfigChange({ enabled })}
              />
            </div>

            <Separator />

            {/* Check Interval */}
            <div className="space-y-2">
              <Label htmlFor="checkInterval" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t.getConfigLabel('checkInterval')}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="checkInterval"
                  type="number"
                  min="5"
                  max="3600"
                  value={config.checkInterval}
                  onChange={(e) => handleConfigChange({ 
                    checkInterval: parseInt(e.target.value) || 30 
                  })}
                  disabled={!config.enabled}
                  className="max-w-[120px]"
                />
                <span className="text-sm text-gray-500">{tMonitoring('seconds')}</span>
              </div>
            </div>

            {/* Data Retention */}
            <div className="space-y-2">
              <Label htmlFor="dataRetention" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {t.getConfigLabel('dataRetention')}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="dataRetention"
                  type="number"
                  min="1"
                  max="365"
                  value={config.dataRetention}
                  onChange={(e) => handleConfigChange({ 
                    dataRetention: parseInt(e.target.value) || 30 
                  })}
                  disabled={!config.enabled}
                  className="max-w-[120px]"
                />
                <span className="text-sm text-gray-500">{tMonitoring('days')}</span>
              </div>
            </div>

            {/* Alerting */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  {t.enableAlerting}
                </Label>
                <p className="text-sm text-gray-500">
                  Send notifications when thresholds are exceeded
                </p>
              </div>
              <Switch
                checked={config.alertingEnabled}
                onCheckedChange={(alertingEnabled) => handleConfigChange({ alertingEnabled })}
                disabled={!config.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Alert Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t.alertThresholds}
            </CardTitle>
            <CardDescription>
              Set warning and critical thresholds for each metric
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {metricTypes.map((metric) => {
              const threshold = config.thresholds[metric]
              const icon = getMetricIcon(metric)
              
              return (
                <div key={metric} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <h4 className="font-medium">{t.getMetricLabel(metric)}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    {/* Warning Threshold */}
                    <div className="space-y-2">
                      <Label className="text-sm text-yellow-600">
                        {t.getThresholdLevelLabel('warning')}:
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={metric === 'responseTime' ? '10000' : '100'}
                          value={threshold.warning}
                          onChange={(e) => handleThresholdChange(
                            metric, 
                            'warning', 
                            parseInt(e.target.value) || 0
                          )}
                          disabled={!config.enabled}
                          className="max-w-[80px]"
                        />
                        <span className="text-sm text-gray-500">
                          {threshold.unit}
                        </span>
                      </div>
                    </div>
                    
                    {/* Critical Threshold */}
                    <div className="space-y-2">
                      <Label className="text-sm text-red-600">
                        {t.getThresholdLevelLabel('critical')}:
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={metric === 'responseTime' ? '30000' : '100'}
                          value={threshold.critical}
                          onChange={(e) => handleThresholdChange(
                            metric, 
                            'critical', 
                            parseInt(e.target.value) || 0
                          )}
                          disabled={!config.enabled}
                          className="max-w-[80px]"
                        />
                        <span className="text-sm text-gray-500">
                          {threshold.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Threshold Preview */}
                  <div className="pl-6 text-xs text-gray-500">
                    Healthy: &lt; {formatMetricValue(threshold.warning, threshold.unit, locale)} • 
                    Warning: {formatMetricValue(threshold.warning, threshold.unit, locale)} - {formatMetricValue(threshold.critical, threshold.unit, locale)} • 
                    Critical: &gt; {formatMetricValue(threshold.critical, threshold.unit, locale)}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved changes
            </Badge>
          )}
          {config.enabled && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Monitoring Active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.reset}
          </Button>
          
          {onTest && (
            <Button 
              variant="outline" 
              onClick={onTest}
              disabled={!config.enabled || isLoading}
            >
              Test Configuration
            </Button>
          )}
          
          <Button 
            onClick={handleSave}
            disabled={errors.length > 0 || !hasChanges || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {t.save}
          </Button>
        </div>
      </div>
    </div>
  )
}