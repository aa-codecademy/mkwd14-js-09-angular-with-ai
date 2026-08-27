// Standalone bootstrapping: no NgModule needed. bootstrapApplication() takes the
// root standalone component (App) plus an ApplicationConfig (providers like the router).
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
