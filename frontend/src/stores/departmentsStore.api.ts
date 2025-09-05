import { create } from 'zustand';
import { DepartmentsAPI, Department, CreateDepartmentDto, UpdateDepartmentDto, withErrorHandling } from '@/services/departments.api';

interface DepartmentsApiState {
  departments: Department[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDepartments: () => Promise<void>;
  fetchDepartment: (id: string) => Promise<Department | null>;
  createDepartment: (department: CreateDepartmentDto) => Promise<Department | null>;
  updateDepartment: (id: string, updates: UpdateDepartmentDto) => Promise<Department | null>;
  deleteDepartment: (id: string) => Promise<boolean>;
  deleteMultipleDepartments: (ids: string[]) => Promise<{ deleted: number; errors: string[] }>;
  searchDepartments: (query: string) => Promise<void>;
  getActiveDepartments: () => Promise<Department[]>;
  syncEmployeeCounts: () => Promise<void>;
  
  // Helper actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useDepartmentsApiStore = create<DepartmentsApiState>()((set, get) => ({
  departments: [],
  loading: false,
  error: null,

  // Clear error
  clearError: () => set({ error: null }),

  // Set loading state
  setLoading: (loading: boolean) => set({ loading }),

  // Fetch all departments
  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const departments = await withErrorHandling(() => DepartmentsAPI.findAll());
      set({ departments, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch departments',
        loading: false 
      });
    }
  },

  // Fetch single department
  fetchDepartment: async (id: string) => {
    set({ error: null });
    try {
      const department = await withErrorHandling(() => DepartmentsAPI.findOne(id));
      return department;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch department' });
      return null;
    }
  },

  // Create department
  createDepartment: async (departmentData: CreateDepartmentDto) => {
    set({ loading: true, error: null });
    try {
      const newDepartment = await withErrorHandling(() => DepartmentsAPI.create(departmentData));
      set(state => ({ 
        departments: [...state.departments, newDepartment],
        loading: false 
      }));
      return newDepartment;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create department',
        loading: false 
      });
      return null;
    }
  },

  // Update department
  updateDepartment: async (id: string, updates: UpdateDepartmentDto) => {
    set({ error: null });
    try {
      const updatedDepartment = await withErrorHandling(() => DepartmentsAPI.update(id, updates));
      set(state => ({ 
        departments: state.departments.map(dept => 
          dept.id === id ? updatedDepartment : dept
        )
      }));
      return updatedDepartment;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update department' });
      return null;
    }
  },

  // Delete department
  deleteDepartment: async (id: string) => {
    set({ error: null });
    try {
      await withErrorHandling(() => DepartmentsAPI.remove(id));
      set(state => ({ 
        departments: state.departments.filter(dept => dept.id !== id)
      }));
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete department' });
      return false;
    }
  },

  // Delete multiple departments
  deleteMultipleDepartments: async (ids: string[]) => {
    set({ error: null });
    try {
      const result = await withErrorHandling(() => DepartmentsAPI.removeMultiple(ids));
      
      // Remove successfully deleted departments from state
      const successfullyDeleted = ids.filter(id => 
        !result.errors.some(error => error.startsWith(id))
      );
      
      set(state => ({ 
        departments: state.departments.filter(dept => !successfullyDeleted.includes(dept.id))
      }));
      
      if (result.errors.length > 0) {
        set({ error: `Some departments could not be deleted: ${result.errors.join(', ')}` });
      }
      
      return result;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete departments' });
      return { deleted: 0, errors: ['Failed to delete departments'] };
    }
  },

  // Search departments
  searchDepartments: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const departments = await withErrorHandling(() => DepartmentsAPI.search(query));
      set({ departments, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search departments',
        loading: false 
      });
    }
  },

  // Get active departments
  getActiveDepartments: async () => {
    try {
      const departments = await withErrorHandling(() => DepartmentsAPI.getActiveDepartments());
      return departments;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to get active departments' });
      return [];
    }
  },

  // Sync employee counts
  syncEmployeeCounts: async () => {
    set({ error: null });
    try {
      const result = await withErrorHandling(() => DepartmentsAPI.syncEmployeeCounts());
      console.log('✅ Employee counts synced:', result);
      
      // Refresh departments to get updated counts
      await get().fetchDepartments();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sync employee counts' });
    }
  }
}));