import {
  Component,
  computed,
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
  // Writable signals hold this component's state - reading them in the template/computed requires
  // calling them as functions (products(), searchQuery()); forgetting the () gives you the signal
  // object itself, not its value, which is a common beginner mistake.
  products = signal<Product[]>([]);
  searchQuery = signal('');

  // The HTTP call itself is still RxJS (services return Observables) - Subscription cleanup is still
  // needed for that async call, signals don't replace RxJS, they just replace how you STORE the result.
  subscription: Subscription = new Subscription();

  // computed() derives a new value from other signals and re-runs ONLY when searchQuery() or
  // products() actually change - Angular tracks the dependencies automatically just by seeing which
  // signals get called inside this function, no manual dependency array like useMemo.
  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const products = this.products();

    if (!q) {
      return products;
    }

    return products.filter(
      (p) => p.name.toLocaleLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  });

  // Runs once, after Angular has set inputs - the right place to kick off initial data fetching.
  ngOnInit(): void {
    console.log('ProductListComponent component is initialized');
    this.subscription = this.productService.getAll().subscribe((products) => {
      this.products.set(products);
    });
  }

  // Runs right before Angular destroys the component (e.g. navigating away) - always clean up
  // subscriptions/timers here or they keep running and leak memory.
  ngOnDestroy(): void {
    console.log('ProductListComponent component is about to be destroyed');
    this.subscription.unsubscribe();
  }
}
