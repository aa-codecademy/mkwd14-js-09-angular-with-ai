import { Component, signal } from '@angular/core';
// Standalone components don't get directives from an NgModule, so any router
// directive used in the template (RouterOutlet, RouterLink, RouterLinkActive)
// must be imported directly here and listed in the component's `imports` array.
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav>
      <!-- routerLink instead of href: it navigates via the Angular Router without
           a full page reload, keeping the SPA fast and preserving app state. -->
      <!-- exact: true means this link is only "active" on '/', not on every route
           (otherwise it would stay highlighted since '/' is a prefix of all paths). -->
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
        >Home</a
      >
      <a routerLink="/products" routerLinkActive="active">Products</a>
      <a routerLink="/about" routerLinkActive="active">About</a>
    </nav>

    <main>
      <!-- RouterOutlet is the placeholder where the Router renders whichever
           component matches the current URL. -->
      <router-outlet />
    </main>
  `,
  styles: [
    `
      nav {
        display: flex;
        gap: 5px;
      }
      .active {
        background-color: yellow;
        font-weight: bold;
      }
    `,
  ],
})
export class App {}
