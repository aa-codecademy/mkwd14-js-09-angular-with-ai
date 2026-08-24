import {
  Component,
  inject,
  signal,
  type AfterViewInit,
  type OnChanges,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import type { Product } from '../../core/models/product.model';
import { ProductService } from '../../shared/services/product.service';
import { JsonPipe } from '@angular/common';
import { single, Subscription } from 'rxjs';
import { ProductCardComponent } from '../product-card/product-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-list',
  imports: [
    JsonPipe,
    ProductCardComponent,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
// Implementing these lifecycle interfaces is optional but gives you compile-time checking that
// each ngOnX method below matches Angular's expected signature - this is the router's 'products' page.
export class ProductListComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);

  searchQuery = '';

  subscription: Subscription = new Subscription();

  // Runs once, after Angular has set inputs - the right place to kick off initial data fetching.
  ngOnInit(): void {
    console.log('ProductListComponent component is initialized');
    this.subscription = this.productService.getAll().subscribe((products) => {
      this.products.set(products);
      this.filteredProducts.set(products);
    });
  }

  searchProducts() {
    const allProducts = this.products();

    const filteredProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );

    this.filteredProducts.set(filteredProducts);
  }

  // Runs right before Angular destroys the component (e.g. navigating away) - always clean up
  // subscriptions/timers here or they keep running and leak memory.
  ngOnDestroy(): void {
    console.log('ProductListComponent component is about to be destroyed');
    this.subscription.unsubscribe();
  }
}
