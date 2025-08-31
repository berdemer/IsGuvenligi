import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, request?: any) {
    // Temporary mock login for testing
    this.logger.log(`Login attempt for user: ${loginDto.username}`);
    
    // Mock JWT token for testing
    const payload = {
      sub: 'test-user-id',
      preferred_username: loginDto.username,
      email: 'test@example.com',
      realm_access: { roles: ['user'] },
      groups: [],
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      user: {
        id: 'test-user-id',
        username: loginDto.username,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: ['user'],
        groups: []
      }
    };
  }

  async refreshToken(refreshToken: string) {
    // Mock refresh for testing
    const payload = {
      sub: 'test-user-id',
      preferred_username: 'testuser',
      email: 'test@example.com',
      realm_access: { roles: ['user'] },
      groups: [],
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
    };
  }

  async logout(refreshToken: string, userId?: string) {
    this.logger.log('User logged out');
    return { message: 'Logged out successfully' };
  }
}