import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthProvider } from '../../entities/oauth-provider.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { AdminOAuthProvidersController } from './oauth-providers.controller';
import { OAuthProvidersService } from './oauth-providers.service';
import { AuditService } from '../audit/audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OAuthProvider, AuditLog]),
  ],
  controllers: [AdminOAuthProvidersController],
  providers: [OAuthProvidersService, AuditService],
  exports: [OAuthProvidersService],
})
export class AdminOAuthProvidersModule {}