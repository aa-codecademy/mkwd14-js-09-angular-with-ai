import { Component, input } from '@angular/core';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Shown by ProductDetails when product() is null (e.g. getById() found nothing for the id).
// Takes the failed id as a signal input purely to display it in the message below.
@Component({
  selector: 'app-product-not-found',
  imports: [MatIconModule, RouterLink, MatAnchor, MatButtonModule],
  templateUrl: './product-not-found.component.html',
  styleUrl: './product-not-found.component.css',
})
export class ProductNotFound {
  // input.required() - signal-based @Input(); Angular throws at runtime if the parent
  // template doesn't bind a value for it, unlike a plain optional input().
  productId = input.required<number | null>();
}
