"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Shield, Users, Database, Globe, User, Clock, MapPin, 
  Wifi, Smartphone, AlertTriangle, CheckCircle, XCircle,
  Plus, X, Save, Eye, Play, Settings, Tag, Calendar,
  Activity, Lock, Unlock, Target, Zap
} from "lucide-react"
import { 
  AccessPolicy, 
  PolicyType, 
  PolicyStatus, 
  PolicyScope,
  PolicySubject,
  PolicyResource,
  PolicyRule,
  PolicyConditions,
  PolicyRollout,
  PolicySimulation
} from "@/types/access-policy"
import toast from "react-hot-toast"
import { useTranslations } from "next-intl"

interface PolicyEditorProps {
  policy?: AccessPolicy
  isOpen: boolean
  onClose: () => void
  onSave: (policy: AccessPolicy) => void
  onSimulate?: (simulation: Partial<PolicySimulation>) => void
}

interface PolicyFormData {
  name: string
  description: string
  type: PolicyType
  status: PolicyStatus
  scope: PolicyScope
  subjects: PolicySubject[]
  resources: PolicyResource[]
  rules: PolicyRule[]
  priority: number
  rollout: PolicyRollout
  tags: string[]
  category: string
}

const defaultPolicy: PolicyFormData = {
  name: "",
  description: "",
  type: "allow",
  status: "draft",
  scope: "role",
  subjects: [],
  resources: [],
  rules: [{
    effect: "allow",
    accessLevels: ["read"],
    conditions: {
      time: { enabled: false },
      geo: { enabled: false },
      ip: { enabled: false },
      device: { enabled: false },
      risk: { enabled: false }
    }
  }],
  priority: 50,
  rollout: {
    enabled: false,
    percentage: 100
  },
  tags: [],
  category: ""
}

export function PolicyEditor({ 
  policy, 
  isOpen, 
  onClose, 
  onSave,
  onSimulate 
}: PolicyEditorProps) {
  const [formData, setFormData] = useState<PolicyFormData>(defaultPolicy)
  const [activeTab, setActiveTab] = useState("basic")
  const [simulationUser, setSimulationUser] = useState("")
  const [simulationResource, setSimulationResource] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const t = useTranslations('policies.policyEditor')

  // Load existing policy data
  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name,
        description: policy.description,
        type: policy.type,
        status: policy.status,
        scope: policy.scope,
        subjects: policy.subjects,
        resources: policy.resources,
        rules: policy.rules,
        priority: policy.priority,
        rollout: policy.rollout,
        tags: policy.tags,
        category: policy.category || ""
      })
    } else {
      setFormData(defaultPolicy)
    }
  }, [policy])

  // Form validation
  const validation = useMemo(() => {
    const errors: string[] = []
    
    if (!formData.name.trim()) errors.push(t('validation.nameRequired'))
    if (!formData.description.trim()) errors.push(t('validation.descriptionRequired'))
    if (formData.subjects.length === 0) errors.push(t('validation.subjectsRequired'))
    if (formData.resources.length === 0) errors.push(t('validation.resourcesRequired'))
    if (formData.priority < 1 || formData.priority > 100) errors.push(t('validation.priorityRange'))

    setValidationErrors(errors)
    return errors.length === 0
  }, [formData])

  // Update form data
  const updateFormData = (updates: Partial<PolicyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Add subject
  const addSubject = (type: PolicySubject['type'], identifier: string) => {
    if (!identifier.trim()) return

    const newSubject: PolicySubject = {
      type,
      identifiers: [identifier.trim()],
      attributes: {}
    }

    updateFormData({
      subjects: [...formData.subjects, newSubject]
    })
  }

  // Remove subject
  const removeSubject = (index: number) => {
    updateFormData({
      subjects: formData.subjects.filter((_, i) => i !== index)
    })
  }

  // Add resource
  const addResource = (name: string, type: PolicyResource['type'], path: string = "") => {
    if (!name.trim()) return

    const newResource: PolicyResource = {
      id: `resource-${Date.now()}`,
      name: name.trim(),
      type,
      path: path.trim() || undefined,
      attributes: {}
    }

    updateFormData({
      resources: [...formData.resources, newResource]
    })
  }

  // Remove resource
  const removeResource = (index: number) => {
    updateFormData({
      resources: formData.resources.filter((_, i) => i !== index)
    })
  }

  // Update conditions
  const updateConditions = (conditions: Partial<PolicyConditions>) => {
    const updatedRules = formData.rules.map(rule => ({
      ...rule,
      conditions: {
        ...rule.conditions,
        ...conditions
      }
    }))
    
    updateFormData({ rules: updatedRules })
  }

  // Add tag
  const addTag = (tag: string) => {
    if (!tag.trim() || formData.tags.includes(tag.trim())) return
    updateFormData({
      tags: [...formData.tags, tag.trim()]
    })
  }

  // Remove tag
  const removeTag = (index: number) => {
    updateFormData({
      tags: formData.tags.filter((_, i) => i !== index)
    })
  }

  // Handle save
  const handleSave = () => {
    if (!validation) {
      toast.error(t('toast.fixErrors'))
      return
    }

    const newPolicy: AccessPolicy = {
      id: policy?.id || `policy-${Date.now()}`,
      ...formData,
      version: (policy?.version || 0) + 1,
      createdBy: policy?.createdBy || "current-user",
      updatedBy: "current-user",
      createdAt: policy?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: policy?.stats
    }

    onSave(newPolicy)
    onClose()
    toast.success(t('toast.saved'))
  }

  // Handle simulation
  const handleSimulation = async () => {
    if (!simulationUser.trim() || !simulationResource.trim()) {
      toast.error(t('toast.simulationRequired'))
      return
    }

    setIsSimulating(true)
    try {
      // Mock simulation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockResult = {
        granted: formData.type === "allow",
        effectiveAccess: formData.rules[0].accessLevels,
        appliedPolicies: [{
          policyId: "current-policy",
          policyName: formData.name || "New Policy",
          effect: formData.type,
          priority: formData.priority,
          matchedConditions: []
        }]
      }
      
      setSimulationResult(mockResult)
      onSimulate?.({
        userId: simulationUser,
        resourceId: simulationResource,
        result: mockResult
      })
      
      toast.success(t('toast.simulationCompleted'))
    } catch (error) {
      toast.error(t('toast.simulationFailed'))
    } finally {
      setIsSimulating(false)
    }
  }

  const currentRule = formData.rules[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {policy ? t('title.edit') : t('title.create')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
              <TabsTrigger value="subjects">{t('tabs.subjects')}</TabsTrigger>
              <TabsTrigger value="resources">{t('tabs.resources')}</TabsTrigger>
              <TabsTrigger value="conditions">{t('tabs.conditions')}</TabsTrigger>
              <TabsTrigger value="preview">{t('tabs.preview')}</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('form.labels.policyName')} {t('form.labels.required')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder={t('form.placeholders.policyName')}
                  />
                </div>
                <div>
                  <Label htmlFor="category">{t('form.labels.category')}</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => updateFormData({ category: e.target.value })}
                    placeholder={t('form.placeholders.category')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('form.labels.description')} {t('form.labels.required')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder={t('form.placeholders.description')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t('form.labels.policyType')} {t('form.labels.required')}</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => updateFormData({ type: value as PolicyType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">{t('form.types.allow')}</SelectItem>
                      <SelectItem value="deny">{t('form.types.deny')}</SelectItem>
                      <SelectItem value="conditional">{t('form.types.conditional')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('form.labels.scope')} {t('form.labels.required')}</Label>
                  <Select 
                    value={formData.scope} 
                    onValueChange={(value) => updateFormData({ scope: value as PolicyScope })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => updateFormData({ status: value as PolicyStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Priority: {formData.priority}</Label>
                <Slider
                  value={[formData.priority]}
                  onValueChange={(value) => updateFormData({ priority: value[0] })}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low Priority (1)</span>
                  <span>High Priority (100)</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    placeholder="Add tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add tag..."]') as HTMLInputElement
                      if (input) {
                        addTag(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(index)}
                        className="ml-1 h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Subjects */}
            <TabsContent value="subjects" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Policy Subjects (Who) *</Label>
                  <span className="text-sm text-muted-foreground">
                    {formData.subjects.length} subjects defined
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Select defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Subject type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="everyone">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Identifier (email, role name, etc.)" />
                  <Button 
                    onClick={() => {
                      // TODO: Implement add subject logic
                      toast.success("Subject would be added")
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {subject.type === 'user' && <User className="h-4 w-4" />}
                        {subject.type === 'role' && <Shield className="h-4 w-4" />}
                        {subject.type === 'group' && <Users className="h-4 w-4" />}
                        {subject.type === 'everyone' && <Globe className="h-4 w-4" />}
                        <div>
                          <div className="font-medium capitalize">{subject.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {subject.identifiers.join(", ")}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubject(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Resources */}
            <TabsContent value="resources" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Policy Resources (What) *</Label>
                  <span className="text-sm text-muted-foreground">
                    {formData.resources.length} resources defined
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <Input placeholder="Resource name..." />
                  <Select defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Resource type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Path (optional)..." />
                  <Button 
                    onClick={() => {
                      // TODO: Implement add resource logic
                      toast.success("Resource would be added")
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {resource.type} {resource.path && `• ${resource.path}`}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Conditions */}
            <TabsContent value="conditions" className="space-y-6">
              <div>
                <Label className="text-base">Access Conditions (When & Where)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Define when and where this policy applies
                </p>

                {/* Time Conditions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <CardTitle className="text-sm">Time Restrictions</CardTitle>
                      </div>
                      <Switch
                        checked={currentRule?.conditions?.time?.enabled || false}
                        onCheckedChange={(enabled) => 
                          updateConditions({
                            time: { ...currentRule?.conditions?.time, enabled }
                          })
                        }
                      />
                    </div>
                  </CardHeader>
                  {currentRule?.conditions?.time?.enabled && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={currentRule.conditions?.time?.allowedHours?.start || "09:00"}
                            onChange={(e) => updateConditions({
                              time: {
                                ...currentRule.conditions?.time,
                                allowedHours: {
                                  ...currentRule.conditions?.time?.allowedHours,
                                  start: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={currentRule.conditions?.time?.allowedHours?.end || "17:00"}
                            onChange={(e) => updateConditions({
                              time: {
                                ...currentRule.conditions?.time,
                                allowedHours: {
                                  ...currentRule.conditions?.time?.allowedHours,
                                  end: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Location Conditions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <CardTitle className="text-sm">Geographic Restrictions</CardTitle>
                      </div>
                      <Switch
                        checked={currentRule?.conditions?.geo?.enabled || false}
                        onCheckedChange={(enabled) => 
                          updateConditions({
                            geo: { ...currentRule?.conditions?.geo, enabled }
                          })
                        }
                      />
                    </div>
                  </CardHeader>
                  {currentRule?.conditions?.geo?.enabled && (
                    <CardContent className="pt-0">
                      <div>
                        <Label>Allowed Countries</Label>
                        <Input
                          placeholder="TR, US, DE (comma separated)"
                          value={currentRule.conditions?.geo?.allowedCountries?.join(", ") || ""}
                          onChange={(e) => updateConditions({
                            geo: {
                              ...currentRule.conditions?.geo,
                              allowedCountries: e.target.value.split(",").map(c => c.trim()).filter(Boolean)
                            }
                          })}
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Device Conditions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <CardTitle className="text-sm">Device Requirements</CardTitle>
                      </div>
                      <Switch
                        checked={currentRule?.conditions?.device?.enabled || false}
                        onCheckedChange={(enabled) => 
                          updateConditions({
                            device: { ...currentRule?.conditions?.device, enabled }
                          })
                        }
                      />
                    </div>
                  </CardHeader>
                  {currentRule?.conditions?.device?.enabled && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Require MFA</Label>
                          <Switch
                            checked={currentRule.conditions?.device?.requireMFA || false}
                            onCheckedChange={(requireMFA) => 
                              updateConditions({
                                device: { ...currentRule.conditions?.device, requireMFA }
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Max Concurrent Sessions</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={currentRule.conditions?.device?.maxConcurrentSessions || 3}
                            onChange={(e) => updateConditions({
                              device: {
                                ...currentRule.conditions?.device,
                                maxConcurrentSessions: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Preview & Simulation */}
            <TabsContent value="preview" className="space-y-4">
              <div>
                <Label className="text-base">Policy Preview & Simulation</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview the policy configuration and test access scenarios
                </p>

                {/* Policy Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Policy Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Effect:</span>
                        <Badge variant={formData.type === 'allow' ? 'default' : 'destructive'}>
                          {formData.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Priority:</span>
                        <Badge variant="secondary">{formData.priority}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Subjects:</span>
                        <span className="text-sm">{formData.subjects.length} defined</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Resources:</span>
                        <span className="text-sm">{formData.resources.length} defined</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Conditions:</span>
                        <span className="text-sm">
                          {Object.entries(currentRule?.conditions || {}).filter(([_, condition]) => condition?.enabled).length} active
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Simulation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Test Simulation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>User Email</Label>
                          <Input
                            placeholder="user@company.com"
                            value={simulationUser}
                            onChange={(e) => setSimulationUser(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Resource ID</Label>
                          <Input
                            placeholder="resource-id"
                            value={simulationResource}
                            onChange={(e) => setSimulationResource(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleSimulation}
                        disabled={isSimulating || !simulationUser.trim() || !simulationResource.trim()}
                        className="w-full"
                      >
                        {isSimulating ? (
                          <Activity className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Simulation
                      </Button>

                      {simulationResult && (
                        <Alert variant={simulationResult.granted ? "default" : "destructive"}>
                          <div className="flex items-center">
                            {simulationResult.granted ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mr-2" />
                            )}
                            <AlertDescription>
                              Access {simulationResult.granted ? "GRANTED" : "DENIED"} for {simulationUser} to {simulationResource}
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!validation}>
            <Save className="h-4 w-4 mr-2" />
            Save Policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}