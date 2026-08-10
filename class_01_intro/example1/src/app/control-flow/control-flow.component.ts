import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';

type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
};

@Component({
  selector: 'app-control-flow',
  imports: [CurrencyPipe],
  standalone: true,
  templateUrl: './control-flow.component.html',
  styleUrl: './control-flow.component.css',
})
export class ControlFlow {
  products: Product[] = [
    { id: 1, name: 'Laptop', price: 999, inStock: true },
    { id: 2, name: 'Phone', price: 499, inStock: false },
    { id: 3, name: 'Tablet', price: 299, inStock: true },
  ];
}
