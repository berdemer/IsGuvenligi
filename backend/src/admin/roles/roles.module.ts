import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { AdminRolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { AuditService } from '../audit/audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, AuditLog]),
  ],
  controllers: [AdminRolesController],
  providers: [RolesService, AuditService],
  exports: [RolesService],
})
export class AdminRolesModule {}