import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },

  // Lazy-loaded feature modules: the whole module (with its own routing,
  // declarations and providers) is downloaded only when the route is visited.
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.module').then((m) => m.ProductsModule),
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.module').then((m) => m.OrdersModule),
  },

  { path: '**', redirectTo: '' },
];

@NgModule({
  // forRoot() only in the root routing module — feature modules use forChild().
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
