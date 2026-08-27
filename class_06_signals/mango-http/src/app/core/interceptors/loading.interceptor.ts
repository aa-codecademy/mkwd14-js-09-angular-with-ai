// Functional HTTP interceptor: a plain function (not a class implementing HttpInterceptor)
// registered via provideHttpClient(withInterceptors([...])) in app.config.ts. Angular runs every
// registered interceptor around every HttpClient request, which makes this the right place for
// cross-cutting concerns (loading spinners, auth headers, error logging) instead of repeating
// that logic in each service/component.
import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../../shared/services/loading.service';
import { finalize } from 'rxjs';

// Gotcha: interceptor ORDER matters. Interceptors run in the array order given to
// withInterceptors() for the request, and in reverse order for the response. If an auth
// interceptor needs to run before this one (e.g. to attach a token this one's request depends
// on), it must be listed first in that array.
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // inject() works here because Angular calls interceptor functions within an injection context.
  const loadingService = inject(LoadingService);

  loadingService.start();

  // finalize() runs once the observable completes OR errors OR is unsubscribed/cancelled -
  // guaranteeing the loading counter is decremented no matter how the request finishes.
  return next(req).pipe(finalize(() => loadingService.stop()));
};

// try {

// } catch {

// } finally { -- finalize is similar to finally in a try-catch block

// }
