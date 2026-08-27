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
    // route.snapshot reads the route params once at creation time - fine here since navigating to a
    // different :id re-creates this component, but if the same component instance could be reused
    // across param changes you'd need route.paramMap (an Observable) instead to react to updates.
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productId.set(id);
    console.log('🚀 ~ ProductDetails ~ ngOnInit ~ id:', id);

    // Passing an observer object ({ next, error }) instead of a single callback lets you handle
    // HTTP errors (e.g. 404 from the API) separately from success - product() simply stays null on
    // error, which is what triggers the @else branch (<app-product-not-found>) in the template.
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
