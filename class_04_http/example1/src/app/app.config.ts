import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// Gotcha: this app injects HttpClient (see app.component.ts) but never calls provideHttpClient()
// here - without it, Angular's injector has no HttpClient provider registered and injecting it
// would throw a NullInjectorError at runtime. A real app needs `provideHttpClient()` added to
// this providers array (import from '@angular/common/http').
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
