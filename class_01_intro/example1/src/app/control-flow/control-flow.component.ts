import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';

// Defining a `type` for the data shape gives you autocomplete and compile-time
// safety in the template — TS knows `product.price` is a number, not `any`.
type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
};

@Component({
  selector: 'app-control-flow',
  // CurrencyPipe is used in the template via the `| currency` pipe — pipes must
  // be imported explicitly on standalone components, just like child components.
  imports: [CurrencyPipe],
  standalone: true, // Default in modern Angular; shown here for clarity/emphasis.
  templateUrl: './control-flow.component.html',
  styleUrl: './control-flow.component.css',
})
export class ControlFlow {
  // Hardcoded data for the demo — in a real app this would come from a service/API.
  products: Product[] = [
    { id: 1, name: 'Laptop', price: 999, inStock: true },
    { id: 2, name: 'Phone', price: 499, inStock: false },
    { id: 3, name: 'Tablet', price: 299, inStock: true },
  ];
}
