'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  Settings, 
  Activity, 
  Bell,
  ArrowRight,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // Debug: User bilgilerini konsola yazdıralım
    console.log('Current user:', user);
    console.log('User roles:', user?.roles);

    // TEMPORARY FIX: Admin username kontrolü
    if (user?.username === 'admin') {
      console.log('Admin user detected, redirecting to admin panel');
      router.replace('/admin/dashboard');
      return;
    }

    // Admin veya manager yetkisi varsa admin paneline yönlendir
    const hasAdminAccess = user?.roles?.some(role => {
      const roleName = typeof role === 'string' ? role : role?.name;
      return ['admin', 'manager'].includes(roleName?.toLowerCase());
    });

    if (hasAdminAccess) {
      console.log('User has admin access, redirecting to admin panel');
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin yetkisi kontrol edelim
  const hasAdminAccess = user?.roles?.some(role => {
    const roleName = typeof role === 'string' ? role : role?.name;
    return ['admin', 'manager'].includes(roleName?.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Hoş geldiniz, {user.firstName || user.fullName || user.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              İş Güvenliği Sistemi Dashboard
            </p>
          </div>
          {hasAdminAccess && (
            <Button 
              onClick={() => router.push('/admin/dashboard')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Debug Card - Geçici olarak user bilgilerini gösterelim */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Debug Bilgileri (Geliştirme)
            </CardTitle>
            <CardDescription>
              Mevcut kullanıcı bilgileri ve yetkileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Kullanıcı ID:</p>
                <p className="text-sm text-gray-600">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email:</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Kullanıcı Adı:</p>
                <p className="text-sm text-gray-600">{user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Roller:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role, index) => {
                      const roleName = typeof role === 'string' ? role : role?.name;
                      return (
                        <Badge key={index} variant="outline">
                          {roleName}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500">Rol bulunamadı</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Admin Yetkisi:</p>
                <Badge variant={hasAdminAccess ? 'default' : 'secondary'}>
                  {hasAdminAccess ? 'VAR' : 'YOK'}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Raw User Data:</p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Kullanıcı Profili
              </CardTitle>
              <CardDescription>
                Profil bilgilerinizi görüntüleyin ve güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Profili Görüntüle
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Aktivite Geçmişi
              </CardTitle>
              <CardDescription>
                Son aktivitelerinizi görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Geçmişi Görüntüle
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Bildirimler
              </CardTitle>
              <CardDescription>
                Yeni bildirimlerinizi kontrol edin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Bildirimleri Gör
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel Erişimi */}
        {hasAdminAccess && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Shield className="h-5 w-5" />
                Yönetici Paneli
              </CardTitle>
              <CardDescription className="text-red-700">
                Sistem yöneticisi olarak admin paneline erişebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/admin/users')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Kullanıcı Yönetimi
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/admin/audit')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Audit Logları
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}