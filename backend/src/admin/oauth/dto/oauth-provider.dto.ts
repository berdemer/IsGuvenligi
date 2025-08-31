import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsObject,
  IsArray,
  IsUrl,
  MinLength,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOAuthProviderDto {
  @ApiProperty({ example: 'google' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Google' })
  @IsString()
  @MinLength(2)
  displayName: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean = false;

  @ApiPropertyOptional({ example: 'your-google-client-id' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ example: 'your-google-client-secret' })
  @IsOptional()
  @IsString()
  clientSecret?: string;

  @ApiPropertyOptional({ example: 'https://accounts.google.com/o/oauth2/v2/auth' })
  @IsOptional()
  @IsUrl()
  authUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.googleapis.com/oauth2/v4/token' })
  @IsOptional()
  @IsUrl()
  tokenUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.googleapis.com/oauth2/v2/userinfo' })
  @IsOptional()
  @IsUrl()
  userInfoUrl?: string;

  @ApiPropertyOptional({ example: ['openid', 'email', 'profile'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ example: 'https://example.com/google-icon.svg' })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number = 0;
}

export class UpdateOAuthProviderDto {
  @ApiPropertyOptional({ example: 'google' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Google' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ example: 'your-google-client-id' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ example: 'your-google-client-secret' })
  @IsOptional()
  @IsString()
  clientSecret?: string;

  @ApiPropertyOptional({ example: 'https://accounts.google.com/o/oauth2/v2/auth' })
  @IsOptional()
  @IsUrl()
  authUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.googleapis.com/oauth2/v4/token' })
  @IsOptional()
  @IsUrl()
  tokenUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.googleapis.com/oauth2/v2/userinfo' })
  @IsOptional()
  @IsUrl()
  userInfoUrl?: string;

  @ApiPropertyOptional({ example: ['openid', 'email', 'profile'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ example: 'https://example.com/google-icon.svg' })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class OAuthProviderQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'google' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'true', enum: ['true', 'false'] })
  @IsOptional()
  @IsString()
  isEnabled?: string;

  @ApiPropertyOptional({ example: 'name', enum: ['name', 'displayName', 'sortOrder', 'createdAt'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder';

  @ApiPropertyOptional({ example: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class OAuthProviderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  isEnabled: boolean;

  @ApiPropertyOptional()
  clientId?: string;

  @ApiPropertyOptional()
  authUrl?: string;

  @ApiPropertyOptional()
  tokenUrl?: string;

  @ApiPropertyOptional()
  userInfoUrl?: string;

  @ApiProperty()
  scopes: string[];

  @ApiPropertyOptional()
  configuration?: Record<string, any>;

  @ApiPropertyOptional()
  iconUrl?: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OAuthProvidersListResponseDto {
  @ApiProperty({ type: [OAuthProviderResponseDto] })
  data: OAuthProviderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}

export class TestOAuthProviderDto {
  @ApiProperty({ example: 'test-auth-code' })
  @IsString()
  authCode: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/auth/callback' })
  @IsOptional()
  @IsUrl()
  redirectUri?: string;
}