import { Component, input } from '@angular/core';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Shown by ProductDetails when a route like /products/999 resolves to no matching product -
// this is app-level "not found" logic (the route itself is valid), unlike the '**' wildcard NotFound.
@Component({
  selector: 'app-product-not-found',
  imports: [MatIconModule, RouterLink, MatAnchor, MatButtonModule],
  templateUrl: './product-not-found.component.html',
  styleUrl: './product-not-found.component.css',
})
export class ProductNotFound {
  // input.required<T>() is the signal-based inputs API - Angular throws if the parent template
  // doesn't bind [productId], and consumers read the current value by calling productId() as a function.
  productId = input.required<number | null>();
}
