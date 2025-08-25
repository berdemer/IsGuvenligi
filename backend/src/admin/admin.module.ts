import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUsersModule } from './users/users.module';
import { AdminRolesModule } from './roles/roles.module';
import { AdminOAuthProvidersModule } from './oauth/oauth-providers.module';
import { AdminAuditModule } from './audit/audit.module';

@Module({
  imports: [
    AdminUsersModule, 
    AdminRolesModule, 
    AdminOAuthProvidersModule,
    AdminAuditModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}