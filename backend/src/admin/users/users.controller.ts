import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions, RequireRoles } from '../../auth/decorators/permissions.decorator';
import { UsersService } from './users.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto } from './dto/user.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
// // @RequireRoles('admin', 'manager') // Temporarily disabled
export class AdminUsersController {
  private readonly logger = new Logger(AdminUsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  // @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Get users with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
  async getUsers(
    @Query() query: UserQueryDto,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Getting users with query: ${JSON.stringify(query)}`);
    
    const result = await this.usersService.findAll(query);
    
    // Log the action
    await this.auditService.log({
      action: 'users.list',
      resource: 'user',
      userId: currentUser.sub,
      details: { query, count: result.total },
      ipAddress: '', // TODO: Get from request
    });

    return result;
  }

  @Get(':id')
  // @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async getUserById(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    this.logger.log(`Getting user by ID: ${id}`);
    
    const user = await this.usersService.findById(id);
    
    await this.auditService.log({
      action: 'user.view',
      resource: 'user',
      resourceId: id,
      userId: currentUser.sub,
      details: { viewedUser: user.email },
    });

    return user;
  }

  @Post()
  // @RequirePermissions('user:write')
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponseDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    this.logger.log(`Creating user: ${createUserDto.email}`);
    
    const user = await this.usersService.create(createUserDto);
    
    await this.auditService.log({
      action: 'user.created',
      resource: 'user',
      resourceId: user.id,
      userId: currentUser.sub,
      details: {
        newUser: {
          email: user.email,
          name: user.fullName,
          roles: user.roles?.map(r => r.name),
        },
      },
    });

    return user;
  }

  @Put(':id')
  // @RequirePermissions('user:write')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating user: ${id}`);
    
    const oldUser = await this.usersService.findById(id);
    const updatedUser = await this.usersService.update(id, updateUserDto);
    
    await this.auditService.log({
      action: 'user.updated',
      resource: 'user',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        before: {
          email: oldUser.email,
          isActive: oldUser.isActive,
          roles: oldUser.roles?.map(r => r.name),
        },
        after: {
          email: updatedUser.email,
          isActive: updatedUser.isActive,
          roles: updatedUser.roles?.map(r => r.name),
        },
        changes: updateUserDto,
      },
    });

    return updatedUser;
  }

  @Delete(':id')
  // @RequirePermissions('user:delete')
  // @RequireRoles('admin') // Only admins can delete users
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Deleting user: ${id}`);
    
    const user = await this.usersService.findById(id);
    await this.usersService.delete(id);
    
    await this.auditService.log({
      action: 'user.deleted',
      resource: 'user',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        deletedUser: {
          email: user.email,
          name: user.fullName,
        },
      },
      level: 'warn',
    });

    return { message: 'User deleted successfully' };
  }

  @Put(':id/activate')
  // @RequirePermissions('user:write')
  @ApiOperation({ summary: 'Activate user' })
  async activateUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Activating user: ${id}`);
    
    const user = await this.usersService.updateStatus(id, true);
    
    await this.auditService.log({
      action: 'user.activated',
      resource: 'user',
      resourceId: id,
      userId: currentUser.sub,
      details: { activatedUser: user.email },
    });

    return { message: 'User activated successfully', user };
  }

  @Put(':id/deactivate')
  // @RequirePermissions('user:write')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivateUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Deactivating user: ${id}`);
    
    const user = await this.usersService.updateStatus(id, false);
    
    await this.auditService.log({
      action: 'user.deactivated',
      resource: 'user',
      resourceId: id,
      userId: currentUser.sub,
      details: { deactivatedUser: user.email },
      level: 'warn',
    });

    return { message: 'User deactivated successfully', user };
  }

  @Put(':id/roles')
  // @RequirePermissions('role:write')
  // @RequireRoles('admin') // Only admins can assign roles
  @ApiOperation({ summary: 'Update user roles' })
  async updateUserRoles(
    @Param('id') id: string,
    @Body() body: { roleIds: string[] },
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Updating roles for user: ${id}`);
    
    const oldUser = await this.usersService.findById(id);
    const updatedUser = await this.usersService.updateRoles(id, body.roleIds);
    
    await this.auditService.log({
      action: 'user.roles_updated',
      resource: 'user',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        user: updatedUser.email,
        oldRoles: oldUser.roles?.map(r => r.name) || [],
        newRoles: updatedUser.roles?.map(r => r.name) || [],
      },
    });

    return { message: 'User roles updated successfully', user: updatedUser };
  }
}