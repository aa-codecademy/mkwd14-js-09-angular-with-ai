import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../store/auth/auth.store';
import { catchError, switchMap, throwError } from 'rxjs';

const AUTH_STATUS_NOT_AUTH = 401;

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);

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
