"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  LogOut, Shield, AlertTriangle, Flag, Clock, 
  X, Users, Settings
} from "lucide-react"
import { SessionAction } from "@/types/session"
import toast from "react-hot-toast"
import { useTranslations } from 'next-intl'

interface BulkActionsProps {
  selectedSessions: string[]
  onAction: (action: SessionAction, options?: any) => void
  onClear: () => void
}

export function BulkActions({ selectedSessions, onAction, onClear }: BulkActionsProps) {
  const t = useTranslations('common.sessions.bulkActions')
  const [selectedAction, setSelectedAction] = useState<SessionAction | ''>('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionOptions, setActionOptions] = useState<any>({
    reason: '',
    blockDuration: 15,
    notifyUser: false
  })
  const [loading, setLoading] = useState(false)

  const bulkActions = [
    {
      value: 'revoke',
      label: t('actions.revoke.label'),
      description: t('actions.revoke.description'),
      icon: LogOut,
      variant: 'destructive' as const,
      requiresConfirmation: true
    },
    {
      value: 'revoke_block_ip',
      label: t('actions.revokeBlockIp.label'),
      description: t('actions.revokeBlockIp.description'),
      icon: Shield,
      variant: 'destructive' as const,
      requiresConfirmation: true
    },
    {
      value: 'require_mfa',
      label: t('actions.forceMfa.label'),
      description: t('actions.forceMfa.description'),
      icon: Shield,
      variant: 'secondary' as const,
      requiresConfirmation: false
    },
    {
      value: 'quarantine_ip',
      label: t('actions.quarantineIp.label'),
      description: t('actions.quarantineIp.description'),
      icon: AlertTriangle,
      variant: 'secondary' as const,
      requiresConfirmation: true
    },
    {
      value: 'flag_compromised',
      label: t('actions.flagCompromised.label'),
      description: t('actions.flagCompromised.description'),
      icon: Flag,
      variant: 'secondary' as const,
      requiresConfirmation: false
    },
    {
      value: 'require_reauth',
      label: t('actions.requireReauth.label'),
      description: t('actions.requireReauth.description'),
      icon: Clock,
      variant: 'secondary' as const,
      requiresConfirmation: false
    }
  ]

  const handleExecuteAction = async () => {
    if (!selectedAction) return

    const actionConfig = bulkActions.find(a => a.value === selectedAction)
    if (!actionConfig) return

    if (actionConfig.requiresConfirmation && !actionOptions.reason?.trim()) {
      toast.error(t('toast.reasonRequired'))
      return
    }

    setLoading(true)
    try {
      await onAction(selectedAction, actionOptions)
      setShowConfirmDialog(false)
      setSelectedAction('')
      setActionOptions({ reason: '', blockDuration: 15, notifyUser: false })
    } catch (error) {
      toast.error(t('toast.executeFailed'))
    } finally {
      setLoading(false)
    }
  }

  const getActionConfig = (action: SessionAction) => {
    return bulkActions.find(a => a.value === action)
  }

  const selectedActionConfig = selectedAction ? getActionConfig(selectedAction) : null

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-amber-600" />
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {t('selected', { count: selectedSessions.length })}
              </Badge>
            </div>
            
            <Select 
              value={selectedAction} 
              onValueChange={(value) => setSelectedAction(value as SessionAction)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t('choosePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            
            {selectedAction && (
              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant={selectedActionConfig?.variant || 'default'}
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('executeAction')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      {selectedActionConfig?.icon && (
                        <selectedActionConfig.icon className="h-5 w-5" />
                      )}
                      <span>{t('confirmTitle')}</span>
                    </DialogTitle>
                    <DialogDescription>
                      {t('confirmDescription', { action: selectedActionConfig?.label, count: selectedSessions.length })}
                      {t('cannotUndo')}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <Alert variant={selectedActionConfig?.variant === 'destructive' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{t('alert.action')}:</strong> {selectedActionConfig?.description}
                        <br />
                        <strong>{t('alert.affectedSessions')}:</strong> {selectedSessions.length}
                        {selectedActionConfig?.variant === 'destructive' && (
                          <>
                            <br />
                            <strong>{t('alert.warning')}:</strong> {t('alert.terminateWarning')}
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                    
                    {selectedActionConfig?.requiresConfirmation && (
                      <div className="space-y-2">
                        <Label htmlFor="reason">{t('fields.reason')} *</Label>
                        <Textarea
                          id="reason"
                          placeholder={t('fields.reasonPlaceholder')}
                          value={actionOptions.reason}
                          onChange={(e) => setActionOptions(prev => ({ 
                            ...prev, 
                            reason: e.target.value 
                          }))}
                          rows={3}
                        />
                      </div>
                    )}
                    
                    {(selectedAction === 'revoke_block_ip' || selectedAction === 'quarantine_ip') && (
                      <div className="space-y-2">
                        <Label htmlFor="blockDuration">{t('fields.blockDuration')}</Label>
                        <Select
                          value={actionOptions.blockDuration.toString()}
                          onValueChange={(value) => setActionOptions(prev => ({ 
                            ...prev, 
                            blockDuration: parseInt(value) 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">{t('duration.15min')}</SelectItem>
                            <SelectItem value="30">{t('duration.30min')}</SelectItem>
                            <SelectItem value="60">{t('duration.1hour')}</SelectItem>
                            <SelectItem value="240">{t('duration.4hours')}</SelectItem>
                            <SelectItem value="1440">{t('duration.24hours')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifyUser"
                        checked={actionOptions.notifyUser}
                        onChange={(e) => setActionOptions(prev => ({ 
                          ...prev, 
                          notifyUser: e.target.checked 
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor="notifyUser" className="text-sm">
                        {t('fields.notifyUsers')}
                      </Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDialog(false)}
                      disabled={loading}
                    >
                      {t('buttons.cancel')}
                    </Button>
                    <Button
                      variant={selectedActionConfig?.variant || 'default'}
                      onClick={handleExecuteAction}
                      disabled={loading || (selectedActionConfig?.requiresConfirmation && !actionOptions.reason?.trim())}
                    >
                      {loading ? t('buttons.processing') : t('buttons.execute', { action: selectedActionConfig?.label })}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <Button variant="outline" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-2" />
            {t('clearSelection')}
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-amber-700">
          <div className="flex items-center space-x-4">
            <span>{t('tip')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}