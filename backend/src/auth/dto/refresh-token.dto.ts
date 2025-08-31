import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Yenilenecek refresh token (opsiyonel - cookie\'den de alınabilir)',
    required: false
  })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}