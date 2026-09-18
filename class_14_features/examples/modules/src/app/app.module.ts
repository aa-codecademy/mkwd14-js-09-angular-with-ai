import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  // declarations: components/directives/pipes that BELONG to this module.
  declarations: [AppComponent, HomeComponent],
  // imports: other modules whose exported declarables this module may use.
  imports: [BrowserModule, AppRoutingModule, CoreModule, SharedModule],
  // bootstrap: the component rendered into index.html (root module only).
  bootstrap: [AppComponent],
})
export class AppModule {}
