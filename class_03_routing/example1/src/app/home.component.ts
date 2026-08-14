import { Component } from '@angular/core';

// A standalone component, matched to the '' path in app.routes.ts and lazy-loaded
// on demand — it's just a normal component, the Router treats it no differently.
@Component({
  selector: 'app-home',
  template: `<h1>Home Page</h1>`,
})
export class HomeComponent {}
