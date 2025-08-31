import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDateString
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AuditLogQueryDto {
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

  @ApiPropertyOptional({ example: 'user.created' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({ example: 'user-uuid-123' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'info', enum: ['debug', 'info', 'warn', 'error'] })
  @IsOptional()
  @IsEnum(['debug', 'info', 'warn', 'error'])
  level?: 'debug' | 'info' | 'warn' | 'error';

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2023-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'createdAt', enum: ['createdAt', 'action', 'resource', 'level'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AuditLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  resource: string;

  @ApiPropertyOptional()
  resourceId?: string;

  @ApiPropertyOptional()
  details?: Record<string, any>;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiProperty()
  level: 'debug' | 'info' | 'warn' | 'error';

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  user?: {
    id: string;
    email: string;
    fullName: string;
  };

  @ApiProperty()
  userId: string;
}

export class AuditLogsListResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  data: AuditLogResponseDto[];

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

export class AuditStatsResponseDto {
  @ApiProperty()
  action: string;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  level: string;

  @ApiProperty()
  count: number;
}