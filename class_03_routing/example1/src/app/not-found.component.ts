import { Component } from '@angular/core';
// Needed because the template below uses routerLink — standalone components must
// import every directive they use directly, there's no shared NgModule to rely on.
import { RouterLink } from '@angular/router';

// This is the component wired to the wildcard ('**') route — it renders whenever
// the URL doesn't match any other route, giving users a friendly "not found" page
// instead of a blank screen or a router error.
@Component({
  selector: 'app-not-found',
  template: `
    <h1>404 Not Found</h1>
    <a routerLink="/">Go back home</a>
  `,
  imports: [RouterLink],
})
export class NotFoundComponent {}
