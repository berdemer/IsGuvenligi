import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Department {
  id: string;
  name: string;
  description: string;
  managerEmail?: string;
  employeeCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentsState {
  departments: Department[];
  addDepartment: (department: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'employeeCount'>) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  getDepartment: (id: string) => Department | undefined;
  searchDepartments: (query: string) => Department[];
  getActiveDepartments: () => Department[];
  initializeDepartments: () => void;
  resetDepartments: () => void;
  incrementEmployeeCount: (departmentName: string) => void;
  decrementEmployeeCount: (departmentName: string) => void;
  updateEmployeeCount: (oldDepartmentName?: string, newDepartmentName?: string) => void;
  syncEmployeeCountsWithUsers: (users: any[]) => void;
}

// Default departments - sadece ilk kurulumda kullanılacak
const defaultDepartments: Department[] = [
  {
    id: 'dept-it-1',
    name: 'IT Department',
    description: 'Information Technology and System Administration',
    managerEmail: 'it.manager@isguvenligi.com',
    employeeCount: 12,
    isActive: true,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z'
  },
  {
    id: 'dept-security-2',
    name: 'Security Department',
    description: 'Information Security and Risk Management',
    managerEmail: 'security.manager@isguvenligi.com',
    employeeCount: 8,
    isActive: true,
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z'
  },
  {
    id: 'dept-operations-3',
    name: 'Operations',
    description: 'Business Operations and Process Management',
    managerEmail: 'ops.manager@isguvenligi.com',
    employeeCount: 15,
    isActive: true,
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z'
  },
  {
    id: 'dept-hr-4',
    name: 'Human Resources',
    description: 'Human Resource Management and Employee Relations',
    managerEmail: 'hr.manager@isguvenligi.com',
    employeeCount: 5,
    isActive: true,
    createdAt: '2024-02-15T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z'
  },
  {
    id: 'dept-finance-5',
    name: 'Finance',
    description: 'Financial Planning and Accounting',
    managerEmail: 'finance.manager@isguvenligi.com',
    employeeCount: 6,
    isActive: true,
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z'
  },
  {
    id: 'dept-marketing-6',
    name: 'Marketing',
    description: 'Digital Marketing and Brand Management',
    managerEmail: 'marketing.manager@isguvenligi.com',
    employeeCount: 4,
    isActive: false,
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-07-10T10:00:00.000Z'
  },
  {
    id: 'dept-engineering-7',
    name: 'Engineering',
    description: 'Software Development and Engineering',
    managerEmail: 'engineering.manager@isguvenligi.com',
    employeeCount: 18,
    isActive: true,
    createdAt: '2024-04-01T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z'
  },
  {
    id: 'dept-support-8',
    name: 'Support',
    description: 'Customer Support and Technical Assistance',
    managerEmail: 'support.manager@isguvenligi.com',
    employeeCount: 10,
    isActive: true,
    createdAt: '2024-04-15T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z'
  }
];

export const useDepartmentsStore = create<DepartmentsState>()(
  persist(
    (set, get) => ({
      departments: [],

      addDepartment: (departmentData) => {
        const newDepartment: Department = {
          ...departmentData,
          id: `dept_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          employeeCount: 0 // Yeni departman başlangıçta 0 çalışan
        };

        set((state) => ({
          departments: [...state.departments, newDepartment]
        }));
        
        console.log('✅ New department added to localStorage:', newDepartment);
        return newDepartment;
      },

      updateDepartment: (id, updates) => {
        set((state) => ({
          departments: state.departments.map(dept => 
            dept.id === id 
              ? { 
                  ...dept, 
                  ...updates, 
                  updatedAt: new Date().toISOString()
                }
              : dept
          )
        }));
        
        console.log('✅ Department updated in localStorage:', id);
      },

      deleteDepartment: (id) => {
        set((state) => ({
          departments: state.departments.filter(dept => dept.id !== id)
        }));
        
        console.log('✅ Department deleted from localStorage:', id);
      },

      getDepartment: (id) => {
        return get().departments.find(dept => dept.id === id);
      },

      searchDepartments: (query) => {
        const departments = get().departments;
        if (!query.trim()) return departments;
        
        const lowerQuery = query.toLowerCase();
        return departments.filter(dept => 
          dept.name.toLowerCase().includes(lowerQuery) ||
          dept.description.toLowerCase().includes(lowerQuery) ||
          dept.managerEmail?.toLowerCase().includes(lowerQuery)
        );
      },

      getActiveDepartments: () => {
        return get().departments.filter(dept => dept.isActive);
      },

      initializeDepartments: () => {
        const currentDepartments = get().departments;
        if (currentDepartments.length === 0) {
          console.log('🔄 Initializing default departments...');
          set({ departments: defaultDepartments });
        } else {
          console.log(`✅ ${currentDepartments.length} departments loaded from localStorage`);
        }
      },

      resetDepartments: () => {
        set({ departments: defaultDepartments });
        console.log('🔄 Departments reset to defaults');
      },

      incrementEmployeeCount: (departmentName) => {
        set((state) => ({
          departments: state.departments.map(dept => 
            dept.name === departmentName 
              ? { ...dept, employeeCount: dept.employeeCount + 1, updatedAt: new Date().toISOString() }
              : dept
          )
        }));
        console.log(`✅ Employee count incremented for department: ${departmentName}`);
      },

      decrementEmployeeCount: (departmentName) => {
        set((state) => ({
          departments: state.departments.map(dept => 
            dept.name === departmentName 
              ? { ...dept, employeeCount: Math.max(0, dept.employeeCount - 1), updatedAt: new Date().toISOString() }
              : dept
          )
        }));
        console.log(`✅ Employee count decremented for department: ${departmentName}`);
      },

      updateEmployeeCount: (oldDepartmentName, newDepartmentName) => {
        if (oldDepartmentName === newDepartmentName) return;
        
        if (oldDepartmentName) {
          get().decrementEmployeeCount(oldDepartmentName);
        }
        if (newDepartmentName) {
          get().incrementEmployeeCount(newDepartmentName);
        }
      },

      syncEmployeeCountsWithUsers: (users) => {
        // Count employees per department
        const departmentCounts: { [key: string]: number } = {};
        
        users.forEach((user: any) => {
          if (user.department && user.isActive) {
            // Departman ismini temizle (trim) - boşluk problemini çözer
            const cleanDepartmentName = user.department.trim();
            departmentCounts[cleanDepartmentName] = (departmentCounts[cleanDepartmentName] || 0) + 1;
          }
        });
        
        // Update departments with actual employee counts
        set((state) => ({
          departments: state.departments.map(dept => {
            // Departman ismini temizle (trim) - eşleştirme için
            const cleanDeptName = dept.name.trim();
            const newCount = departmentCounts[cleanDeptName] || 0;
            return {
              ...dept,
              employeeCount: newCount,
              updatedAt: new Date().toISOString()
            };
          })
        }));
        
        console.log('✅ Employee counts synced:', departmentCounts);
      }
    }),
    {
      name: 'departments-storage', // localStorage key
      partialize: (state) => ({
        departments: state.departments // Sadece departments array'ini persist et
      })
    }
  )
);