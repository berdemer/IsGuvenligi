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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../../auth/guards/permissions.guard';
// import { RequirePermissions, RequireRoles } from '../../auth/decorators/permissions.decorator';
import { RolesService } from './roles.service';
import { AuditService } from '../audit/audit.service';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  RoleQueryDto, 
  RoleResponseDto, 
  RolesListResponseDto 
} from './dto/role.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - Roles')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard)
// // @RequireRoles('admin', 'manager') // Temporarily disabled
export class AdminRolesController {
  private readonly logger = new Logger(AdminRolesController.name);

  constructor(
    private readonly rolesService: RolesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  // // @RequirePermissions('role:read') // Temporarily disabled
  @ApiOperation({ summary: 'Get roles with pagination and filters' })
  @ApiResponse({ status: HttpStatus.OK, type: RolesListResponseDto })
  async getRoles(
    @Query() query: RoleQueryDto,
    @CurrentUser() currentUser: any,
  ): Promise<RolesListResponseDto> {
    this.logger.log(`Getting roles with query: ${JSON.stringify(query)}`);
    
    const result = await this.rolesService.findAll(query);
    
    await this.auditService.log({
      action: 'roles.list',
      resource: 'role',
      userId: currentUser.sub,
      details: { query, count: result.total },
    });

    return result;
  }

  @Get('permissions')
  // // @RequirePermissions('role:read') // Temporarily disabled
  @ApiOperation({ summary: 'Get available permissions' })
  async getAvailablePermissions(@CurrentUser() currentUser: any) {
    this.logger.log('Getting available permissions');
    
    const permissions = await this.rolesService.getAvailablePermissions();
    
    await this.auditService.log({
      action: 'permissions.list',
      resource: 'role',
      userId: currentUser.sub,
      details: { count: permissions.length },
    });

    return { permissions };
  }

  @Get(':id')
  // // @RequirePermissions('role:read') // Temporarily disabled
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: RoleResponseDto })
  async getRoleById(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<RoleResponseDto> {
    this.logger.log(`Getting role by ID: ${id}`);
    
    const role = await this.rolesService.findById(id);
    
    await this.auditService.log({
      action: 'role.view',
      resource: 'role',
      resourceId: id,
      userId: currentUser.sub,
      details: { viewedRole: role.name },
    });

    return role;
  }

  @Post()
  // // @RequirePermissions('role:write') // Temporarily disabled
  // @RequireRoles('admin') // Only admins can create roles
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: HttpStatus.CREATED, type: RoleResponseDto })
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentUser() currentUser: any,
  ): Promise<RoleResponseDto> {
    this.logger.log(`Creating role: ${createRoleDto.name}`);
    
    const role = await this.rolesService.create(createRoleDto);
    
    await this.auditService.log({
      action: 'role.created',
      resource: 'role',
      resourceId: role.id,
      userId: currentUser.sub,
      details: {
        newRole: {
          name: role.name,
          displayName: role.displayName,
          permissions: role.permissions,
        },
      },
    });

    return role;
  }

  @Put(':id')
  // // @RequirePermissions('role:write') // Temporarily disabled
  // @RequireRoles('admin') // Only admins can update roles
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: HttpStatus.OK, type: RoleResponseDto })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() currentUser: any,
  ): Promise<RoleResponseDto> {
    this.logger.log(`Updating role: ${id}`);
    
    const oldRole = await this.rolesService.findById(id);
    const updatedRole = await this.rolesService.update(id, updateRoleDto);
    
    await this.auditService.log({
      action: 'role.updated',
      resource: 'role',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        before: {
          name: oldRole.name,
          displayName: oldRole.displayName,
          permissions: oldRole.permissions,
        },
        after: {
          name: updatedRole.name,
          displayName: updatedRole.displayName,
          permissions: updatedRole.permissions,
        },
        changes: updateRoleDto,
      },
    });

    return updatedRole;
  }

  @Delete(':id')
  // // @RequirePermissions('role:delete') // Temporarily disabled
  // @RequireRoles('admin') // Only admins can delete roles
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteRole(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Deleting role: ${id}`);
    
    const role = await this.rolesService.findById(id);
    await this.rolesService.delete(id);
    
    await this.auditService.log({
      action: 'role.deleted',
      resource: 'role',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        deletedRole: {
          name: role.name,
          displayName: role.displayName,
          permissions: role.permissions,
        },
      },
      level: 'warn',
    });

    return { message: 'Role deleted successfully' };
  }
}