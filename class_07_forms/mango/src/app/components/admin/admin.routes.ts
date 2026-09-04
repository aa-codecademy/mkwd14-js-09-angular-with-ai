import type { Routes } from '@angular/router';

// A child route file: app.routes.ts mounts this with loadChildren under 'admin', so every path
// below is relative to /admin. Keeping admin routes in their own file means the whole admin
// area ships as a separate lazy chunk - visitors who never open /admin never download it.
export const adminRoutes: Routes = [
  // path: '' is the default child - it matches /admin exactly.
  { path: '', loadComponent: () => import('./admin.component').then((m) => m.AdminComponent) },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
  {
    // :id is a route parameter. Both routes reuse the SAME component - it decides create vs edit
    // by reading the param, which is the usual pattern for form screens.
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
];
