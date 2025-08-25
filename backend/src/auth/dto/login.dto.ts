import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Kullanıcı adı veya e-posta adresi',
    example: 'admin'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Kullanıcı şifresi',
    example: 'Admin123!',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  password: string;
}