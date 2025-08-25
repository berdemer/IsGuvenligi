import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
// Redis store import will be updated when cache is re-enabled
// import { redisStore } from 'cache-manager-redis-store';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { SessionsModule } from './sessions/sessions.module';
import { SafetyModule } from './safety/safety.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      expandVariables: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),

    // Redis Cache - Temporarily disabled for testing
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => {
    //     return {
    //       store: redisStore,
    //       host: configService.get('REDIS_HOST', 'redis'),
    //       port: configService.get('REDIS_PORT', 6379),
    //       ttl: 300, // 5 minutes default
    //       max: 1000, // maximum number of items in cache
    //     };
    //   },
    //   inject: [ConfigService],
    // }),

    // Feature modules
    AuthModule,
    UsersModule,
    AdminModule,
    SessionsModule,
    SafetyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}