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
          
          // TEMPORARY: Mock login for development (since backend has compilation issues)
          const mockUsers: { [key: string]: any } = {
            'admin': {
              id: 'admin-user-id',
              username: 'admin',
              email: 'admin@isguvenligi.com',
              firstName: 'System',
              lastName: 'Administrator',
              fullName: 'System Administrator',
              roles: ['admin'],
              groups: ['administrators']
            },
            'manager': {
              id: 'manager-user-id',
              username: 'manager',
              email: 'manager@isguvenligi.com',
              firstName: 'Security',
              lastName: 'Manager',
              fullName: 'Security Manager',
              roles: ['manager'],
              groups: ['managers']
            },
            'test': {
              id: 'test-user-id',
              username: 'test',
              email: 'test@isguvenligi.com',
              firstName: 'Test',
              lastName: 'User',
              fullName: 'Test User',
              roles: ['user'],
              groups: ['users']
            }
          };

          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Check if user exists and password is correct
          const mockUser = mockUsers[username];
          if (!mockUser) {
            throw new Error('Kullanıcı bulunamadı');
          }
          
          // Accept any password for development (or specific password)
          if (password !== 'password1234' && password !== 'admin' && password !== '123456') {
            throw new Error('Geçersiz şifre');
          }

          // Mock token storage
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', 'mock-jwt-token-' + Date.now());
            localStorage.setItem('refresh_token', 'mock-refresh-token');
          }
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`Hoş geldiniz, ${mockUser.firstName || mockUser.username}!`);
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
          
          // TEMPORARY: Mock logout for development (since backend has compilation issues)
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          
          // Clear mock tokens and persist storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('auth-storage'); // Clear Zustand persist storage
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

          // TEMPORARY: Mock token validation
          if (token.startsWith('mock-jwt-token')) {
            // Extract user data from persisted state or use default admin
            const currentUser = get().user || {
              id: 'admin-user-id',
              username: 'admin',
              email: 'admin@isguvenligi.com',
              firstName: 'System',
              lastName: 'Administrator',
              fullName: 'System Administrator',
              roles: ['admin'],
              groups: ['administrators']
            };
            
            set({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
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