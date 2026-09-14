import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIn0.Ku2dQ0lS7hQ5t1Yb3nGm9mQ8y8WcR2pF4dN1sK0hB9c',
    description: 'The refresh token issued by POST /auth/login',
  })
  @IsString()
  refreshToken: string;
}
