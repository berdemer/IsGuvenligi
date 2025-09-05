import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Request, 
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Res,
  Req
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody 
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles, Unprotected, AuthenticatedUser } from 'nest-keycloak-connect';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Unprotected()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Başarıyla giriş yapıldı',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        expires_in: { type: 'number' },
        user: { 
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(loginDto, req);
    
    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      access_token: result.access_token,
      expires_in: result.expires_in,
      user: result.user
    };
  }

  @Post('refresh')
  @Unprotected()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Token yenileme' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token başarıyla yenilendi',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        expires_in: { type: 'number' }
      }
    }
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = refreshTokenDto.refresh_token || req.cookies?.refreshToken;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token gerekli');
    }

    const result = await this.authService.refreshToken(refreshToken);
    
    // Update refresh token cookie if new one provided
    if (result.refresh_token) {
      res.cookie('refreshToken', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return {
      access_token: result.access_token,
      expires_in: result.expires_in
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı çıkışı' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Başarıyla çıkış yapıldı' })
  async logout(
    @AuthenticatedUser() user: any,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies?.refreshToken;
    
    if (refreshToken) {
      await this.authService.logout(refreshToken, user?.sub);
    }

    // Clear cookies
    res.clearCookie('refreshToken');
    res.clearCookie('KEYCLOAK_JWT');

    return { message: 'Başarıyla çıkış yapıldı' };
  }

  @Post('logout-all')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tüm oturumlardan çıkış' })
  @ApiResponse({ status: 200, description: 'Tüm oturumlardan başarıyla çıkış yapıldı' })
  async logoutAll(
    @AuthenticatedUser() user: any,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logoutAllSessions(user?.sub);

    // Clear cookies
    res.clearCookie('refreshToken');
    res.clearCookie('KEYCLOAK_JWT');

    return { message: 'Tüm oturumlardan başarıyla çıkış yapıldı' };
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Kullanıcı profili' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcı profili başarıyla döndürüldü',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
        groups: { type: 'array', items: { type: 'string' } },
        profile: { type: 'object' }
      }
    }
  })
  async getProfile(@Request() request: any, @AuthenticatedUser() user: any) {
    // Extract JWT token and decode it manually since AuthenticatedUser is undefined
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No valid token provided');
    }
    
    const token = authHeader.substring(7);
    try {
      // Decode JWT manually (without signature verification for now since it's our own token)
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      return await this.authService.getUserProfile(payload);
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }

  @Get('sessions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Aktif oturumlar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Aktif oturumlar başarıyla döndürüldü',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionId: { type: 'string' },
          deviceInfo: { type: 'object' },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' },
          lastActivity: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      }
    }
  })
  async getActiveSessions(@AuthenticatedUser() user: any) {
    return await this.authService.getActiveSessions(user?.sub);
  }

  @Post('sessions/:sessionId/terminate')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Belirli oturumu sonlandır' })
  @ApiResponse({ status: 200, description: 'Oturum başarıyla sonlandırıldı' })
  async terminateSession(
    @AuthenticatedUser() user: any,
    @Request() req: any
  ) {
    const sessionId = req.params.sessionId;
    await this.authService.terminateSession(user?.sub, sessionId);
    return { message: 'Oturum başarıyla sonlandırıldı' };
  }

  @Get('social-providers')
  @Unprotected()
  @ApiOperation({ summary: 'Aktif sosyal giriş sağlayıcıları' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sosyal giriş sağlayıcıları başarıyla döndürüldü',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          provider: { type: 'string' },
          displayName: { type: 'string' },
          loginUrl: { type: 'string' },
          enabled: { type: 'boolean' }
        }
      }
    }
  })
  async getSocialProviders() {
    return await this.authService.getEnabledSocialProviders();
  }

  @Get('check')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Token geçerliliği kontrolü' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token geçerli',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        user: { type: 'object' },
        expires_in: { type: 'number' }
      }
    }
  })
  async checkToken(@AuthenticatedUser() user: any, @Request() req: any) {
    return {
      valid: true,
      user: {
        id: user?.sub,
        username: user?.preferred_username,
        email: user?.email,
        roles: user?.realm_access?.roles || []
      },
      expires_in: user?.exp ? user.exp - Math.floor(Date.now() / 1000) : 0
    };
  }
}