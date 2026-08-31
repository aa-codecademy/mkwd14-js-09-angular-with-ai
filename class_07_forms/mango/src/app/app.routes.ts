import { Routes } from '@angular/router';

// Routes array maps URL paths to the standalone component that should render in <router-outlet>.
export const routes: Routes = [
  {
    path: '',
    // loadComponent uses a dynamic import() so this component's code is split into its own JS chunk
    // and only downloaded when the user actually visits this route - this is lazy loading.
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./components/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./components/product-details/product-details.component').then(
        (m) => m.ProductDetails,
      ),
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./components/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFound),
  },
  // Gotcha: any wildcard/catch-all route ({ path: '**', ... }) must always be the LAST entry here -
  // the router matches top to bottom, so a wildcard placed earlier would swallow every other route.
];
