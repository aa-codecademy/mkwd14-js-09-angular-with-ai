import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// ApplicationConfig replaces the old root NgModule: instead of declaring providers
// in @NgModule, standalone apps register them here and hand this object to
// bootstrapApplication in main.ts.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideRouter wires up the Router service (and injects it app-wide via DI),
    // using the route table from app.routes.ts — this is what makes routerLink,
    // RouterOutlet, and navigation actually work.
    provideRouter(routes)
  ]
};
