import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'password123',
    format: 'password',
    description: 'The password currently on the account, to prove ownership',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'kiwi-orchard-42',
    format: 'password',
    minLength: 8,
    description: 'At least 8 characters; replaces the stored bcrypt hash',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ChangePasswordResponseDto {
  @ApiProperty({ example: 'Password updated' })
  message: string;
}
