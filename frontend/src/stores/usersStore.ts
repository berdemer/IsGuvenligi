import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  department: string;
  phone: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  lastLoginAt?: string;
  loginCount?: number;
}

interface UsersState {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUser: (id: string) => User | undefined;
  initializeUsers: () => void;
}

// Default mock users
const defaultUsers: User[] = [
  {
    id: '1',
    email: 'admin@isguvenligi.com',
    firstName: 'System',
    lastName: 'Administrator',
    username: 'admin',
    department: 'IT Department',
    phone: '+90 532 123 4567',
    isActive: true,
    roles: ['admin'],
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z',
    fullName: 'System Administrator',
    lastLoginAt: '2024-08-24T09:30:00.000Z',
    loginCount: 145
  },
  {
    id: '2',
    email: 'manager@isguvenligi.com',
    firstName: 'Security',
    lastName: 'Manager',
    username: 'manager',
    department: 'Security Department',
    phone: '+90 532 123 4568',
    isActive: true,
    roles: ['manager'],
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z',
    fullName: 'Security Manager',
    lastLoginAt: '2024-08-23T16:45:00.000Z',
    loginCount: 78
  },
  {
    id: '3',
    email: 'viewer@isguvenligi.com',
    firstName: 'Read Only',
    lastName: 'User',
    username: 'viewer',
    department: 'Operations',
    phone: '+90 532 123 4569',
    isActive: false,
    roles: ['viewer'],
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-08-10T10:00:00.000Z',
    fullName: 'Read Only User',
    lastLoginAt: '2024-07-10T14:20:00.000Z',
    loginCount: 23
  }
];

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fullName: `${userData.firstName} ${userData.lastName}`,
          loginCount: 0
        };

        set((state) => ({
          users: [...state.users, newUser]
        }));
        
        return newUser;
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map(user => 
            user.id === id 
              ? { 
                  ...user, 
                  ...updates, 
                  updatedAt: new Date().toISOString(),
                  fullName: updates.firstName || updates.lastName 
                    ? `${updates.firstName || user.firstName} ${updates.lastName || user.lastName}`
                    : user.fullName
                }
              : user
          )
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter(user => user.id !== id)
        }));
      },

      getUser: (id) => {
        return get().users.find(user => user.id === id);
      },

      initializeUsers: () => {
        const currentUsers = get().users;
        if (currentUsers.length === 0) {
          set({ users: defaultUsers });
        }
      }
    }),
    {
      name: 'users-storage',
      partialize: (state) => ({
        users: state.users
      })
    }
  )
);