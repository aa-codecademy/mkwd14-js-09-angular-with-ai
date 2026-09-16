import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../store/auth/auth.store';

// An interceptor sits between HttpClient and the network: every request passes through it,
// so you attach the token in ONE place instead of in every service.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const accessToken = auth.accessToken();

  // No token (a logged-out visitor browsing products) - forward the request untouched.
  // Always call next(req); returning nothing here would silently kill the request.
  if (!accessToken) {
    return next(req);
  }

  // HttpRequest is IMMUTABLE. You cannot do `req.headers.set(...)` and expect it to stick -
  // clone() gives you a modified copy, and that copy is what you must pass to next().
  // "Bearer " + token is the scheme the Authorization header expects; the space matters.
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }));
};
