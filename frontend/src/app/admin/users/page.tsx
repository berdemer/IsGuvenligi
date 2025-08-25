'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MoreHorizontal, UserPlus, UserMinus, Shield } from 'lucide-react';
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

interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
  lastLoginAt?: string;
  loginCount?: number;
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Mock data - In real implementation, this would come from API
  useEffect(() => {
    // Simulate API call
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@isguvenligi.com',
        fullName: 'System Administrator',
        isActive: true,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-08-24T10:00:00.000Z',
        roles: [
          { id: '1', name: 'admin', displayName: 'Administrator' }
        ],
        lastLoginAt: '2024-08-24T09:30:00.000Z',
        loginCount: 145
      },
      {
        id: '2',
        email: 'manager@isguvenligi.com',
        fullName: 'Security Manager',
        isActive: true,
        createdAt: '2024-01-20T10:00:00.000Z',
        updatedAt: '2024-08-24T10:00:00.000Z',
        roles: [
          { id: '2', name: 'manager', displayName: 'Manager' }
        ],
        lastLoginAt: '2024-08-23T16:45:00.000Z',
        loginCount: 89
      },
      {
        id: '3',
        email: 'analyst@isguvenligi.com',
        fullName: 'Security Analyst',
        isActive: true,
        createdAt: '2024-02-01T10:00:00.000Z',
        updatedAt: '2024-08-20T10:00:00.000Z',
        roles: [
          { id: '3', name: 'viewer', displayName: 'Viewer' }
        ],
        lastLoginAt: '2024-08-24T08:15:00.000Z',
        loginCount: 67
      },
      {
        id: '4',
        email: 'inactive@isguvenligi.com',
        fullName: 'Inactive User',
        isActive: false,
        createdAt: '2024-03-15T10:00:00.000Z',
        updatedAt: '2024-07-10T10:00:00.000Z',
        roles: [
          { id: '3', name: 'viewer', displayName: 'Viewer' }
        ],
        lastLoginAt: '2024-07-10T14:20:00.000Z',
        loginCount: 23
      }
    ];

    // Filter mock data based on current filters
    let filteredUsers = mockUsers;

    if (searchQuery) {
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }

    if (roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        user.roles?.some(role => role.name === roleFilter)
      );
    }

    setUsers(filteredUsers);
    setTotal(filteredUsers.length);
    setTotalPages(Math.ceil(filteredUsers.length / 10));
    setLoading(false);
  }, [searchQuery, statusFilter, roleFilter, currentPage]);

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
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
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
      hour: '2-digit',
      minute: '2-digit'
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
          <h1 className="text-3xl font-semibold text-gray-900">Kullanıcılar</h1>
          <p className="text-gray-600 mt-1">
            Sistem kullanıcılarını yönetin ve izinlerini düzenleyin
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
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
                <p className="text-sm font-medium text-gray-600">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.isActive).length}
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
                <p className="text-sm font-medium text-gray-600">Pasif Kullanıcı</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => !u.isActive).length}
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
                <p className="text-sm font-medium text-gray-600">Seçili</p>
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
                placeholder="Kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Roller</SelectItem>
                  <SelectItem value="admin">Yönetici</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Görüntüleyici</SelectItem>
                </SelectContent>
              </Select>

              {selectedUsers.size > 0 && (
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil ({selectedUsers.size})
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
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Roller</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Giriş</TableHead>
                <TableHead>Giriş Sayısı</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
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
                          {getInitials(user.fullName)}
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
                      {user.roles?.map((role) => (
                        <Badge
                          key={role.id}
                          variant="secondary"
                          className={`text-xs ${getRoleBadgeColor(role.name)}`}
                        >
                          {role.displayName}
                        </Badge>
                      ))}
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
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Hiç giriş yapmamış'}
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
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Rolleri Yönet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          {user.isActive ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Devre Dışı Bırak
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Etkinleştir
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Kullanıcı bulunamadı</h3>
                <p>Belirtilen kriterlere uygun kullanıcı bulunmuyor.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Toplam {total} kullanıcıdan {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, total)} arası gösteriliyor
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}