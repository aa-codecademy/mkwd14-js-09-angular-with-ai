import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'The refresh token you got back from /auth/login' })
  @IsString()
  refreshToken: string;
}
