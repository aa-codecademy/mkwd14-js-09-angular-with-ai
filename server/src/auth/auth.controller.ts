import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  AuthResponseDto,
  PublicUserDto,
  RegisterResponseDto,
  TokenPairDto,
} from './dto/auth-response.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './strategies/jwt.strategy';

@ApiTags('auth')
@ApiBadRequestResponse({
  description: 'The payload failed validation',
  type: ValidationErrorResponseDto,
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a USER-role account. No tokens are issued — call POST /auth/login next.',
  })
  @ApiCreatedResponse({
    description: 'The account was created',
    type: RegisterResponseDto,
  })
  @ApiConflictResponse({
    description: 'That email is already registered',
    type: ErrorResponseDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and receive access/refresh tokens' })
  @ApiOkResponse({
    description: 'Credentials accepted — tokens and the user profile',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unknown email or wrong password',
    type: ErrorResponseDto,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange a refresh token for a new access/refresh token pair',
  })
  @ApiOkResponse({ description: 'A fresh token pair', type: TokenPairDto })
  @ApiUnauthorizedResponse({
    description: 'The refresh token is expired, malformed, or its user is gone',
    type: ErrorResponseDto,
  })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reset your own password',
    description:
      'The caller confirms their current password and picks a new one. A ' +
      'fresh token pair comes back so the current session stays signed in.',
  })
  @ApiOkResponse({
    description: 'The password was changed — new tokens and the user profile',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing/invalid access token, or the current password is wrong',
    type: ErrorResponseDto,
  })
  changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const user = req.user as JwtPayload;
    return this.authService.changePassword(user.sub, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ description: 'The current user', type: PublicUserDto })
  @ApiUnauthorizedResponse({
    description: 'Missing, expired, or invalid access token',
    type: ErrorResponseDto,
  })
  me(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.authService.me(user.sub);
  }
}
