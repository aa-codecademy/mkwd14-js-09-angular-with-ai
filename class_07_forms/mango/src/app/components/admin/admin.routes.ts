import type { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  { path: '', loadComponent: () => import('./admin.component').then((m) => m.AdminComponent) },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
];
