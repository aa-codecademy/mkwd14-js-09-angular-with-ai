import type { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../store/auth/auth.store';
import { catchError, switchMap, throwError } from 'rxjs';

const AUTH_STATUS_NOT_AUTH = 401;
const REFRESH_ENDPOINT = '/auth/refresh';

export function isRefreshRequest(req: Pick<HttpRequest<unknown>, 'url'>) {
  return req.url.includes(REFRESH_ENDPOINT);
}

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);

  if (isRefreshRequest(req)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== AUTH_STATUS_NOT_AUTH || !auth.refreshToken()) {
        return throwError(() => err);
      }

      return auth.refresh().pipe(
        switchMap((res) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } })),
        ),
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
