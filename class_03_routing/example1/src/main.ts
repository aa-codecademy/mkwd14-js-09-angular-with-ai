import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

// bootstrapApplication starts a standalone app directly from a root component,
// no root NgModule required — appConfig supplies the providers (like the Router)
// that used to live in @NgModule's providers array.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
