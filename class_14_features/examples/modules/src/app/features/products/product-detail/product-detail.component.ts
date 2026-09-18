import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  template: `
    <a routerLink="..">← Back to products</a>
    <app-card *ngIf="product" [title]="product.name">
      <p>{{ product.description }}</p>
      <p><strong>{{ product.price | currency }}</strong></p>
    </app-card>
  `,
})
export class ProductDetailComponent implements OnInit {
  product?: Product;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe((product) => (this.product = product));
  }
}
