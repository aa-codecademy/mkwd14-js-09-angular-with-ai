import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

// Standalone bootstrap entry point - no root NgModule involved, appConfig supplies all providers.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
