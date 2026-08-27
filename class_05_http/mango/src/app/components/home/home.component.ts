import { Component, inject, signal, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import { ProductService } from '../../shared/services/product.service';
import type { Product } from '../../core/models/product.model';
import { ProductCardComponent } from "../product-card/product-card.component";

// This is the component lazy-loaded for the '' (root) route in app.routes.ts.
@Component({
  selector: 'app-home',
  // Must import CardShellComponent here to use <app-card-shell> in the template - standalone
  // components don't automatically "see" each other, each declares its own dependencies.
  imports: [RouterLink, MatAnchor, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
// No logic needed here - this component's only job is to compose markup via CardShellComponent.
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);

  // signal() holds reactive state - templates that read featuredProducts() automatically re-render
  // when .set() is called, without needing Zone.js change detection to guess that something changed.
  featuredProducts = signal<Product[]>([]);

  ngOnInit(): void {
    // No unsubscribe/ngOnDestroy here: this Observable emits once and completes (a typical HTTP
    // response), so there's nothing left running to leak - unlike a subscription to a stream that
    // keeps emitting (e.g. a WebSocket or interval), which would need explicit cleanup.
    this.productService.getFeatured().subscribe((featuredProducts) => {
      this.featuredProducts.set(featuredProducts);
    });
  }
}
