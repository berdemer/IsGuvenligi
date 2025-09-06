import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(loginDto: LoginDto, request?: any) {
    // Temporary mock login for testing
    this.logger.log(`Login attempt for user: ${loginDto.username}`);
    
    // Mock users database
    const mockUsers: { [key: string]: any } = {
      'admin': {
        id: 'admin-user-id',
        username: 'admin',
        email: 'admin@isguvenligi.com',
        firstName: 'System',
        lastName: 'Administrator',
        roles: ['admin'],
        groups: ['administrators']
      },
      'manager': {
        id: 'manager-user-id',
        username: 'manager',
        email: 'manager@isguvenligi.com',
        firstName: 'Security',
        lastName: 'Manager',
        roles: ['manager'],
        groups: ['managers']
      },
      'test': {
        id: 'test-user-id',
        username: 'test',
        email: 'test@isguvenligi.com',
        firstName: 'Test',
        lastName: 'User',
        roles: ['user'],
        groups: ['users']
      }
    };

    const mockUser = mockUsers[loginDto.username] || mockUsers['test'];
    
    // Mock JWT token for testing
    const payload = {
      sub: mockUser.id,
      preferred_username: mockUser.username,
      email: mockUser.email,
      realm_access: { roles: mockUser.roles },
      groups: mockUser.groups,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`Login successful for user: ${loginDto.username}, roles: ${mockUser.roles.join(', ')}`);

    return {
      access_token: token,
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      user: mockUser
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

  async logoutAllSessions(userId: string) {
    this.logger.log(`Logging out all sessions for user: ${userId}`);
    return { message: 'All sessions logged out successfully' };
  }

  async getUserProfile(user: any) {
    const cacheKey = `user_profile:${user.sub}`;
    
    // Try to get from cache first
    let cachedProfile = await this.cacheManager.get(cacheKey);
    if (cachedProfile) {
      this.logger.debug(`Retrieved user profile from cache for user: ${user.sub}`);
      return cachedProfile;
    }

    // If not in cache, create profile and cache it
    const profile = {
      id: user.sub,
      username: user.preferred_username,
      email: user.email,
      firstName: user.given_name || user.firstName || 'User',
      lastName: user.family_name || user.lastName || 'Name',
      roles: user.realm_access?.roles || [],
      groups: user.groups || [],
      profile: {}
    };

    // Cache the profile for 5 minutes
    await this.cacheManager.set(cacheKey, profile, 300000);
    this.logger.debug(`Cached user profile for user: ${user.sub}`);
    
    return profile;
  }

  async getActiveSessions(userId: string) {
    return [
      {
        id: 'session-1',
        userId,
        sessionState: 'active',
        lastActivity: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser'
      }
    ];
  }

  async terminateSession(userId: string, sessionId: string) {
    this.logger.log(`Terminating session ${sessionId} for user ${userId}`);
    return { message: 'Session terminated successfully' };
  }

  async getEnabledSocialProviders() {
    return [
      {
        id: 'google',
        name: 'Google',
        enabled: false
      },
      {
        id: 'facebook',
        name: 'Facebook',
        enabled: false
      }
    ];
  }
}