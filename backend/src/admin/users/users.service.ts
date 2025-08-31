import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto, UsersListResponseDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(query: UserQueryDto): Promise<UsersListResponseDto> {
    const { page = 1, limit = 10, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.fullName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply role filter
    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    // Apply status filter
    if (status) {
      const isActive = status === 'active';
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Apply sorting
    const validSortFields = ['email', 'fullName', 'createdAt', 'updatedAt', 'isActive'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: users.map(user => this.toResponseDto(user)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toResponseDto(user);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, fullName, password, roleIds, isActive = true } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get roles if provided
    let roles: Role[] = [];
    if (roleIds && roleIds.length > 0) {
      roles = await this.roleRepository.findBy({ id: In(roleIds) });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }
    }

    const user = this.userRepository.create({
      email,
      firstName: fullName.split(' ')[0] || '',
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      password: hashedPassword,
      isActive,
    });

    user.roles = roles;
    const savedUser = await this.userRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { email, fullName, password, roleIds, isActive } = updateUserDto;

    // Check email uniqueness if email is being updated
    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      user.email = email;
    }

    // Update basic fields
    if (fullName !== undefined) {
      const nameParts = fullName.split(' ');
      user.firstName = nameParts[0] || '';
      user.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (isActive !== undefined) user.isActive = isActive;

    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    // Update roles if provided
    if (roleIds !== undefined) {
      if (roleIds.length === 0) {
        user.roles = [];
      } else {
        const roles = await this.roleRepository.findBy({ id: In(roleIds) });
        if (roles.length !== roleIds.length) {
          throw new BadRequestException('One or more role IDs are invalid');
        }
        user.roles = roles;
      }
    }

    const savedUser = await this.userRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
  }

  async updateStatus(id: string, isActive: boolean): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = isActive;
    const savedUser = await this.userRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  async updateRoles(id: string, roleIds: string[]): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (roleIds.length === 0) {
      user.roles = [];
    } else {
      const roles = await this.roleRepository.findBy({ id: In(roleIds) });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }
      user.roles = roles;
    }

    const savedUser = await this.userRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
      roles: user.roles?.map(role => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName || role.name,
      })),
    };
  }
}