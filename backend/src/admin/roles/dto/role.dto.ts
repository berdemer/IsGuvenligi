import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsArray, 
  MinLength,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty({ example: 'manager' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Manager Role' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ example: 'Role for managers with elevated permissions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['user:read', 'user:write', 'role:read'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'manager' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Manager Role' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ example: 'Role for managers with elevated permissions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['user:read', 'user:write', 'role:read'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class RoleQueryDto {
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

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'name', enum: ['name', 'displayName', 'createdAt'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class RoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  permissions: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  userCount?: number;
}

export class RolesListResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  data: RoleResponseDto[];

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

export class PermissionDto {
  @ApiProperty()
  resource: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  permission: string;

  @ApiPropertyOptional()
  description?: string;
}