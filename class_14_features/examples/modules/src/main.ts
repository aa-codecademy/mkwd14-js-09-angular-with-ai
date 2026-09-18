import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

// NgModule-based bootstrap: no bootstrapApplication(), no standalone components.
// The root module (AppModule) says which component to bootstrap.
platformBrowser()
  .bootstrapModule(AppModule)
  .catch(console.error);
