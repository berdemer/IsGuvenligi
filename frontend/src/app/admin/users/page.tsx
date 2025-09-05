'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, Edit, Trash2, MoreHorizontal, UserPlus, UserMinus, Shield, RefreshCw } from 'lucide-react';
import { UserManagementDialog } from '@/components/admin/users/UserManagementDialog';
import { RoleManagementDialog } from '@/components/admin/users/RoleManagementDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsersStore, type User } from '@/stores/usersStore';
import { useDepartmentsStore } from '@/stores/departmentsStore';
import toast from 'react-hot-toast';

// UserDialogData type for the dialog component compatibility
type UserDialogData = {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  department: string;
  phone: string;
  isActive: boolean;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
};

export default function UsersPage() {
  const t = useTranslations('users');
  const { 
    users, 
    initializeUsers, 
    addUser, 
    updateUser, 
    deleteUser, 
    searchUsers 
  } = useUsersStore();
  
  const { 
    incrementEmployeeCount, 
    decrementEmployeeCount, 
    updateEmployeeCount 
  } = useDepartmentsStore();
  const [loading, setLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDialogData | undefined>();
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Initialize users from localStorage on component mount
  useEffect(() => {
    setLoading(true);
    try {
      // Initialize users from localStorage or default users
      initializeUsers();
    } catch (error) {
      console.error('Error initializing users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [initializeUsers]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchUsers(searchQuery);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.roles?.includes(roleFilter)
      );
    }

    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / 10));
  }, [users, searchQuery, statusFilter, roleFilter, searchUsers]);

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const handleDeleteSelected = () => {
    const count = selectedUsers.size;
    if (confirm(`Are you sure you want to delete ${count} selected users?`)) {
      selectedUsers.forEach(userId => {
        // Find user to get department info before deleting
        const user = users.find(u => u.id === userId);
        if (user && user.department) {
          decrementEmployeeCount(user.department);
        }
        deleteUser(userId);
      });
      setSelectedUsers(new Set());
      toast.success(`${count} users deleted successfully`);
    }
  };

  // Convert User to UserDialogData for editing
  const convertToDialogData = (user: User): UserDialogData => {
    const [firstName, ...lastNameParts] = user.fullName?.split(' ') || ['', ''];
    return {
      id: user.id,
      email: user.email,
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      username: user.username || user.email.split('@')[0],
      department: user.department || 'IT Department',
      phone: user.phone || '+90 555 123 45 67',
      isActive: user.isActive,
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
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
            setSelectedUser(undefined);
            setUserDialogOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {t('newUser')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalUsers')}</p>
                <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('activeUsers')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredUsers.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('inactiveUsers')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredUsers.filter(u => !u.isActive).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <UserMinus className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('selected')}</p>
                <p className="text-2xl font-bold text-blue-600">{selectedUsers.size}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Edit className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allRoles')}</SelectItem>
                  <SelectItem value="admin">{t('admin')}</SelectItem>
                  <SelectItem value="manager">{t('manager')}</SelectItem>
                  <SelectItem value="viewer">{t('viewer')}</SelectItem>
                </SelectContent>
              </Select>

              {selectedUsers.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('delete')} ({selectedUsers.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('rolesHeader')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('lastLogin')}</TableHead>
                <TableHead>{t('loginCount')}</TableHead>
                <TableHead>{t('registrationDate')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(user.fullName || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role) => {
                        const roleNames = { admin: 'Administrator', manager: 'Manager', viewer: 'Viewer' };
                        return (
                          <Badge
                            key={role}
                            variant="secondary"
                            className={`text-xs ${getRoleBadgeColor(role)}`}
                          >
                            {roleNames[role as keyof typeof roleNames] || role}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? 'default' : 'secondary'}
                      className={
                        user.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }
                    >
                      {user.isActive ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('neverLoggedIn')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{user.loginCount || 0}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
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
                            const dialogData = convertToDialogData(user);
                            console.log('Edit clicked - Original user:', user);
                            console.log('Edit clicked - Converted data:', dialogData);
                            setSelectedUser(dialogData);
                            setUserDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUserForRole(user);
                            setRoleDialogOpen(true);
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {t('manageRoles')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            updateUser(user.id, { isActive: !user.isActive });
                            toast.success(user.isActive ? 'User deactivated' : 'User activated');
                          }}
                        >
                          {user.isActive ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-2" />
                              {t('deactivate')}
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              {t('activate')}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
                              // Decrement department employee count
                              if (user.department) {
                                decrementEmployeeCount(user.department);
                              }
                              deleteUser(user.id);
                              toast.success('User deleted successfully');
                            }
                          }}
                        >
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">{t('noUsersFound')}</h3>
                <p>{t('noUsersMessage')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {t('showingResults', { 
              total: filteredUsers.length, 
              from: ((currentPage - 1) * 10) + 1, 
              to: Math.min(currentPage * 10, filteredUsers.length)
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {t('previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      )}

      {/* User Management Dialog */}
      <UserManagementDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={selectedUser}
        onSave={(updatedUser) => {
          try {
            if (selectedUser && selectedUser.id) {
              // Update existing user
              const oldDepartment = selectedUser.department;
              const newDepartment = updatedUser.department;
              
              updateUser(selectedUser.id, {
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                username: updatedUser.username,
                department: updatedUser.department,
                phone: updatedUser.phone,
                isActive: updatedUser.isActive,
                roles: updatedUser.roles
              });
              
              // Update department employee counts if department changed
              console.log('🔄 Updating employee count:', { oldDepartment, newDepartment });
              updateEmployeeCount(oldDepartment, newDepartment);
              
              toast.success('User updated successfully');
            } else {
              // Add new user
              addUser({
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                username: updatedUser.username,
                department: updatedUser.department,
                phone: updatedUser.phone,
                isActive: updatedUser.isActive,
                roles: updatedUser.roles
              });
              
              // Increment employee count for new user's department
              console.log('➕ Adding user to department:', updatedUser.department);
              if (updatedUser.department) {
                incrementEmployeeCount(updatedUser.department);
              }
              
              toast.success('User created successfully');
            }
            setUserDialogOpen(false);
            setSelectedUser(undefined);
          } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Failed to save user');
          }
        }}
      />

      {/* Role Management Dialog */}
      <RoleManagementDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        user={selectedUserForRole}
      />
    </div>
  );
}