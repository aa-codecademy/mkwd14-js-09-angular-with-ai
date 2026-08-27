import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// ApplicationConfig replaces the old root NgModule's providers array in the
// standalone API. Each provideX() function registers a feature (router, error
// listeners, etc.) without needing a module - this whole config is handed to
// bootstrapApplication() in main.ts.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
