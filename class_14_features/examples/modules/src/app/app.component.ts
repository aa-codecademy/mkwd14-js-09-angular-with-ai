import { Component } from '@angular/core';

// Note: no `standalone: true` and no `imports: []` here.
// Everything this template can use comes from the NgModule that declares it.
@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`main { max-width: 760px; margin: 0 auto; }`],
})
export class AppComponent {}
