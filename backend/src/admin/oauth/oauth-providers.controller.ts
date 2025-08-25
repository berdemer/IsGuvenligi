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
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions, RequireRoles } from '../../auth/decorators/permissions.decorator';
import { OAuthProvidersService } from './oauth-providers.service';
import { AuditService } from '../audit/audit.service';
import { 
  CreateOAuthProviderDto, 
  UpdateOAuthProviderDto, 
  OAuthProviderQueryDto, 
  OAuthProviderResponseDto, 
  OAuthProvidersListResponseDto,
  TestOAuthProviderDto
} from './dto/oauth-provider.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - OAuth Providers')
@Controller('admin/oauth-providers')
@UseGuards(JwtAuthGuard)
// // @RequireRoles('admin', 'manager') // Temporarily disabled
export class AdminOAuthProvidersController {
  private readonly logger = new Logger(AdminOAuthProvidersController.name);

  constructor(
    private readonly oauthProvidersService: OAuthProvidersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  // @RequirePermissions('oauth:read')
  @ApiOperation({ summary: 'Get OAuth providers with pagination and filters' })
  @ApiResponse({ status: HttpStatus.OK, type: OAuthProvidersListResponseDto })
  async getProviders(
    @Query() query: OAuthProviderQueryDto,
    @CurrentUser() currentUser: any,
  ): Promise<OAuthProvidersListResponseDto> {
    this.logger.log(`Getting OAuth providers with query: ${JSON.stringify(query)}`);
    
    const result = await this.oauthProvidersService.findAll(query);
    
    await this.auditService.log({
      action: 'oauth.providers.list',
      resource: 'oauth',
      userId: currentUser.sub,
      details: { query, count: result.total },
    });

    return result;
  }

  @Get('enabled')
  // @RequirePermissions('oauth:read')
  @ApiOperation({ summary: 'Get enabled OAuth providers' })
  async getEnabledProviders(@CurrentUser() currentUser: any) {
    this.logger.log('Getting enabled OAuth providers');
    
    const providers = await this.oauthProvidersService.getEnabledProviders();
    
    await this.auditService.log({
      action: 'oauth.providers.list_enabled',
      resource: 'oauth',
      userId: currentUser.sub,
      details: { count: providers.length },
    });

    return { providers };
  }

  @Get(':id')
  // @RequirePermissions('oauth:read')
  @ApiOperation({ summary: 'Get OAuth provider by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OAuthProviderResponseDto })
  async getProviderById(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<OAuthProviderResponseDto> {
    this.logger.log(`Getting OAuth provider by ID: ${id}`);
    
    const provider = await this.oauthProvidersService.findById(id);
    
    await this.auditService.log({
      action: 'oauth.provider.view',
      resource: 'oauth',
      resourceId: id,
      userId: currentUser.sub,
      details: { viewedProvider: provider.name },
    });

    return provider;
  }

  @Post()
  // @RequirePermissions('oauth:write')
  // @RequireRoles('admin') // Only admins can create OAuth providers
  @ApiOperation({ summary: 'Create new OAuth provider' })
  @ApiResponse({ status: HttpStatus.CREATED, type: OAuthProviderResponseDto })
  async createProvider(
    @Body() createOAuthProviderDto: CreateOAuthProviderDto,
    @CurrentUser() currentUser: any,
  ): Promise<OAuthProviderResponseDto> {
    this.logger.log(`Creating OAuth provider: ${createOAuthProviderDto.name}`);
    
    const provider = await this.oauthProvidersService.create(createOAuthProviderDto);
    
    await this.auditService.log({
      action: 'oauth.provider.created',
      resource: 'oauth',
      resourceId: provider.id,
      userId: currentUser.sub,
      details: {
        newProvider: {
          name: provider.name,
          displayName: provider.displayName,
          isEnabled: provider.isEnabled,
        },
      },
    });

    return provider;
  }

  @Put(':id')
  // @RequirePermissions('oauth:write')
  // @RequireRoles('admin') // Only admins can update OAuth providers
  @ApiOperation({ summary: 'Update OAuth provider' })
  @ApiResponse({ status: HttpStatus.OK, type: OAuthProviderResponseDto })
  async updateProvider(
    @Param('id') id: string,
    @Body() updateOAuthProviderDto: UpdateOAuthProviderDto,
    @CurrentUser() currentUser: any,
  ): Promise<OAuthProviderResponseDto> {
    this.logger.log(`Updating OAuth provider: ${id}`);
    
    const oldProvider = await this.oauthProvidersService.findById(id);
    const updatedProvider = await this.oauthProvidersService.update(id, updateOAuthProviderDto);
    
    await this.auditService.log({
      action: 'oauth.provider.updated',
      resource: 'oauth',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        before: {
          name: oldProvider.name,
          displayName: oldProvider.displayName,
          isEnabled: oldProvider.isEnabled,
        },
        after: {
          name: updatedProvider.name,
          displayName: updatedProvider.displayName,
          isEnabled: updatedProvider.isEnabled,
        },
        changes: updateOAuthProviderDto,
      },
    });

    return updatedProvider;
  }

  @Delete(':id')
  // @RequirePermissions('oauth:write')
  // @RequireRoles('admin') // Only admins can delete OAuth providers
  @ApiOperation({ summary: 'Delete OAuth provider' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteProvider(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Deleting OAuth provider: ${id}`);
    
    const provider = await this.oauthProvidersService.findById(id);
    await this.oauthProvidersService.delete(id);
    
    await this.auditService.log({
      action: 'oauth.provider.deleted',
      resource: 'oauth',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        deletedProvider: {
          name: provider.name,
          displayName: provider.displayName,
        },
      },
      level: 'warn',
    });

    return { message: 'OAuth provider deleted successfully' };
  }

  @Put(':id/toggle')
  // @RequirePermissions('oauth:write')
  // @RequireRoles('admin') // Only admins can toggle OAuth providers
  @ApiOperation({ summary: 'Toggle OAuth provider enabled status' })
  @ApiResponse({ status: HttpStatus.OK, type: OAuthProviderResponseDto })
  async toggleProvider(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<OAuthProviderResponseDto> {
    this.logger.log(`Toggling OAuth provider: ${id}`);
    
    const oldProvider = await this.oauthProvidersService.findById(id);
    const updatedProvider = await this.oauthProvidersService.toggleEnabled(id);
    
    await this.auditService.log({
      action: updatedProvider.isEnabled ? 'oauth.provider.enabled' : 'oauth.provider.disabled',
      resource: 'oauth',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        provider: updatedProvider.name,
        oldStatus: oldProvider.isEnabled,
        newStatus: updatedProvider.isEnabled,
      },
      level: 'info',
    });

    return updatedProvider;
  }

  @Post(':id/test')
  // @RequirePermissions('oauth:write')
  // @RequireRoles('admin') // Only admins can test OAuth providers
  @ApiOperation({ summary: 'Test OAuth provider connection' })
  async testProvider(
    @Param('id') id: string,
    @Body() testData: TestOAuthProviderDto,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Testing OAuth provider: ${id}`);
    
    const result = await this.oauthProvidersService.testConnection(id, testData);
    
    await this.auditService.log({
      action: 'oauth.provider.tested',
      resource: 'oauth',
      resourceId: id,
      userId: currentUser.sub,
      details: {
        testResult: result.success,
        message: result.message,
      },
      level: result.success ? 'info' : 'warn',
    });

    return result;
  }
}