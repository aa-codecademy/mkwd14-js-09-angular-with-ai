import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// Gotcha: PostService injects HttpClient, but provideHttpClient() is missing from this providers
// array - HttpClient has no provider registered, so injecting it would throw a NullInjectorError.
// A working app needs `provideHttpClient()` added here (from '@angular/common/http').
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
