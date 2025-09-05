import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities/department.entity';
import { User } from '../../entities/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepository.find({
      relations: ['users'],
      order: { name: 'ASC' },
    });

    // Update employee counts based on active users
    for (const dept of departments) {
      const activeEmployeeCount = dept.users?.filter(user => user.isActive).length || 0;
      if (dept.employeeCount !== activeEmployeeCount) {
        dept.employeeCount = activeEmployeeCount;
        await this.departmentRepository.save(dept);
      }
    }

    return departments.map(dept => new DepartmentResponseDto(dept));
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Update employee count
    const activeEmployeeCount = department.users?.filter(user => user.isActive).length || 0;
    if (department.employeeCount !== activeEmployeeCount) {
      department.employeeCount = activeEmployeeCount;
      await this.departmentRepository.save(department);
    }

    return new DepartmentResponseDto(department);
  }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    // Check if department name already exists
    const existingDepartment = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name.trim() },
    });

    if (existingDepartment) {
      throw new ConflictException(`Department with name "${createDepartmentDto.name}" already exists`);
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      name: createDepartmentDto.name.trim(),
      employeeCount: 0,
    });

    const savedDepartment = await this.departmentRepository.save(department);
    return new DepartmentResponseDto(savedDepartment);
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check if new name already exists (excluding current department)
    if (updateDepartmentDto.name) {
      const trimmedName = updateDepartmentDto.name.trim();
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: trimmedName },
      });

      if (existingDepartment && existingDepartment.id !== id) {
        throw new ConflictException(`Department with name "${trimmedName}" already exists`);
      }
      updateDepartmentDto.name = trimmedName;
    }

    Object.assign(department, updateDepartmentDto);
    
    // Update employee count
    const activeEmployeeCount = department.users?.filter(user => user.isActive).length || 0;
    department.employeeCount = activeEmployeeCount;

    const updatedDepartment = await this.departmentRepository.save(department);
    return new DepartmentResponseDto(updatedDepartment);
  }

  async remove(id: string): Promise<void> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check if department has active users
    const activeUsers = department.users?.filter(user => user.isActive) || [];
    if (activeUsers.length > 0) {
      throw new ConflictException(
        `Cannot delete department "${department.name}" because it has ${activeUsers.length} active employee(s). ` +
        'Please reassign or deactivate users first.'
      );
    }

    await this.departmentRepository.remove(department);
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

    const departments = await this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.users', 'users')
      .where('department.name ILIKE :query', { query: `%${query.trim()}%` })
      .orWhere('department.description ILIKE :query', { query: `%${query.trim()}%` })
      .orWhere('department.managerEmail ILIKE :query', { query: `%${query.trim()}%` })
      .orderBy('department.name', 'ASC')
      .getMany();

    // Update employee counts
    for (const dept of departments) {
      const activeEmployeeCount = dept.users?.filter(user => user.isActive).length || 0;
      if (dept.employeeCount !== activeEmployeeCount) {
        dept.employeeCount = activeEmployeeCount;
        await this.departmentRepository.save(dept);
      }
    }

    return departments.map(dept => new DepartmentResponseDto(dept));
  }

  async getActiveDepartments(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepository.find({
      where: { isActive: true },
      relations: ['users'],
      order: { name: 'ASC' },
    });

    return departments.map(dept => new DepartmentResponseDto(dept));
  }

  async syncEmployeeCounts(): Promise<{ updated: number; departments: Array<{ name: string; oldCount: number; newCount: number }> }> {
    const departments = await this.departmentRepository.find({
      relations: ['users'],
    });

    const results = [];
    let updated = 0;

    for (const dept of departments) {
      const activeEmployeeCount = dept.users?.filter(user => user.isActive).length || 0;
      const oldCount = dept.employeeCount;

      if (dept.employeeCount !== activeEmployeeCount) {
        dept.employeeCount = activeEmployeeCount;
        await this.departmentRepository.save(dept);
        updated++;
      }

      results.push({
        name: dept.name,
        oldCount,
        newCount: activeEmployeeCount,
      });
    }

    return { updated, departments: results };
  }
}