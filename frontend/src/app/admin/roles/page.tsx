'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Shield, Users, Settings, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { RoleManagementDialog } from '@/components/admin/roles/RoleManagementDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export default function RolesPage() {
  const t = useTranslations('admin.roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();

  // Mock data - In real implementation, this would come from API
  useEffect(() => {
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'admin',
        displayName: 'System Administrator',
        description: 'Tüm sistem yetkilerine sahip süper yönetici',
        permissions: [
          'user:read', 'user:write', 'user:delete',
          'role:read', 'role:write', 'role:delete',
          'oauth:read', 'oauth:write',
          'audit:read', 'audit:write',
          'system:read', 'system:write',
          'settings:read', 'settings:write'
        ],
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-08-24T10:00:00.000Z',
        userCount: 2,
      },
      {
        id: '2',
        name: 'manager',
        displayName: 'Security Manager',
        description: 'Güvenlik yönetimi ve kullanıcı yönetimi yetkilerine sahip',
        permissions: [
          'user:read', 'user:write',
          'role:read',
          'oauth:read',
          'audit:read',
          'system:read',
          'settings:read'
        ],
        createdAt: '2024-01-20T10:00:00.000Z',
        updatedAt: '2024-08-20T10:00:00.000Z',
        userCount: 5,
      },
      {
        id: '3',
        name: 'viewer',
        displayName: 'Read-Only User',
        description: 'Sadece görüntüleme yetkisine sahip kullanıcı',
        permissions: [
          'user:read',
          'role:read',
          'audit:read',
          'system:read'
        ],
        createdAt: '2024-02-01T10:00:00.000Z',
        updatedAt: '2024-08-15T10:00:00.000Z',
        userCount: 15,
      },
    ];

    // Filter mock data
    let filteredRoles = mockRoles;
    if (searchQuery) {
      filteredRoles = filteredRoles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setRoles(filteredRoles);
    setLoading(false);
  }, [searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'viewer':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPermissionsByCategory = (permissions: string[]) => {
    const categories: { [key: string]: string[] } = {};
    
    permissions.forEach(permission => {
      const [resource] = permission.split(':');
      if (!categories[resource]) {
        categories[resource] = [];
      }
      categories[resource].push(permission);
    });
    
    return categories;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('description')}
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setSelectedRole(undefined);
            setRoleDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('newRole')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalRoles')}</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalUsers')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {roles.reduce((sum, role) => sum + (role.userCount || 0), 0)}
                </p>
              </div>
              <Users className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('adminRoles')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {roles.filter(r => r.name.includes('admin')).length}
                </p>
              </div>
              <Settings className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('averagePermissions')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(roles.reduce((sum, role) => sum + role.permissions.length, 0) / roles.length) || 0}
                </p>
              </div>
              <Shield className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('permissions')}</TableHead>
                <TableHead>{t('userCount')}</TableHead>
                <TableHead>{t('createdAt')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={getRoleBadgeColor(role.name)}
                        >
                          {role.name}
                        </Badge>
                      </div>
                      <div className="font-medium text-gray-900">{role.displayName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 max-w-xs">
                      {role.description || t('noDescription')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {Object.entries(getPermissionsByCategory(role.permissions)).map(([category, perms]) => (
                        <div key={category} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {category}
                          </Badge>
                          <span className="text-xs text-gray-500">({perms.length})</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{role.userCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{formatDate(role.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRole(role);
                            setRoleDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          {t('managePermissions')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          {t('viewUsers')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {roles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">{t('noRolesFound')}</h3>
                <p>{t('noRolesMessage')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Management Dialog */}
      <RoleManagementDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={selectedRole}
        onSave={(updatedRole) => {
          if (selectedRole) {
            // Update existing role
            setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, ...updatedRole } : r));
          } else {
            // Add new role
            const newRole = {
              ...updatedRole,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              userCount: 0
            };
            setRoles(prev => [...prev, newRole]);
          }
        }}
      />
    </div>
  );
}