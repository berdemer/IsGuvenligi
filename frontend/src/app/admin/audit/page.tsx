'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Activity, AlertCircle, Eye, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  metadata?: Record<string, any>;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  userId: string;
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Mock data - In real implementation, this would come from API
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        action: 'user.login',
        resource: 'auth',
        details: { method: 'password', success: true },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        level: 'info',
        createdAt: '2024-08-24T09:30:00.000Z',
        user: {
          id: '1',
          email: 'admin@isguvenligi.com',
          fullName: 'System Administrator',
        },
        userId: '1',
      },
      {
        id: '2',
        action: 'user.created',
        resource: 'user',
        resourceId: 'user-123',
        details: { 
          newUser: { 
            email: 'newuser@isguvenligi.com', 
            name: 'New User', 
            roles: ['viewer'] 
          } 
        },
        ipAddress: '192.168.1.100',
        level: 'info',
        createdAt: '2024-08-24T09:15:00.000Z',
        user: {
          id: '1',
          email: 'admin@isguvenligi.com',
          fullName: 'System Administrator',
        },
        userId: '1',
      },
      {
        id: '3',
        action: 'oauth.provider.updated',
        resource: 'oauth',
        resourceId: 'google',
        details: {
          before: { isEnabled: false },
          after: { isEnabled: true },
          changes: { isEnabled: true }
        },
        ipAddress: '192.168.1.105',
        level: 'warn',
        createdAt: '2024-08-24T08:45:00.000Z',
        user: {
          id: '2',
          email: 'manager@isguvenligi.com',
          fullName: 'Security Manager',
        },
        userId: '2',
      },
      {
        id: '4',
        action: 'role.permissions.updated',
        resource: 'role',
        resourceId: 'manager',
        details: {
          role: 'manager',
          oldPermissions: ['user:read', 'user:write'],
          newPermissions: ['user:read', 'user:write', 'audit:read']
        },
        ipAddress: '192.168.1.100',
        level: 'warn',
        createdAt: '2024-08-24T08:30:00.000Z',
        user: {
          id: '1',
          email: 'admin@isguvenligi.com',
          fullName: 'System Administrator',
        },
        userId: '1',
      },
      {
        id: '5',
        action: 'login.failed',
        resource: 'auth',
        details: { 
          username: 'attacker@evil.com', 
          reason: 'Invalid credentials',
          attempts: 5
        },
        ipAddress: '203.0.113.1',
        userAgent: 'curl/7.68.0',
        level: 'error',
        createdAt: '2024-08-24T07:15:00.000Z',
        userId: 'unknown',
      },
    ];

    // Filter mock data
    let filteredLogs = mockLogs;

    if (searchQuery) {
      filteredLogs = filteredLogs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === levelFilter);
    }

    if (resourceFilter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.resource === resourceFilter);
    }

    setAuditLogs(filteredLogs);
    setTotal(filteredLogs.length);
    setTotalPages(Math.ceil(filteredLogs.length / 10));
    setLoading(false);
  }, [searchQuery, levelFilter, resourceFilter, currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'debug':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('auth')) {
      return <Activity className="h-4 w-4" />;
    }
    if (action.includes('created') || action.includes('updated') || action.includes('deleted')) {
      return <FileText className="h-4 w-4" />;
    }
    if (action.includes('failed') || action.includes('error')) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Eye className="h-4 w-4" />;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
          <h1 className="text-3xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            Sistem aktivitelerini takip edin ve denetim kayıtlarını inceleyin
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Rapor İndir
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Log</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hata Logları</p>
                <p className="text-2xl font-bold text-red-600">
                  {auditLogs.filter(l => l.level === 'error').length}
                </p>
              </div>
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uyarı Logları</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {auditLogs.filter(l => l.level === 'warn').length}
                </p>
              </div>
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugün</p>
                <p className="text-2xl font-bold text-green-600">
                  {auditLogs.filter(l => 
                    new Date(l.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-green-600" />
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
                placeholder="Log ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Seviye" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Seviyeler</SelectItem>
                  <SelectItem value="error">Hata</SelectItem>
                  <SelectItem value="warn">Uyarı</SelectItem>
                  <SelectItem value="info">Bilgi</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Kaynak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kaynaklar</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="oauth">OAuth</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih & Saat</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Aksiyon</TableHead>
                <TableHead>Kaynak</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>IP Adresi</TableHead>
                <TableHead>Detaylar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="text-sm text-gray-900">{formatDate(log.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {log.user ? (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs font-medium">
                              {getInitials(log.user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.user.fullName}</div>
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">Sistem / Bilinmeyen</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium">{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {log.resource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getLevelBadgeColor(log.level)}
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {log.ipAddress || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-blue-600 hover:text-blue-800">
                            Detayları Göster
                          </summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-gray-500">Detay yok</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {auditLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Log bulunamadı</h3>
                <p>Belirtilen kriterlere uygun audit log'u bulunmuyor.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Toplam {total} log'dan {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, total)} arası gösteriliyor
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