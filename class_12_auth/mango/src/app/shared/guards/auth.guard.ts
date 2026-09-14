import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';

// A CanActivateFn is just a function the router calls BEFORE it activates a route.
// It runs inside an injection context, which is why inject() works here even though
// this is not a class - no constructor, no `new`, nothing to instantiate.
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // Return a UrlTree instead of calling router.navigate(): the router cancels this
  // navigation and redirects in one atomic step. navigate() inside a guard fires a
  // SECOND navigation while the first is still running, which causes flicker and races.
  // returnUrl remembers where the user was heading so login can send them back.
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: route.url } });
};
