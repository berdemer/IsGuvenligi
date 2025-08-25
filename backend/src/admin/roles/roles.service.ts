import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto, RoleResponseDto, RolesListResponseDto, PermissionDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(query: RoleQueryDto): Promise<RolesListResponseDto> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const queryBuilder = this.roleRepository.createQueryBuilder('role')
      .loadRelationCountAndMap('role.userCount', 'role.users');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(role.name LIKE :search OR role.displayName LIKE :search OR role.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    const validSortFields = ['name', 'displayName', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`role.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [roles, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: roles.map(role => this.toResponseDto(role)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async findById(id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return this.toResponseDto(role);
  }

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const { name, displayName, description, permissions = [] } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.roleRepository.create({
      name,
      displayName: displayName || name,
      description,
      permissions,
    });

    const savedRole = await this.roleRepository.save(role);
    return this.toResponseDto(savedRole);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    const { name, displayName, description, permissions } = updateRoleDto;

    // Check name uniqueness if name is being updated
    if (name && name !== role.name) {
      const existingRole = await this.roleRepository.findOne({ where: { name } });
      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
      role.name = name;
    }

    // Update other fields
    if (displayName !== undefined) role.displayName = displayName;
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;

    const savedRole = await this.roleRepository.save(role);
    return this.toResponseDto(savedRole);
  }

  async delete(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Check if role is assigned to any users
    if (role.users && role.users.length > 0) {
      throw new ConflictException('Cannot delete role that is assigned to users');
    }

    await this.roleRepository.remove(role);
  }

  async getAvailablePermissions(): Promise<PermissionDto[]> {
    // Define available permissions in the system
    const permissions: PermissionDto[] = [
      // User permissions
      { resource: 'user', action: 'read', permission: 'user:read', description: 'View users' },
      { resource: 'user', action: 'write', permission: 'user:write', description: 'Create and update users' },
      { resource: 'user', action: 'delete', permission: 'user:delete', description: 'Delete users' },
      
      // Role permissions
      { resource: 'role', action: 'read', permission: 'role:read', description: 'View roles' },
      { resource: 'role', action: 'write', permission: 'role:write', description: 'Create and update roles' },
      { resource: 'role', action: 'delete', permission: 'role:delete', description: 'Delete roles' },
      
      // OAuth permissions
      { resource: 'oauth', action: 'read', permission: 'oauth:read', description: 'View OAuth providers' },
      { resource: 'oauth', action: 'write', permission: 'oauth:write', description: 'Configure OAuth providers' },
      
      // Audit permissions
      { resource: 'audit', action: 'read', permission: 'audit:read', description: 'View audit logs' },
      
      // System permissions
      { resource: 'system', action: 'read', permission: 'system:read', description: 'View system information' },
      { resource: 'system', action: 'write', permission: 'system:write', description: 'Configure system settings' },
      
      // Settings permissions
      { resource: 'settings', action: 'read', permission: 'settings:read', description: 'View settings' },
      { resource: 'settings', action: 'write', permission: 'settings:write', description: 'Update settings' },
    ];

    return permissions.sort((a, b) => {
      if (a.resource === b.resource) {
        return a.action.localeCompare(b.action);
      }
      return a.resource.localeCompare(b.resource);
    });
  }

  private toResponseDto(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      userCount: (role as any).userCount || 0,
    };
  }
}