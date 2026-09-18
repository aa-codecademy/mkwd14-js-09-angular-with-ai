import type { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../store/auth/auth.store';
import { catchError, switchMap, throwError } from 'rxjs';

// Named constants instead of magic values scattered through the logic - `401` on its own
// tells a reader nothing.
const AUTH_STATUS_NOT_AUTH = 401;
const REFRESH_ENDPOINT = '/auth/refresh';
const CREDENTIAL_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/change-password',
];

// Exported separately so it can be unit tested without spinning up HttpClient. Pick<> means
// "any object with a url" - the test doesn't have to build a whole HttpRequest.
export function isRefreshRequest(req: Pick<HttpRequest<unknown>, 'url'>) {
  return req.url.includes(REFRESH_ENDPOINT);
}

// Known limitation, and the class challenge: if five requests fail with 401 at the same
// moment, this fires five refresh calls. A production version shares ONE in-flight refresh
// observable and queues the rest until it resolves.
export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);

  // The escape hatch that prevents INFINITE RECURSION: if the refresh call itself returns 401
  // and we tried to refresh again, we'd loop forever. Let that one request fail normally.
  if (isRefreshRequest(req)) {
    return next(req);
  }

  return next(req).pipe(
    // catchError only sees FAILED responses. A 401 here means "your access token expired".
    catchError((err: HttpErrorResponse) => {
      if (CREDENTIAL_ENDPOINTS.some((path) => req.url.includes(path))) {
        return throwError(() => err);
      }

      // Anything that isn't a 401 (404, 500, a network drop) is not our problem, and without
      // a refresh token there is nothing we could do anyway - rethrow so the caller handles it.
      // throwError(() => err) takes a FACTORY, not the error itself - a common RxJS 7 gotcha.
      if (err.status !== AUTH_STATUS_NOT_AUTH || !auth.refreshToken()) {
        return throwError(() => err);
      }

      return auth.refresh().pipe(
        // switchMap swaps the refresh observable for a RETRY of the original request, so the
        // component that made the call never notices the token was renewed underneath it.
        // Set the header from the fresh response - re-cloning `req` without it would resend
        // the expired token, because the original req still carries the old one.
        switchMap((res) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } })),
        ),
        // The refresh token itself is dead (expired or revoked) - the session is genuinely
        // over, so log out rather than leaving the user in a half-broken state.
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
