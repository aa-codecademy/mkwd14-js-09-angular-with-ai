import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_URL } from './tokens/api-url.token';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

// ApplicationConfig is the standalone-app replacement for the old root NgModule -
// it just registers app-wide providers (dependency injection tokens) via bootstrapApplication.
export const appConfig: ApplicationConfig = {
  providers: [
    // Global handler that reports uncaught errors instead of letting them fail silently.
    provideBrowserGlobalErrorListeners(),
    // Registers the Router service app-wide and wires up our `routes` array - without this,
    // <router-outlet> and routerLink would have nothing to talk to.
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl },
  ],
};
