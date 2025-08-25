import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { AdminUsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuditService } from '../audit/audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, AuditLog]),
  ],
  controllers: [AdminUsersController],
  providers: [UsersService, AuditService],
  exports: [UsersService, AuditService],
})
export class AdminUsersModule {}