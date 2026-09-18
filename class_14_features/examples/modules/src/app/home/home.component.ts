import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  template: `
    <h2>NgModule architecture demo</h2>
    <p appHighlight>
      This app uses classic NgModules: a root module, a core module, a shared
      module and two lazy-loaded feature modules.
    </p>
    <ul>
      <li><a routerLink="/products">Products feature</a></li>
      <li><a routerLink="/orders">Orders feature</a></li>
    </ul>
  `,
})
export class HomeComponent {}
