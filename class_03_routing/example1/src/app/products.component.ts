import { Component } from '@angular/core';

// Routed to via the 'products' path — only downloaded when the user actually
// navigates here, thanks to loadComponent's lazy import in app.routes.ts.
@Component({
  selector: 'app-products',
  template: `<h1>Products Page</h1>`,
})
export class ProductsComponent {}
