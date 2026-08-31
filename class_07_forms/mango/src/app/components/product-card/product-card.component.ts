import { Component, inject, input } from '@angular/core';
import type { Product } from '../../core/models/product.model';
import { MatCard, MatCardImage, MatCardContent, MatCardActions } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CartService } from '../../shared/services/cart.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-product-card',
  // Each Material piece (card, image, actions, icon, button) is imported individually rather than
  // one big module - standalone Angular Material lets you import just the directives you render.
  imports: [
    MatCard,
    MatCardImage,
    MatCardContent,
    CurrencyPipe,
    MatCardActions,
    MatButtonModule,
    MatIcon,
    RouterLink
],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  private cartService = inject(CartService);
  // The new signal-based `input()` API - required() means the parent MUST pass [product]
  // or Angular throws at compile/runtime; read it in the template as product() (a function call).
  product = input.required<Product>();

  // Stubbed out on purpose for this lesson - wire this up to a cart service in a later exercise.
  addToCart(product: Product) {
    this.cartService.add(product);
  }
}
