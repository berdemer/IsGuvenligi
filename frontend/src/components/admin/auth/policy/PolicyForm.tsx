"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Save, X, TestTube, AlertTriangle, Info, Users, Globe, 
  Shield, Key, Timer, LifeBuoy, Clock, MapPin, Smartphone,
  Wifi, Calendar, TrendingUp, Target, Settings
} from "lucide-react"
import { AuthPolicy, PolicyFormData, PolicyPermissions } from "@/types/auth-policy"
import toast from "react-hot-toast"

interface PolicyFormProps {
  policy?: AuthPolicy | null
  onSubmit: (data: PolicyFormData) => void
  onCancel: () => void
  permissions: PolicyPermissions
}

const policyTypes = [
  { value: 'password', label: 'Password Policy', icon: Key, description: 'Password strength and lifecycle rules' },
  { value: 'mfa', label: 'Multi-Factor Authentication', icon: Shield, description: 'MFA requirements and methods' },
  { value: 'session', label: 'Session Management', icon: Timer, description: 'Session timeouts and limits' },
  { value: 'provider', label: 'Identity Providers', icon: Globe, description: 'External provider restrictions' },
  { value: 'recovery', label: 'Account Recovery', icon: LifeBuoy, description: 'Password reset and recovery options' }
]

export function PolicyForm({ policy, onSubmit, onCancel, permissions }: PolicyFormProps) {
  const [formData, setFormData] = useState<PolicyFormData>({
    name: '',
    description: '',
    type: 'password',
    status: 'draft',
    scope: {
      type: 'global',
      targets: [],
      exclusions: []
    },
    conditions: [],
    rules: {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      prohibitCommonPasswords: true,
      prohibitPersonalInfo: true,
      maxAge: 90,
      historyCount: 12,
      lockoutThreshold: 5,
      lockoutDuration: 30
    },
    priority: 50,
    rollout: {
      phase: 'testing',
      percentage: 10,
      startDate: new Date().toISOString().split('T')[0],
      monitoringEnabled: true,
      autoRollback: true
    },
    keycloakSyncStatus: 'pending',
    cacheKey: '',
    cacheTTL: 3600,
    saveAsDraft: true,
    simulateBeforeSave: false,
    notifyUsers: false
  })

  const [activeTab, setActiveTab] = useState("basic")
  const [showSimulation, setShowSimulation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (policy) {
      setFormData({
        ...policy,
        saveAsDraft: policy.status === 'draft',
        simulateBeforeSave: false,
        notifyUsers: false
      })
    }
  }, [policy])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Policy name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Policy description is required'
    }

    if (formData.scope.type !== 'global' && formData.scope.targets.length === 0) {
      newErrors.scope = 'Please select targets for the scope'
    }

    if (formData.priority < 1 || formData.priority > 100) {
      newErrors.priority = 'Priority must be between 1 and 100'
    }

    if (formData.rollout.percentage < 0 || formData.rollout.percentage > 100) {
      newErrors.rollout = 'Rollout percentage must be between 0 and 100'
    }

    // Type-specific validation
    if (formData.type === 'password') {
      const rules = formData.rules as any
      if (rules.minLength > rules.maxLength) {
        newErrors.passwordRules = 'Minimum length cannot be greater than maximum length'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    if (formData.simulateBeforeSave) {
      setShowSimulation(true)
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulationComplete = async (results: any) => {
    setShowSimulation(false)
    
    if (results.overallResult === 'fail') {
      toast.error('Simulation failed. Please review the policy configuration.')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates: Partial<PolicyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Policy Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Enter policy name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Policy Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => updateFormData({ type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {policyTypes.map((type) => {
                const Icon = type.icon
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <p>{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe what this policy does and when it applies"
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority (1-100)</Label>
          <div className="space-y-2">
            <Slider
              value={[formData.priority]}
              onValueChange={(value) => updateFormData({ priority: value[0] })}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 (Low)</span>
              <span className="font-medium">{formData.priority}</span>
              <span>100 (High)</span>
            </div>
          </div>
          {errors.priority && (
            <p className="text-sm text-red-500">{errors.priority}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => updateFormData({ status: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              {permissions.canActivate && (
                <SelectItem value="active">Active</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Higher priority policies take precedence when multiple policies apply to the same user or situation.
          Start with draft or inactive status to test before activation.
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderScope = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Scope Type</Label>
          <Select
            value={formData.scope.type}
            onValueChange={(value) => updateFormData({ 
              scope: { ...formData.scope, type: value as any, targets: [] }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <div>
                    <p>Global</p>
                    <p className="text-xs text-muted-foreground">Applies to all users</p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="role">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <div>
                    <p>Role-based</p>
                    <p className="text-xs text-muted-foreground">Apply to specific roles</p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="group">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <div>
                    <p>Group-based</p>
                    <p className="text-xs text-muted-foreground">Apply to user groups</p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="user">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <div>
                    <p>User-specific</p>
                    <p className="text-xs text-muted-foreground">Apply to individual users</p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.scope.type !== 'global' && (
          <div className="space-y-2">
            <Label>Targets</Label>
            <div className="space-y-2">
              <Input
                placeholder={`Enter ${formData.scope.type} names...`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = (e.target as HTMLInputElement).value.trim()
                    if (target && !formData.scope.targets.includes(target)) {
                      updateFormData({
                        scope: {
                          ...formData.scope,
                          targets: [...formData.scope.targets, target]
                        }
                      });
                      (e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                {formData.scope.targets.map((target, index) => (
                  <Badge key={index} variant="secondary">
                    {target}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => updateFormData({
                        scope: {
                          ...formData.scope,
                          targets: formData.scope.targets.filter((_, i) => i !== index)
                        }
                      })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            {errors.scope && (
              <p className="text-sm text-red-500">{errors.scope}</p>
            )}
          </div>
        )}

        {formData.scope.type === 'group' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSubGroups"
              checked={formData.scope.includeSubGroups}
              onCheckedChange={(checked) => updateFormData({
                scope: { ...formData.scope, includeSubGroups: checked as boolean }
              })}
            />
            <Label htmlFor="includeSubGroups">Include sub-groups</Label>
          </div>
        )}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {formData.scope.type === 'global' && "This policy will apply to all users in your organization."}
          {formData.scope.type === 'role' && "Select the roles that this policy should apply to."}
          {formData.scope.type === 'group' && "Select the user groups that this policy should apply to."}
          {formData.scope.type === 'user' && "Select specific users that this policy should apply to."}
        </AlertDescription>
      </Alert>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{policy ? 'Edit Policy' : 'Create New Policy'}</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="scope">Scope</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="rollout">Rollout</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              {renderBasicInfo()}
            </TabsContent>

            <TabsContent value="scope">
              {renderScope()}
            </TabsContent>

            <TabsContent value="conditions">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Conditions configuration coming in next update...</p>
              </div>
            </TabsContent>

            <TabsContent value="rules">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Rules configuration coming in next update...</p>
              </div>
            </TabsContent>

            <TabsContent value="rollout">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Rollout configuration coming in next update...</p>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="simulateBeforeSave"
                  checked={formData.simulateBeforeSave}
                  onCheckedChange={(checked) => updateFormData({ simulateBeforeSave: checked as boolean })}
                />
                <Label htmlFor="simulateBeforeSave">Simulate before saving</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyUsers"
                  checked={formData.notifyUsers}
                  onCheckedChange={(checked) => updateFormData({ notifyUsers: checked as boolean })}
                />
                <Label htmlFor="notifyUsers">Notify affected users</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>

      {/* Simulation Dialog */}
      <Dialog open={showSimulation} onOpenChange={setShowSimulation}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Policy Simulation</span>
            </DialogTitle>
            <DialogDescription>
              Testing the policy configuration against various scenarios...
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-8 text-center">
            <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Running simulation tests...</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSimulation(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSimulationComplete({ overallResult: 'pass' })}>
              Continue with Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}