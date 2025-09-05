import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../../../entities/department.entity';

export class DepartmentResponseDto {
  @ApiProperty({ example: 'uuid-string', description: 'Department unique identifier' })
  id: string;

  @ApiProperty({ example: 'IT Department', description: 'Department name' })
  name: string;

  @ApiProperty({ example: 'Information Technology and System Administration', description: 'Department description' })
  description: string;

  @ApiProperty({ example: 'manager@company.com', description: 'Department manager email' })
  managerEmail: string;

  @ApiProperty({ example: 15, description: 'Number of employees in department' })
  employeeCount: number;

  @ApiProperty({ example: true, description: 'Whether department is active' })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Department creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Department last update date' })
  updatedAt: Date;

  constructor(department: Department) {
    this.id = department.id;
    this.name = department.name;
    this.description = department.description;
    this.managerEmail = department.managerEmail;
    this.employeeCount = department.employeeCount;
    this.isActive = department.isActive;
    this.createdAt = department.createdAt;
    this.updatedAt = department.updatedAt;
  }
}