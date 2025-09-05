import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

// Mock department data for testing without database
const mockDepartments = [
  {
    id: 'dept-1',
    name: 'IT Department',
    description: 'Information Technology and System Administration',
    managerEmail: 'it.manager@isguvenligi.com',
    employeeCount: 12,
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00.000Z'),
    updatedAt: new Date('2024-08-24T10:00:00.000Z'),
  },
  {
    id: 'dept-2',
    name: 'Security Department',
    description: 'Information Security and Risk Management',
    managerEmail: 'security.manager@isguvenligi.com',
    employeeCount: 8,
    isActive: true,
    createdAt: new Date('2024-01-20T10:00:00.000Z'),
    updatedAt: new Date('2024-08-24T10:00:00.000Z'),
  },
  {
    id: 'dept-3',
    name: 'Operations',
    description: 'Business Operations and Process Management',
    managerEmail: 'ops.manager@isguvenligi.com',
    employeeCount: 15,
    isActive: true,
    createdAt: new Date('2024-02-01T10:00:00.000Z'),
    updatedAt: new Date('2024-08-24T10:00:00.000Z'),
  },
];

@Injectable()
export class DepartmentsMockService {
  private departments = [...mockDepartments];

  async findAll(): Promise<DepartmentResponseDto[]> {
    return this.departments.map(dept => new DepartmentResponseDto(dept as any));
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const department = this.departments.find(d => d.id === id);
    if (!department) {
      throw new Error(`Department with ID ${id} not found`);
    }
    return new DepartmentResponseDto(department as any);
  }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const newDept = {
      id: `dept-${Date.now()}`,
      name: createDepartmentDto.name.trim(),
      description: createDepartmentDto.description || '',
      managerEmail: createDepartmentDto.managerEmail || '',
      employeeCount: 0,
      isActive: createDepartmentDto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.departments.push(newDept);
    return new DepartmentResponseDto(newDept as any);
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const deptIndex = this.departments.findIndex(d => d.id === id);
    if (deptIndex === -1) {
      throw new Error(`Department with ID ${id} not found`);
    }

    this.departments[deptIndex] = {
      ...this.departments[deptIndex],
      ...updateDepartmentDto,
      name: updateDepartmentDto.name ? updateDepartmentDto.name.trim() : this.departments[deptIndex].name,
      updatedAt: new Date(),
    };

    return new DepartmentResponseDto(this.departments[deptIndex] as any);
  }

  async remove(id: string): Promise<void> {
    const deptIndex = this.departments.findIndex(d => d.id === id);
    if (deptIndex === -1) {
      throw new Error(`Department with ID ${id} not found`);
    }
    this.departments.splice(deptIndex, 1);
  }

  async removeMultiple(ids: string[]): Promise<{ deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let deleted = 0;

    for (const id of ids) {
      try {
        await this.remove(id);
        deleted++;
      } catch (error) {
        errors.push(`${id}: ${error.message}`);
      }
    }

    return { deleted, errors };
  }

  async search(query: string): Promise<DepartmentResponseDto[]> {
    if (!query.trim()) {
      return this.findAll();
    }

    const filtered = this.departments.filter(dept =>
      dept.name.toLowerCase().includes(query.toLowerCase()) ||
      dept.description.toLowerCase().includes(query.toLowerCase()) ||
      dept.managerEmail.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map(dept => new DepartmentResponseDto(dept as any));
  }

  async getActiveDepartments(): Promise<DepartmentResponseDto[]> {
    const active = this.departments.filter(dept => dept.isActive);
    return active.map(dept => new DepartmentResponseDto(dept as any));
  }

  async syncEmployeeCounts(): Promise<{ updated: number; departments: Array<{ name: string; oldCount: number; newCount: number }> }> {
    // Mock sync - just return current state
    return {
      updated: 0,
      departments: this.departments.map(d => ({
        name: d.name,
        oldCount: d.employeeCount,
        newCount: d.employeeCount
      }))
    };
  }
}