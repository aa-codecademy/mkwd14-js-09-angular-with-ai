import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_URL } from './tokens/api-url.token';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideStoreDevtools } from '@ngrx/store-devtools';

// ApplicationConfig is the standalone-app replacement for the old root NgModule -
// it just registers app-wide providers (dependency injection tokens) via bootstrapApplication.
export const appConfig: ApplicationConfig = {
  providers: [
    // Global handler that reports uncaught errors instead of letting them fail silently.
    provideBrowserGlobalErrorListeners(),
    // Registers the Router service app-wide and wires up our `routes` array - without this,
    // <router-outlet> and routerLink would have nothing to talk to.
    provideRouter(routes),
    provideHttpClient(withXhr(), withInterceptors([loadingInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl },
    // Gotcha: this instruments the CLASSIC Redux store from @ngrx/store, which this app does
    // not use - there's no provideStore() anywhere, so right now this line does nothing.
    // @ngrx/signals is a separate implementation with no actions and no reducers, so the Redux
    // DevTools extension has nothing to receive. Signal stores are inspected with Angular
    // DevTools (or the community @angular-architects/ngrx-toolkit `withDevtools()` feature).
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
