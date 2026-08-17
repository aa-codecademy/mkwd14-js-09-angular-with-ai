import {
  Component,
  inject,
  type AfterViewInit,
  type OnChanges,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import type { Product } from '../../core/models/product.model';
import { ProductService } from '../../shared/services/product.service';
import { JsonPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  imports: [JsonPipe, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
// Implementing these lifecycle interfaces is optional but gives you compile-time checking that
// each ngOnX method below matches Angular's expected signature - this is the router's 'products' page.
export class ProductListComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  // inject() is the modern alternative to constructor-parameter DI (see commented-out line below) -
  // both do the same thing, but inject() works in field initializers and plain functions too.
  private productService = inject(ProductService);
  products: Product[] = [];
  // Kept so we can unsubscribe in ngOnDestroy - forgetting to unsubscribe is a classic memory leak.
  subscription: Subscription = new Subscription();
  // constructor(private readonly productService: ProductService) {}

  // Runs once, after Angular has set inputs - the right place to kick off initial data fetching.
  ngOnInit(): void {
    console.log('ProductListComponent component is initialized');
    this.subscription = this.productService.products().subscribe((products) => {
      this.products = products;
    });
  }

  addRandomProduct() {
    this.productService.addProduct({
      id: Math.round(Math.random() * 1000),
      name: `Random Product name ${Math.round(Math.random() * 1000)}`,
      description: 'Some description',
      price: Math.round(Math.random() * 1000),
      discountPercent: Math.round(Math.random() * 100),
      image: 'nemame.jpg',
      stock: Math.round(Math.random() * 1000),
      featured: false,
    });
  }

  // Fires whenever an @Input()-bound value changes - this component has no @Input, so in practice
  // this only runs once on init; kept here to demonstrate the lifecycle hook order.
  ngOnChanges(): void {
    console.log('ProductListComponent component has changed');
  }

  // Runs once after the component's view (and child views) have been fully rendered - useful for
  // DOM measurements or third-party widget init that needs the template already in the page.
  ngAfterViewInit(): void {
    console.log('ProductListComponent component has initialized the view');
  }

  // Runs right before Angular destroys the component (e.g. navigating away) - always clean up
  // subscriptions/timers here or they keep running and leak memory.
  ngOnDestroy(): void {
    console.log('ProductListComponent component is about to be destroyed');
    this.subscription.unsubscribe();
  }
}
