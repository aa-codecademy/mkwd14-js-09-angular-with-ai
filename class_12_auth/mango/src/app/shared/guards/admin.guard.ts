import { Router, type CanActivateFn } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';
import { inject } from '@angular/core';

// Authorization, not authentication: this guard asks "are you allowed?", never "who are you?".
// It is paired with authGuard in app.routes.ts - authGuard runs first so an anonymous visitor
// lands on /login, and only a logged-in non-admin ever reaches /not-allowed.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }

  // Send them to a dedicated page, NOT back to /login - redirecting a logged-in user to the
  // login screen is how you build an infinite redirect loop.
  return router.createUrlTree(['/not-allowed']);
};
