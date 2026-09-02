import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { DevAuthService } from './dev-auth.service';

/**
 * Makes the /dev routes behave as if they do not exist unless AUTH_BYPASS is on.
 * Checked at request time rather than at module-definition time, because .env is
 * not loaded yet when the module decorators are evaluated.
 */
@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(private readonly devAuth: DevAuthService) {}

  canActivate(): boolean {
    if (!this.devAuth.enabled) throw new NotFoundException();
    return true;
  }
}
