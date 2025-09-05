import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Department types matching backend
export interface Department {
  id: string;
  name: string;
  description: string;
  managerEmail: string;
  employeeCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  managerEmail?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  managerEmail?: string;
  isActive?: boolean;
}

// Departments API service
export class DepartmentsAPI {
  private static baseUrl = '/admin/departments';

  // Get all departments
  static async findAll(): Promise<Department[]> {
    const response = await api.get<Department[]>(this.baseUrl);
    return response.data;
  }

  // Get department by ID
  static async findOne(id: string): Promise<Department> {
    const response = await api.get<Department>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Create new department
  static async create(departmentData: CreateDepartmentDto): Promise<Department> {
    const response = await api.post<Department>(this.baseUrl, departmentData);
    return response.data;
  }

  // Update department
  static async update(id: string, departmentData: UpdateDepartmentDto): Promise<Department> {
    const response = await api.patch<Department>(`${this.baseUrl}/${id}`, departmentData);
    return response.data;
  }

  // Delete department
  static async remove(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Delete multiple departments
  static async removeMultiple(ids: string[]): Promise<{ deleted: number; errors: string[] }> {
    const response = await api.delete<{ deleted: number; errors: string[] }>(
      `${this.baseUrl}?ids=${ids.join(',')}`
    );
    return response.data;
  }

  // Search departments
  static async search(query: string): Promise<Department[]> {
    const response = await api.get<Department[]>(`${this.baseUrl}/search`, {
      params: { q: query }
    });
    return response.data;
  }

  // Get active departments
  static async getActiveDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>(`${this.baseUrl}/active`);
    return response.data;
  }

  // Sync employee counts
  static async syncEmployeeCounts(): Promise<{ updated: number; departments: Array<{ name: string; oldCount: number; newCount: number }> }> {
    const response = await api.post<{ updated: number; departments: Array<{ name: string; oldCount: number; newCount: number }> }>(
      `${this.baseUrl}/sync-employee-counts`
    );
    return response.data;
  }
}

// Error handling wrapper
export const withErrorHandling = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(`API Error: ${message}`);
    }
    throw error;
  }
};