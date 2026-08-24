import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Entry point for a standalone Angular app - no root NgModule/AppModule needed. AppComponent is
// bootstrapped directly, and appConfig supplies the app-wide providers (router, error listeners).
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
