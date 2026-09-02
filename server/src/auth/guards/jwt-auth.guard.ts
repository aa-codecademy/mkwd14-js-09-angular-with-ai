import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { DevAuthService } from '../../dev-auth/dev-auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly devAuth: DevAuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Normal mode: a valid bearer token is required, as always.
    if (!this.devAuth.enabled) {
      return (await super.canActivate(context)) as boolean;
    }

    // Bypass mode: a real token still wins, so apps that DO implement auth keep
    // behaving exactly as they would in normal mode...
    try {
      if ((await super.canActivate(context)) === true) return true;
    } catch {
      // ...and anything without a usable token runs as the seeded dev user,
      // so apps from the modules before auth can reach protected routes.
    }

    const request = context.switchToHttp().getRequest<Request>();
    request.user = await this.devAuth.getBypassIdentity();
    return true;
  }
}
