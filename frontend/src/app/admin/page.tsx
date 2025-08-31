'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, UserCog, Activity, Settings, Globe, Key, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminHomePage() {
  const router = useRouter();

  // Admin ana sayfasından otomatik olarak dashboard'a yönlendir
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  // Fallback UI (yönlendirme gerçekleşene kadar gösterilir)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Admin paneline yönlendiriliyor...</p>
      </div>
    </div>
  );
}