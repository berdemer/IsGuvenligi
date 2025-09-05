import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  groups: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Call backend API
          const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Giriş başarısız');
          }

          const data = await response.json();
          
          // Store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) {
              localStorage.setItem('refresh_token', data.refresh_token);
            }
            // Set cookie for middleware access
            document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; secure; samesite=strict`;
          }
          
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`Hoş geldiniz, ${data.user.firstName || data.user.username}!`);
        } catch (error: any) {
          const errorMessage = error.message || 
                              'Giriş işlemi başarısız. Lütfen bilgilerinizi kontrol edin.';
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
          
          // Call backend logout API if token exists
          if (token) {
            try {
              await fetch('http://localhost:3001/auth/logout', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
            } catch (error) {
              console.warn('Logout API call failed, continuing with local logout:', error);
            }
          }
          
          // Clear tokens and persist storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('auth-storage'); // Clear Zustand persist storage
            // Clear cookie
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          toast.success('Başarıyla çıkış yaptınız');
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        } catch (error: any) {
          console.error('Logout error:', error);
          
          // Force logout even if API call fails
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth/login';
          }
        }
      },

      logoutAll: async () => {
        try {
          set({ isLoading: true });
          
          // TEMPORARY: Mock logout all for development (since backend has compilation issues)
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          
          // Clear mock tokens and persist storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('auth-storage'); // Clear Zustand persist storage
            // Clear cookie
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          toast.success('Tüm oturumlardan çıkış yaptınız');
          
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        } catch (error: any) {
          console.error('Logout all error:', error);
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth/login';
          }
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });

          const token = typeof window !== 'undefined' ? 
                       localStorage.getItem('access_token') : null;

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            return;
          }

          // Call backend to validate token and get user info
          try {
            const response = await fetch('http://localhost:3001/auth/profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const userData = await response.json();
              
              // Ensure cookie is set for middleware
              if (typeof window !== 'undefined') {
                document.cookie = `access_token=${token}; path=/; max-age=86400; secure; samesite=strict`;
              }
              
              set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // Token is invalid, clear it
              throw new Error('Invalid token');
            }
          } catch (error) {
            // Token validation failed, clear auth state
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            
            // Clear invalid token
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            }
          }
        } catch (error: any) {
          console.error('Auth check error:', error);
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      },

      refreshProfile: async () => {
        try {
          const profile = await apiService.getProfile();
          
          set((state) => ({
            user: { ...state.user, ...profile },
          }));
        } catch (error: any) {
          console.error('Profile refresh error:', error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks for role/permission checking
export const useHasRole = (role: string) => {
  const user = useAuth((state) => state.user);
  return user?.roles?.includes(role) || false;
};

export const useHasAnyRole = (roles: string[]) => {
  const user = useAuth((state) => state.user);
  return roles.some(role => user?.roles?.includes(role)) || false;
};

export const useIsAdmin = () => {
  return useHasRole('admin');
};

export const useIsManager = () => {
  return useHasAnyRole(['admin', 'manager']);
};

export const useIsSafetyOfficer = () => {
  return useHasAnyRole(['admin', 'manager', 'safety-officer']);
};