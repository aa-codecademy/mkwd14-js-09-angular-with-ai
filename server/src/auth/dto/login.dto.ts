import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'demo@example.com',
    format: 'email',
    description: 'Email the account was registered with',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    format: 'password',
    description: 'Plain-text password, checked against the stored bcrypt hash',
  })
  @IsString()
  password: string;
}
