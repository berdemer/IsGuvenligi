import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserSession } from '../entities/user-session.entity';
import { SocialLoginSetting } from '../entities/social-login-setting.entity';
// import { KeycloakStrategy } from './strategies/keycloak.strategy';

@Module({
  imports: [
    // TypeOrmModule.forFeature([UserSession, SocialLoginSetting]), // Temporarily disabled
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: '30m',
          issuer: 'isguvenligi-backend',
          audience: 'isguvenligi-frontend'
        },
      }),
      inject: [ConfigService],
    }),

    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        authServerUrl: configService.get<string>('KEYCLOAK_URL'),
        realm: configService.get<string>('KEYCLOAK_REALM'),
        clientId: configService.get<string>('KEYCLOAK_CLIENT_ID'),
        secret: configService.get<string>('KEYCLOAK_CLIENT_SECRET'),
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
        tokenValidation: TokenValidation.ONLINE,
        cookieKey: 'KEYCLOAK_JWT',
        logLevels: ['verbose'],
        useNestLogger: process.env.NODE_ENV === 'development',
        bearerOnly: false,
        serverUrl: configService.get<string>('KEYCLOAK_URL'),
        publicClient: false,
        verifyTokenAudience: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // KeycloakStrategy,
    {
      provide: 'AUTH_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'RESOURCE_GUARD',
      useClass: ResourceGuard,
    },
    {
      provide: 'ROLE_GUARD',
      useClass: RoleGuard,
    },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}