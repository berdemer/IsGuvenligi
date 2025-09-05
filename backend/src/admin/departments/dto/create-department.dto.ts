import { IsString, IsOptional, IsBoolean, MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'IT Department', description: 'Department name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Information Technology and System Administration', description: 'Department description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'manager@company.com', description: 'Department manager email', required: false })
  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @ApiProperty({ example: true, description: 'Whether department is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}