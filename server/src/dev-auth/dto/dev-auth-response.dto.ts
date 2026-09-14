import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLES } from '../../auth/entities/user.entity';
import type { UserRole } from '../../auth/entities/user.entity';

/** One of the fixed dev accounts. */
export class DevUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'dev-admin@mango.local', format: 'email' })
  email: string;

  @ApiProperty({ example: 'Marta' })
  firstName: string;

  @ApiProperty({ example: 'Ilievska' })
  lastName: string;

  @ApiProperty({ enum: USER_ROLES, enumName: 'UserRole', example: 'ADMIN' })
  role: UserRole;
}

/** POST /dev/seed-users — the accounts plus the password they all share. */
export class DevSeedUsersResponseDto {
  @ApiProperty({
    example: 'devpassword123',
    description: 'The shared password for every dev account',
  })
  password: string;

  @ApiProperty({
    type: [DevUserDto],
    description:
      'One account per role. No tokens: log in with these to get a session.',
  })
  users: DevUserDto[];
}

/** The identity an unauthenticated request runs as while the bypass is on. */
export class DevIdentityDto {
  @ApiProperty({ example: 1, description: 'User id the bypass acts as' })
  sub: number;

  @ApiProperty({ example: 'dev-admin@mango.local', format: 'email' })
  email: string;

  @ApiProperty({ enum: USER_ROLES, enumName: 'UserRole', example: 'ADMIN' })
  role: UserRole;
}

/** GET /dev/status. */
export class DevStatusResponseDto {
  @ApiProperty({
    example: true,
    description:
      'Whether AUTH_BYPASS is on. Always true here — the routes 404 otherwise.',
  })
  authBypass: boolean;

  @ApiProperty({ type: DevIdentityDto })
  runningAs: DevIdentityDto;
}
