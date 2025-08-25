import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

export interface AuditLogData {
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        userId: data.userId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        level: data.level || 'info',
        metadata: data.metadata,
      });

      const savedLog = await this.auditLogRepository.save(auditLog);
      
      // Log to application logger based on level
      const logMessage = `Audit: ${data.action} on ${data.resource}${data.resourceId ? ` (${data.resourceId})` : ''} by user ${data.userId}`;
      
      switch (data.level) {
        case 'error':
          this.logger.error(logMessage, data.details);
          break;
        case 'warn':
          this.logger.warn(logMessage, data.details);
          break;
        case 'debug':
          this.logger.debug(logMessage, data.details);
          break;
        default:
          this.logger.log(logMessage);
      }

      return savedLog;
    } catch (error) {
      this.logger.error('Failed to save audit log', error.stack);
      throw error;
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    action?: string;
    resource?: string;
    userId?: string;
    level?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { 
      page = 1, 
      limit = 10, 
      action, 
      resource, 
      userId, 
      level, 
      startDate, 
      endDate 
    } = query;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user');

    // Apply filters
    if (action) {
      queryBuilder.andWhere('audit.action LIKE :action', { action: `%${action}%` });
    }

    if (resource) {
      queryBuilder.andWhere('audit.resource = :resource', { resource });
    }

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (level) {
      queryBuilder.andWhere('audit.level = :level', { level });
    }

    if (startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    // Order by creation date (newest first)
    queryBuilder.orderBy('audit.createdAt', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async findByResource(resourceType: string, resourceId: string) {
    return this.auditLogRepository.find({
      where: { 
        resource: resourceType, 
        resourceId 
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 50, // Limit to recent 50 entries
    });
  }

  async findByUser(userId: string, limit = 50) {
    return this.auditLogRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('audit.resource', 'resource')
      .addSelect('audit.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :startDate', { startDate })
      .groupBy('audit.action')
      .addGroupBy('audit.resource')
      .addGroupBy('audit.level')
      .getRawMany();

    return stats;
  }

  async cleanup(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} audit log entries older than ${daysToKeep} days`);
    
    return result.affected;
  }
}