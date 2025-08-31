"use client"

import { useState, useMemo } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  AlertTriangle, CheckCircle, XCircle, Info, Zap, 
  ArrowRight, Settings, Play, Pause 
} from "lucide-react"
import { AuthPolicy, PolicyConflict } from "@/types/auth-policy"
import toast from "react-hot-toast"

interface PolicyConflictsProps {
  policies: AuthPolicy[]
}

export function PolicyConflicts({ policies }: PolicyConflictsProps) {
  const t = useTranslations('common.conflicts')
  const [resolvingConflict, setResolvingConflict] = useState<string | null>(null)
  const [showResolutionDialog, setShowResolutionDialog] = useState<string | null>(null)

  const allConflicts = useMemo(() => {
    const conflicts: (PolicyConflict & { policyName: string })[] = []
    
    policies.forEach(policy => {
      policy.conflicts.forEach(conflict => {
        conflicts.push({
          ...conflict,
          policyName: policy.name
        })
      })
    })

    return conflicts
  }, [policies])

  const conflictsByPolicy = useMemo(() => {
    const grouped: Record<string, AuthPolicy[]> = {}
    
    policies.forEach(policy => {
      if (policy.conflicts.length > 0) {
        grouped[policy.id] = [policy]
      }
    })

    return grouped
  }, [policies])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-red-500 bg-red-50 border-red-100'
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />
      case 'low':
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getConflictTypeDescription = (type: string) => {
    switch (type) {
      case 'overlap':
        return 'Policies have overlapping scopes or conditions'
      case 'contradiction':
        return 'Policies contain contradictory rules'
      case 'dependency':
        return 'Policy depends on another policy that conflicts'
      default:
        return 'Unknown conflict type'
    }
  }

  const handleAutoResolve = async (conflictId: string) => {
    setResolvingConflict(conflictId)
    
    try {
      // Mock API call for auto-resolution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(t('toast.resolvedAuto'))
      // In real implementation, this would update the policies
    } catch (error) {
      toast.error(t('toast.resolveFailed'))
    } finally {
      setResolvingConflict(null)
    }
  }

  const handleManualResolve = async (conflictId: string, resolution: string) => {
    try {
      // Mock API call for manual resolution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(t('toast.resolutionApplied'))
      setShowResolutionDialog(null)
    } catch (error) {
      toast.error(t('toast.applyFailed'))
    }
  }

  if (allConflicts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>No Conflicts Detected</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All Clear!</h3>
            <p className="text-muted-foreground">
              No policy conflicts have been detected. Your authentication policies are working harmoniously.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const criticalConflicts = allConflicts.filter(c => c.severity === 'critical').length
  const highConflicts = allConflicts.filter(c => c.severity === 'high').length
  const autoResolvableConflicts = allConflicts.filter(c => c.autoResolvable).length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{criticalConflicts}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{highConflicts}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{autoResolvableConflicts}</p>
                <p className="text-xs text-muted-foreground">Auto-resolvable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{allConflicts.length}</p>
                <p className="text-xs text-muted-foreground">Total Conflicts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Conflicts Alert */}
      {criticalConflicts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalConflicts} critical conflict{criticalConflicts > 1 ? 's' : ''} detected!</strong>
            <br />
            These conflicts may prevent proper authentication and should be resolved immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      {autoResolvableConflicts > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Auto-Resolution Available</p>
                  <p className="text-sm text-blue-600">
                    {autoResolvableConflicts} conflict{autoResolvableConflicts > 1 ? 's' : ''} can be resolved automatically
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => {
                  allConflicts
                    .filter(c => c.autoResolvable)
                    .forEach(c => handleAutoResolve(c.conflictId))
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                Resolve All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts List */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Conflicts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allConflicts.map((conflict, index) => (
            <div key={conflict.conflictId}>
              <div className={`p-4 rounded-lg border ${getSeverityColor(conflict.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getSeverityIcon(conflict.severity)}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {conflict.type}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {conflict.severity}
                        </Badge>
                        {conflict.autoResolvable && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            Auto-resolvable
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium">{conflict.description}</h4>
                      
                      <p className="text-sm opacity-80">
                        {getConflictTypeDescription(conflict.type)}
                      </p>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Affected Policies:</p>
                        <div className="flex flex-wrap gap-2">
                          {conflict.affectedPolicies.map(policyId => {
                            const policy = policies.find(p => p.id === policyId)
                            return policy ? (
                              <Badge key={policyId} variant="outline">
                                {policy.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                      
                      {conflict.resolution && (
                        <div className="mt-3 p-3 bg-white/50 rounded border">
                          <p className="text-sm">
                            <strong>Suggested Resolution:</strong> {conflict.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {conflict.autoResolvable ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoResolve(conflict.conflictId)}
                        disabled={resolvingConflict === conflict.conflictId}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        {resolvingConflict === conflict.conflictId ? (
                          <>
                            <Settings className="h-3 w-3 mr-1 animate-spin" />
                            Resolving...
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 mr-1" />
                            Auto Resolve
                          </>
                        )}
                      </Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Conflict</DialogTitle>
                            <DialogDescription>
                              Choose how to resolve this policy conflict. This action will modify the affected policies.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Conflict:</strong> {conflict.description}
                              </AlertDescription>
                            </Alert>
                            
                            <div className="space-y-3">
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleManualResolve(conflict.conflictId, 'prioritize')}
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Prioritize by policy priority
                              </Button>
                              
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleManualResolve(conflict.conflictId, 'merge')}
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Merge conflicting rules
                              </Button>
                              
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleManualResolve(conflict.conflictId, 'disable')}
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Disable lower priority policy
                              </Button>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
              
              {index < allConflicts.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Prevention Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Conflict Prevention Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Use clear, non-overlapping scopes for different policy types</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Set appropriate priority levels to establish clear precedence</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Test policies in simulation mode before activation</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Use gradual rollouts to identify conflicts early</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Review and update policies regularly to prevent drift</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}