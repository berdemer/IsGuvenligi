import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { AdminAuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [AdminAuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AdminAuditModule {}