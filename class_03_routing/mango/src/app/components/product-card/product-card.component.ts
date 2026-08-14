import { Component, input } from '@angular/core';
import type { Product } from '../../core/models/product.model';
import { MatCard, MatCardImage, MatCardContent, MatCardActions } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

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
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  // The new signal-based `input()` API - required() means the parent MUST pass [product]
  // or Angular throws at compile/runtime; read it in the template as product() (a function call).
  product = input.required<Product>();

  // Stubbed out on purpose for this lesson - wire this up to a cart service in a later exercise.
  addToCart(id: number) {
    throw new Error('Method not implemented.');
  }
}
