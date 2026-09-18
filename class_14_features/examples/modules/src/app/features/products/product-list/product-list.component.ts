import { Component, OnInit } from '@angular/core';
import { Product, ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  template: `
    <h2>Products</h2>
    <app-card *ngFor="let product of products" [title]="product.name">
      <p>{{ product.description | truncate: 45 }}</p>
      <p><strong>{{ product.price | currency }}</strong></p>
      <a [routerLink]="[product.id]">Details</a>
    </app-card>
  `,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe((products) => (this.products = products));
  }
}
