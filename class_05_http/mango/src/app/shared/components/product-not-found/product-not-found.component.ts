import { Component, input } from '@angular/core';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-not-found',
  imports: [MatIconModule, RouterLink, MatAnchor, MatButtonModule],
  templateUrl: './product-not-found.component.html',
  styleUrl: './product-not-found.component.css',
})
export class ProductNotFound {
  productId = input.required<number | null>();
}
