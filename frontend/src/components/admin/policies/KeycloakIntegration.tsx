'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Users,
  Shield,
  Database,
  Clock,
  Play,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { KeycloakIntegration } from '@/types/access-policy'
import { useTranslations } from 'next-intl'

// Mock Keycloak integration data
const mockKeycloakIntegration = (): KeycloakIntegration => ({
  realm: 'workplace-safety',
  clientId: 'admin-panel',
  roles: [
    {
      keycloakRole: 'admin',
      mappedRole: 'admin',
      description: 'System administrator with full access'
    },
    {
      keycloakRole: 'safety-manager',
      mappedRole: 'manager',
      description: 'Safety manager with department access'
    },
    {
      keycloakRole: 'employee',
      mappedRole: 'employee',
      description: 'Regular employee with basic access'
    },
    {
      keycloakRole: 'contractor',
      mappedRole: 'external',
      description: 'External contractor with limited access'
    },
    {
      keycloakRole: 'hr-manager',
      mappedRole: 'hr-manager',
      description: 'HR manager with employee data access'
    }
  ],
  resources: [
    {
      keycloakResource: 'safety-app',
      mappedResource: 'safety-applications',
      scopes: ['read', 'write']
    },
    {
      keycloakResource: 'admin-panel',
      mappedResource: 'admin-panel',
      scopes: ['read', 'write', 'admin']
    },
    {
      keycloakResource: 'employee-data',
      mappedResource: 'hr-database',
      scopes: ['read', 'write']
    },
    {
      keycloakResource: 'vendor-portal',
      mappedResource: 'vendor-portal',
      scopes: ['read', 'write']
    }
  ],
  syncStatus: {
    lastSync: '2024-08-25T08:30:00Z',
    status: 'success',
    errors: []
  }
})

interface ConnectionStatusProps {
  status: 'success' | 'error' | 'in_progress'
  lastSync?: string
  errors?: string[]
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, lastSync, errors }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Connected'
      case 'error':
        return 'Connection Error'
      case 'in_progress':
        return 'Syncing...'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="space-y-2">
      <Badge className={getStatusColor()}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
      {lastSync && (
        <div className="text-xs text-gray-500">
          Last sync: {new Date(lastSync).toLocaleString()}
        </div>
      )}
      {errors && errors.length > 0 && (
        <div className="text-xs text-red-600">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  )
}

interface RoleMappingDialogProps {
  role?: { keycloakRole: string; mappedRole: string; description: string }
  onSave: (role: { keycloakRole: string; mappedRole: string; description: string }) => void
  onClose: () => void
}

const RoleMappingDialog: React.FC<RoleMappingDialogProps> = ({ role, onSave, onClose }) => {
  const [keycloakRole, setKeycloakRole] = useState(role?.keycloakRole || '')
  const [mappedRole, setMappedRole] = useState(role?.mappedRole || '')
  const [description, setDescription] = useState(role?.description || '')

  const handleSave = () => {
    onSave({ keycloakRole, mappedRole, description })
    onClose()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{role ? 'Edit' : 'Add'} Role Mapping</DialogTitle>
        <DialogDescription>
          Map Keycloak roles to internal application roles
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Keycloak Role</Label>
          <Input
            value={keycloakRole}
            onChange={(e) => setKeycloakRole(e.target.value)}
            placeholder="admin, manager, employee..."
          />
        </div>
        <div className="space-y-2">
          <Label>Mapped Role</Label>
          <Select value={mappedRole} onValueChange={setMappedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select mapped role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="hr-manager">HR Manager</SelectItem>
              <SelectItem value="external">External</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Role description..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </DialogContent>
  )
}

interface ResourceMappingDialogProps {
  resource?: { keycloakResource: string; mappedResource: string; scopes: string[] }
  onSave: (resource: { keycloakResource: string; mappedResource: string; scopes: string[] }) => void
  onClose: () => void
}

const ResourceMappingDialog: React.FC<ResourceMappingDialogProps> = ({ resource, onSave, onClose }) => {
  const [keycloakResource, setKeycloakResource] = useState(resource?.keycloakResource || '')
  const [mappedResource, setMappedResource] = useState(resource?.mappedResource || '')
  const [scopes, setScopes] = useState<string[]>(resource?.scopes || ['read'])

  const availableScopes = ['read', 'write', 'execute', 'admin', 'full']

  const toggleScope = (scope: string) => {
    setScopes(prev => 
      prev.includes(scope) 
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    )
  }

  const handleSave = () => {
    onSave({ keycloakResource, mappedResource, scopes })
    onClose()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{resource ? 'Edit' : 'Add'} Resource Mapping</DialogTitle>
        <DialogDescription>
          Map Keycloak resources to internal application resources
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Keycloak Resource</Label>
          <Input
            value={keycloakResource}
            onChange={(e) => setKeycloakResource(e.target.value)}
            placeholder="safety-app, admin-panel..."
          />
        </div>
        <div className="space-y-2">
          <Label>Mapped Resource</Label>
          <Input
            value={mappedResource}
            onChange={(e) => setMappedResource(e.target.value)}
            placeholder="safety-applications, admin-panel..."
          />
        </div>
        <div className="space-y-2">
          <Label>Scopes</Label>
          <div className="flex flex-wrap gap-2">
            {availableScopes.map(scope => (
              <Button
                key={scope}
                variant={scopes.includes(scope) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleScope(scope)}
              >
                {scope}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function KeycloakIntegration() {
  const [integration, setIntegration] = useState<KeycloakIntegration>(mockKeycloakIntegration())
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const t = useTranslations('policies.keycloakIntegration')
  const [connectionSettings, setConnectionSettings] = useState({
    serverUrl: 'https://keycloak.company.com',
    realm: 'workplace-safety',
    clientId: 'admin-panel',
    clientSecret: '••••••••••••••••'
  })
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showResourceDialog, setShowResourceDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [editingResource, setEditingResource] = useState<any>(null)

  const testConnection = async () => {
    setIsConnecting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnecting(false)
    setIntegration(prev => ({
      ...prev,
      syncStatus: {
        ...prev.syncStatus,
        status: 'success'
      }
    }))
  }

  const syncWithKeycloak = async () => {
    setIsSyncing(true)
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsSyncing(false)
    setIntegration(prev => ({
      ...prev,
      syncStatus: {
        lastSync: new Date().toISOString(),
        status: 'success',
        errors: []
      }
    }))
  }

  const handleSaveRole = (role: { keycloakRole: string; mappedRole: string; description: string }) => {
    setIntegration(prev => ({
      ...prev,
      roles: editingRole 
        ? prev.roles.map(r => r.keycloakRole === editingRole.keycloakRole ? role : r)
        : [...prev.roles, role]
    }))
  }

  const handleDeleteRole = (keycloakRole: string) => {
    setIntegration(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r.keycloakRole !== keycloakRole)
    }))
  }

  const handleSaveResource = (resource: { keycloakResource: string; mappedResource: string; scopes: string[] }) => {
    setIntegration(prev => ({
      ...prev,
      resources: editingResource 
        ? prev.resources.map(r => r.keycloakResource === editingResource.keycloakResource ? resource : r)
        : [...prev.resources, resource]
    }))
  }

  const handleDeleteResource = (keycloakResource: string) => {
    setIntegration(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.keycloakResource !== keycloakResource)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Connection Status and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('connection.title')}</span>
              <ConnectionStatus 
                status={isSyncing ? 'in_progress' : integration.syncStatus.status} 
                lastSync={integration.syncStatus.lastSync}
                errors={integration.syncStatus.errors}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div><strong>{t('connection.info.realm')}:</strong> {integration.realm}</div>
              <div><strong>{t('connection.info.clientId')}:</strong> {integration.clientId}</div>
              <div><strong>{t('connection.info.mappedRoles')}:</strong> {integration.roles.length}</div>
              <div><strong>{t('connection.info.mappedResources')}:</strong> {integration.resources.length}</div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              <Button 
                onClick={syncWithKeycloak}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Connection Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Server URL</Label>
              <Input
                value={connectionSettings.serverUrl}
                onChange={(e) => setConnectionSettings(prev => ({ ...prev, serverUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Realm</Label>
              <Input
                value={connectionSettings.realm}
                onChange={(e) => setConnectionSettings(prev => ({ ...prev, realm: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input
                value={connectionSettings.clientId}
                onChange={(e) => setConnectionSettings(prev => ({ ...prev, clientId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input
                type="password"
                value={connectionSettings.clientSecret}
                onChange={(e) => setConnectionSettings(prev => ({ ...prev, clientSecret: e.target.value }))}
              />
            </div>
            <Button variant="outline" className="w-full">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mapping Tables */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Role Mappings</TabsTrigger>
          <TabsTrigger value="resources">Resource Mappings</TabsTrigger>
          <TabsTrigger value="sync-log">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Role Mappings
                  </CardTitle>
                  <CardDescription>
                    Map Keycloak roles to internal application roles
                  </CardDescription>
                </div>
                <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingRole(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Mapping
                    </Button>
                  </DialogTrigger>
                  <RoleMappingDialog
                    role={editingRole}
                    onSave={handleSaveRole}
                    onClose={() => setShowRoleDialog(false)}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keycloak Role</TableHead>
                    <TableHead>Mapped Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integration.roles.map((role) => (
                    <TableRow key={role.keycloakRole}>
                      <TableCell>
                        <Badge variant="outline">{role.keycloakRole}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{role.mappedRole}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {role.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingRole(role)
                              setShowRoleDialog(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRole(role.keycloakRole)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Resource Mappings
                  </CardTitle>
                  <CardDescription>
                    Map Keycloak resources to internal application resources
                  </CardDescription>
                </div>
                <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingResource(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Mapping
                    </Button>
                  </DialogTrigger>
                  <ResourceMappingDialog
                    resource={editingResource}
                    onSave={handleSaveResource}
                    onClose={() => setShowResourceDialog(false)}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keycloak Resource</TableHead>
                    <TableHead>Mapped Resource</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integration.resources.map((resource) => (
                    <TableRow key={resource.keycloakResource}>
                      <TableCell>
                        <Badge variant="outline">{resource.keycloakResource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{resource.mappedResource}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {resource.scopes.map(scope => (
                            <Badge key={scope} variant="secondary" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingResource(resource)
                              setShowResourceDialog(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResource(resource.keycloakResource)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Sync History
              </CardTitle>
              <CardDescription>
                History of synchronization attempts with Keycloak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock sync history */}
                <div className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Successful Sync</span>
                    </div>
                    <span className="text-xs text-gray-500">2024-08-25 08:30:00</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Synced 5 roles, 4 resources. No errors.
                  </div>
                </div>

                <div className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Successful Sync</span>
                    </div>
                    <span className="text-xs text-gray-500">2024-08-24 08:30:00</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Synced 5 roles, 3 resources. 1 new resource added.
                  </div>
                </div>

                <div className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-sm">Partial Sync</span>
                    </div>
                    <span className="text-xs text-gray-500">2024-08-23 08:30:00</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Synced 4 roles, 3 resources. Warning: 1 role mapping conflict detected.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}