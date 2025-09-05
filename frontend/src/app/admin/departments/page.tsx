'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Building, Users, UserCheck, UserX } from 'lucide-react';
import { DepartmentManagementDialog } from '@/components/admin/departments/DepartmentManagementDialog';
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
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDepartmentsStore, type Department } from '@/stores/departmentsStore';
import { useUsersStore } from '@/stores/usersStore';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const t = useTranslations('departments');
  const { 
    departments, 
    initializeDepartments, 
    updateDepartment, 
    deleteDepartment, 
    searchDepartments,
    syncEmployeeCountsWithUsers 
  } = useDepartmentsStore();
  
  const { users, initializeUsers } = useUsersStore();
  
  const [loading, setLoading] = useState(true);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any | undefined>();
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  // Initialize departments from localStorage on component mount
  useEffect(() => {
    setLoading(true);
    try {
      initializeDepartments();
      initializeUsers();
    } catch (error) {
      console.error('Error initializing stores:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [initializeDepartments, initializeUsers]);

  // Sync employee counts when users are loaded
  useEffect(() => {
    console.log('🏢 Departments page - Users available:', users.length);
    if (users.length > 0) {
      console.log('📊 Syncing employee counts with users:', users.map(u => ({name: u.fullName, dept: u.department, isActive: u.isActive})));
      syncEmployeeCountsWithUsers(users);
    }
  }, [users, syncEmployeeCountsWithUsers]);

  // Filter departments based on search and filters
  useEffect(() => {
    let filtered = departments;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchDepartments(searchQuery);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(dept => dept.isActive === isActive);
    }

    setFilteredDepartments(filtered);
  }, [departments, searchQuery, statusFilter, searchDepartments]);

  const handleSelectDepartment = (departmentId: string) => {
    const newSelected = new Set(selectedDepartments);
    if (newSelected.has(departmentId)) {
      newSelected.delete(departmentId);
    } else {
      newSelected.add(departmentId);
    }
    setSelectedDepartments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDepartments.size === filteredDepartments.length) {
      setSelectedDepartments(new Set());
    } else {
      setSelectedDepartments(new Set(filteredDepartments.map(dept => dept.id)));
    }
  };

  const handleDeleteSelected = () => {
    const count = selectedDepartments.size;
    if (confirm(t('deleteMultipleConfirm', { count }))) {
      selectedDepartments.forEach(departmentId => {
        deleteDepartment(departmentId);
      });
      setSelectedDepartments(new Set());
      toast.success(t('departmentsDeleted', { count }));
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
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
            setSelectedDepartment(undefined);
            setDepartmentDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('newDepartment')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalDepartments')}</p>
                <p className="text-2xl font-bold text-gray-900">{filteredDepartments.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('activeDepartments')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredDepartments.filter(d => d.isActive).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalEmployees')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredDepartments.reduce((sum, d) => sum + d.employeeCount, 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('selected')}</p>
                <p className="text-2xl font-bold text-orange-600">{selectedDepartments.size}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Edit className="h-6 w-6 text-orange-600" />
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
                  <SelectItem value="all">{t('allStatus')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>

              {selectedDepartments.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
{t('delete')} ({selectedDepartments.size})
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
                    checked={selectedDepartments.size === filteredDepartments.length && filteredDepartments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('department')}</TableHead>
                <TableHead>{t('manager')}</TableHead>
                <TableHead>{t('employees')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('created')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow key={department.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedDepartments.has(department.id)}
                      onCheckedChange={() => handleSelectDepartment(department.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(department.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{department.name}</div>
                        <div className="text-sm text-gray-500">{department.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {department.managerEmail || (
                        <span className="text-gray-400 italic">{t('noManagerAssigned')}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{department.employeeCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={department.isActive ? 'default' : 'secondary'}
                      className={
                        department.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }
                    >
                      {department.isActive ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{formatDate(department.createdAt)}</div>
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
                            setSelectedDepartment({
                              id: department.id,
                              name: department.name,
                              description: department.description,
                              managerEmail: department.managerEmail,
                              isActive: department.isActive,
                              createdAt: department.createdAt,
                              updatedAt: department.updatedAt
                            });
                            setDepartmentDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            updateDepartment(department.id, { isActive: !department.isActive });
                            toast.success(department.isActive ? t('departmentDeactivated') : t('departmentActivated'));
                          }}
                        >
                          {department.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              {t('deactivate')}
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              {t('activate')}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm(t('deleteConfirm', { name: department.name }))) {
                              deleteDepartment(department.id);
                              toast.success(t('departmentDeleted'));
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

          {filteredDepartments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">{t('noDepartmentsFound')}</h3>
                <p>{t('noDepartmentsMessage')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Management Dialog */}
      <DepartmentManagementDialog
        open={departmentDialogOpen}
        onOpenChange={setDepartmentDialogOpen}
        department={selectedDepartment}
      />
    </div>
  );
}