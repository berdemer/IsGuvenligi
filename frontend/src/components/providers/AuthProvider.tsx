'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isLoading } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return <>{children}</>;
}