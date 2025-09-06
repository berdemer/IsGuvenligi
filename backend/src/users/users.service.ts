import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
// import { User } from '../entities/user.entity';
// import { Role } from '../entities/role.entity';
// import { Department } from '../entities/department.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Temporarily using mock data until database connection is fixed
  private mockUsers = [
    {
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@isguvenligi.com',
      firstName: 'System',
      lastName: 'Administrator',
      roles: ['admin'],
      groups: ['administrators'],
      department: null,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'manager-user-id',
      username: 'manager',
      email: 'manager@isguvenligi.com',
      firstName: 'Security',
      lastName: 'Manager',
      roles: ['manager'],
      groups: ['managers'],
      department: { id: 'dept-1', name: 'Security Department' },
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'test-user-id',
      username: 'test',
      email: 'test@isguvenligi.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['user'],
      groups: ['users'],
      department: { id: 'dept-2', name: 'Operations Department' },
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  // TODO: Uncomment when database connection is fixed
  // constructor(
  //   @InjectRepository(User) private userRepository: Repository<User>,
  //   @InjectRepository(Role) private roleRepository: Repository<Role>,
  //   @InjectRepository(Department) private departmentRepository: Repository<Department>,
  // ) {}

  async findAll(options?: any) {
    this.logger.debug('Finding all users with mock data');
    
    const cacheKey = `users:all:${JSON.stringify(options || {})}`;
    
    // Try to get from cache first
    let cachedUsers = await this.cacheManager.get(cacheKey);
    if (cachedUsers) {
      this.logger.debug('Retrieved users list from cache');
      return cachedUsers;
    }

    // If not in cache, prepare data and cache it
    const result = {
      data: this.mockUsers,
      total: this.mockUsers.length,
      page: 1,
      limit: 10
    };

    // Cache for 2 minutes
    await this.cacheManager.set(cacheKey, result, 120000);
    this.logger.debug('Cached users list');
    
    return result;
    
    // TODO: Replace with real database query when connection is fixed
    // const [users, total] = await this.userRepository.findAndCount({
    //   relations: ['roles', 'department'],
    //   ...options
    // });
    // return { data: users, total };
  }

  async findById(id: string) {
    this.logger.debug(`Finding user by id: ${id}`);
    
    const cacheKey = `user:${id}`;
    
    // Try to get from cache first
    let cachedUser = await this.cacheManager.get(cacheKey);
    if (cachedUser) {
      this.logger.debug(`Retrieved user ${id} from cache`);
      return cachedUser;
    }

    const user = this.mockUsers.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Cache the user for 5 minutes
    await this.cacheManager.set(cacheKey, user, 300000);
    this.logger.debug(`Cached user ${id}`);
    
    return user;

    // TODO: Replace with real database query
    // const user = await this.userRepository.findOne({
    //   where: { id },
    //   relations: ['roles', 'department']
    // });
    // if (!user) {
    //   throw new NotFoundException(`User with id ${id} not found`);
    // }
    // return user;
  }

  async findByUsername(username: string) {
    this.logger.debug(`Finding user by username: ${username}`);
    const user = this.mockUsers.find(u => u.username === username);
    return user || null;

    // TODO: Replace with real database query
    // return this.userRepository.findOne({
    //   where: { username },
    //   relations: ['roles', 'department']
    // });
  }

  async findByEmail(email: string) {
    this.logger.debug(`Finding user by email: ${email}`);
    const user = this.mockUsers.find(u => u.email === email);
    return user || null;

    // TODO: Replace with real database query
    // return this.userRepository.findOne({
    //   where: { email },
    //   relations: ['roles', 'department']
    // });
  }

  async create(userData: any) {
    this.logger.debug('Creating new user with mock data');
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockUsers.push(newUser);

    // Invalidate users list cache
    await this.invalidateUserCaches();
    
    return newUser;

    // TODO: Replace with real database operations
    // const user = this.userRepository.create(userData);
    // return this.userRepository.save(user);
  }

  async update(id: string, updateData: any) {
    this.logger.debug(`Updating user ${id} with mock data`);
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    this.mockUsers[userIndex] = { 
      ...this.mockUsers[userIndex], 
      ...updateData, 
      updatedAt: new Date() 
    };

    // Invalidate cache for this user and users list
    await this.invalidateUserCaches(id);
    
    return this.mockUsers[userIndex];

    // TODO: Replace with real database operations
    // await this.userRepository.update(id, updateData);
    // return this.findById(id);
  }

  async delete(id: string) {
    this.logger.debug(`Deleting user ${id} with mock data`);
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const deletedUser = this.mockUsers.splice(userIndex, 1)[0];

    // Invalidate cache for this user and users list
    await this.invalidateUserCaches(id);
    
    return deletedUser;

    // TODO: Replace with real database operations
    // const user = await this.findById(id);
    // await this.userRepository.delete(id);
    // return user;
  }

  async getUsersByDepartment(departmentId: string) {
    this.logger.debug(`Finding users by department: ${departmentId}`);
    return this.mockUsers.filter(u => u.department?.id === departmentId);

    // TODO: Replace with real database query
    // return this.userRepository.find({
    //   where: { department: { id: departmentId } },
    //   relations: ['roles', 'department']
    // });
  }

  async getUsersByRole(roleName: string) {
    this.logger.debug(`Finding users by role: ${roleName}`);
    return this.mockUsers.filter(u => u.roles.includes(roleName));

    // TODO: Replace with real database query
    // return this.userRepository.find({
    //   where: { roles: { name: roleName } },
    //   relations: ['roles', 'department']
    // });
  }

  async updateLastLogin(userId: string) {
    this.logger.debug(`Updating last login for user: ${userId}`);
    const user = this.mockUsers.find(u => u.id === userId);
    if (user) {
      user.updatedAt = new Date();
    }

    // Invalidate user cache after login update
    await this.cacheManager.del(`user:${userId}`);

    // TODO: Replace with real database operations
    // await this.userRepository.update(userId, { 
    //   lastLoginAt: new Date() 
    // });
  }

  private async invalidateUserCaches(userId?: string): Promise<void> {
    this.logger.debug('Invalidating user caches');
    
    // Clear specific user cache if provided
    if (userId) {
      await this.cacheManager.del(`user:${userId}`);
    }
    
    // Clear common users list cache patterns
    // Since we can't reset the entire cache, we'll clear known patterns
    const commonCacheKeys = [
      'users:all:{}',
      'users:all:{"page":1}',
      'users:all:{"limit":10}',
      'users:all:{"page":1,"limit":10}',
    ];
    
    for (const key of commonCacheKeys) {
      await this.cacheManager.del(key);
    }
    
    this.logger.debug('User caches invalidated');
  }
}