import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Rejects the request with 401 unless it carries a valid `Authorization: Bearer <accessToken>`. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
