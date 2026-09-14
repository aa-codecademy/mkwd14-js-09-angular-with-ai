import { ApiProperty } from '@nestjs/swagger';
import { User, USER_ROLES } from '../entities/user.entity';
import type { UserRole } from '../entities/user.entity';

const ACCESS_TOKEN_EXAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIn0.7Xk1Qb0kq0m0k3p3JmkQ2zvM0xVtT6h8sJ3sVQ0xYzA';
const REFRESH_TOKEN_EXAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIn0.Ku2dQ0lS7hQ5t1Yb3nGm9mQ8y8WcR2pF4dN1sK0hB9c';

/** A user as it is safe to hand to a client — never carries the password hash. */
export class PublicUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'demo@example.com', format: 'email' })
  email: string;

  @ApiProperty({ example: 'Ada' })
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  lastName: string;

  @ApiProperty({ enum: USER_ROLES, enumName: 'UserRole', example: 'USER' })
  role: UserRole;

  @ApiProperty({
    format: 'date-time',
    example: '2026-01-15T09:30:00.000Z',
    description: 'ISO-8601 timestamp',
  })
  createdAt: string;
}

/** The token pair returned by POST /auth/refresh. */
export class TokenPairDto {
  @ApiProperty({
    example: ACCESS_TOKEN_EXAMPLE,
    description: 'Short-lived JWT; send as `Authorization: Bearer <token>`',
  })
  accessToken: string;

  @ApiProperty({
    example: REFRESH_TOKEN_EXAMPLE,
    description: 'Long-lived JWT; exchange at POST /auth/refresh',
  })
  refreshToken: string;
}

/** The full session returned by POST /auth/login. */
export class AuthResponseDto extends TokenPairDto {
  @ApiProperty({ type: PublicUserDto })
  user: PublicUserDto;
}

/** POST /auth/register returns the created account, no tokens. */
export class RegisterResponseDto {
  @ApiProperty({
    type: User,
    description: 'The newly created account. Log in to obtain tokens.',
  })
  user: User;
}
