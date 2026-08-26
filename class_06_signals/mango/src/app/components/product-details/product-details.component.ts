import { Component, inject, signal, type OnInit } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Product } from '../../core/models/product.model';
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CartService } from '../../shared/services/cart.service';
import { ProductNotFound } from "../../shared/components/product-not-found/product-not-found.component";

@Component({
  selector: 'app-product-details',
  imports: [JsonPipe, MatButtonModule, RouterLink, MatIcon, CurrencyPipe, ProductNotFound],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product = signal<Product | null>(null);
  productId = signal<number | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productId.set(id);
    console.log('🚀 ~ ProductDetails ~ ngOnInit ~ id:', id);

    this.productService.getById(id).subscribe({
      next: (product) => this.product.set(product),
      error: (error) => console.log(error),
    });
  }

  addToCart() {
    const p = this.product();
    if (!p) {
      return;
    }
    this.cartService.add(p);
  }
}
