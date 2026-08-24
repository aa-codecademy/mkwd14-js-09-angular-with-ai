import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

// bootstrapApplication is the standalone-app entry point - replaces the old platformBrowserDynamic()
// .bootstrapModule(AppModule) call, since there's no root NgModule anymore.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
