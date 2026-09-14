import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DevAuthService } from './dev-auth.service';
import { DevOnlyGuard } from './dev-only.guard';
import { DEV_USER_PASSWORD } from './dev-auth.constants';
import {
  DevSeedUsersResponseDto,
  DevStatusResponseDto,
} from './dto/dev-auth-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

/** Every route here 404s unless AUTH_BYPASS is on — see DevOnlyGuard. */
@ApiTags('dev')
@ApiNotFoundResponse({
  description:
    'AUTH_BYPASS is off — these routes do not exist outside local development',
  type: ErrorResponseDto,
})
@UseGuards(DevOnlyGuard)
@Controller('dev')
export class DevAuthController {
  constructor(private readonly devAuth: DevAuthService) {}

  @Post('seed-users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Create the fake dev accounts (one per role) and return their credentials',
    description:
      'Idempotent — accounts that already exist are reused, with their role re-synced to the spec.',
  })
  @ApiOkResponse({
    description: 'The dev accounts and their shared password',
    type: DevSeedUsersResponseDto,
  })
  async seedUsers() {
    const users = await this.devAuth.seedDevUsers();
    return {
      // No tokens on purpose: POST /auth/login with these credentials issues a
      // fresh session. A token minted here would expire in minutes, and while
      // the bypass is on an expired one silently falls back to the dev ADMIN
      // instead of failing, which is a confusing way to lose an afternoon.
      password: DEV_USER_PASSWORD,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      })),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Report the bypass state and the identity in use' })
  @ApiOkResponse({
    description:
      'The bypass state and the identity unauthenticated requests run as',
    type: DevStatusResponseDto,
  })
  async status() {
    return {
      authBypass: this.devAuth.enabled,
      runningAs: await this.devAuth.getBypassIdentity(),
    };
  }
}
