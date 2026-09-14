import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'demo@example.com',
    format: 'email',
    description: 'Must not already belong to another account',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    format: 'password',
    minLength: 8,
    description: 'At least 8 characters; stored as a bcrypt hash',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Ada' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  @IsString()
  lastName: string;
}
