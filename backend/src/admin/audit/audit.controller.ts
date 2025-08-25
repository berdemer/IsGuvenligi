import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Logger,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions, RequireRoles } from '../../auth/decorators/permissions.decorator';
import { AuditService } from './audit.service';
import { 
  AuditLogQueryDto, 
  AuditLogResponseDto, 
  AuditLogsListResponseDto,
  AuditStatsResponseDto
} from './dto/audit-log.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - Audit Logs')
@Controller('admin/audit')
@UseGuards(JwtAuthGuard)
// // @RequireRoles('admin', 'manager') // Temporarily disabled
export class AdminAuditController {
  private readonly logger = new Logger(AdminAuditController.name);

  constructor(
    private readonly auditService: AuditService,
  ) {}

  @Get()
  // @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'Get audit logs with pagination and filters' })
  @ApiResponse({ status: HttpStatus.OK, type: AuditLogsListResponseDto })
  async getAuditLogs(
    @Query() query: AuditLogQueryDto,
    @CurrentUser() currentUser: any,
  ): Promise<AuditLogsListResponseDto> {
    this.logger.log(`Getting audit logs with query: ${JSON.stringify(query)}`);
    
    const queryOptions = {
      page: query.page,
      limit: query.limit,
      action: query.action,
      resource: query.resource,
      userId: query.userId,
      level: query.level,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const result = await this.auditService.findAll(queryOptions);
    
    // Log this audit query (meta!)
    await this.auditService.log({
      action: 'audit.logs.viewed',
      resource: 'audit',
      userId: currentUser.sub,
      details: { query: queryOptions, count: result.total },
    });

    return result;
  }

  @Get('stats')
  // @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: HttpStatus.OK, type: [AuditStatsResponseDto] })
  async getAuditStats(
    @Query('days') days: number = 30,
    @CurrentUser() currentUser: any,
  ): Promise<AuditStatsResponseDto[]> {
    this.logger.log(`Getting audit stats for ${days} days`);
    
    const stats = await this.auditService.getStats(days);
    
    await this.auditService.log({
      action: 'audit.stats.viewed',
      resource: 'audit',
      userId: currentUser.sub,
      details: { days, statsCount: stats.length },
    });

    return stats;
  }

  @Get('resource/:resourceType/:resourceId')
  // @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'Get audit logs for a specific resource' })
  @ApiResponse({ status: HttpStatus.OK, type: [AuditLogResponseDto] })
  async getResourceAuditLogs(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Getting audit logs for resource ${resourceType}:${resourceId}`);
    
    const logs = await this.auditService.findByResource(resourceType, resourceId);
    
    await this.auditService.log({
      action: 'audit.resource.viewed',
      resource: 'audit',
      userId: currentUser.sub,
      details: { 
        targetResource: resourceType, 
        targetResourceId: resourceId,
        logsCount: logs.length 
      },
    });

    return { logs };
  }

  @Get('user/:userId')
  // @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @ApiResponse({ status: HttpStatus.OK, type: [AuditLogResponseDto] })
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Getting audit logs for user ${userId}`);
    
    const logs = await this.auditService.findByUser(userId, limit);
    
    await this.auditService.log({
      action: 'audit.user.viewed',
      resource: 'audit',
      userId: currentUser.sub,
      details: { 
        targetUserId: userId,
        limit,
        logsCount: logs.length 
      },
    });

    return { logs };
  }

  @Delete('cleanup')
  // @RequirePermissions('audit:write')
  // @RequireRoles('admin') // Only admins can cleanup audit logs
  @ApiOperation({ summary: 'Clean up old audit logs' })
  async cleanupAuditLogs(
    @Query('days') days: number = 90,
    @CurrentUser() currentUser: any,
  ) {
    this.logger.log(`Cleaning up audit logs older than ${days} days`);
    
    const deletedCount = await this.auditService.cleanup(days);
    
    await this.auditService.log({
      action: 'audit.cleanup.executed',
      resource: 'audit',
      userId: currentUser.sub,
      details: { 
        daysToKeep: days,
        deletedCount 
      },
      level: 'warn',
    });

    return { 
      message: `Successfully cleaned up ${deletedCount} old audit log entries`,
      deletedCount,
      daysToKeep: days
    };
  }
}