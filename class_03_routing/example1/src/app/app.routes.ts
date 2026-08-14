import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

// Routes are just a plain array of Route objects — the Router walks this array
// top to bottom and renders the first path that matches the current URL.
export const routes: Routes = [
  {
    // An empty path matches the root URL ('/'), i.e. the "home page" route.
    path: '',
    // loadComponent lazy-loads the component's JS only when this route is visited,
    // instead of bundling it into the initial app load — keeps the first load small.
    loadComponent: () => import('./home.component').then((module) => module.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./products.component').then((module) => module.ProductsComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./about.component').then((module) => module.AboutComponent),
  },
  {
    // '**' is the wildcard route — it matches ANY URL that didn't match a route above.
    // Gotcha: it MUST be the last item in the array, otherwise it would match
    // everything first and none of the routes below it would ever be reached.
    path: '**',
    loadComponent: () => import('./not-found.component').then((module) => module.NotFoundComponent),
  },
];
