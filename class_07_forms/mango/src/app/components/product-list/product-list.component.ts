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
import {
  debounce,
  debounceTime,
  distinctUntilChanged,
  single,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { ProductCardComponent } from '../product-card/product-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '../../shared/services/category.service';
import { Category } from '../../core/models/category.model';
import { MatChipsModule } from '@angular/material/chips';

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
    MatChipsModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
// Implementing these lifecycle interfaces is optional but gives you compile-time checking that
// each ngOnX method below matches Angular's expected signature - this is the router's 'products' page.
export class ProductListComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  products = signal<Product[]>([]);
  // Bound to the search input via [(ngModel)] in the template. Gotcha: banana-in-a-box two-way
  // binding works directly on a WritableSignal in modern Angular (it calls .set() under the hood),
  // but this only updates the signal - it does NOT itself trigger the HTTP search; that's why
  // onSearch() below still pushes into the searchTerms Subject.
  searchQuery = signal('');

  categories = signal<Category[]>([]);
  activeCategoryId = signal<number | null>(null);

  subscription: Subscription = new Subscription();

  // A plain RxJS Subject is used (not a signal) specifically to get access to operators like
  // debounceTime/distinctUntilChanged/switchMap - this is a case where RxJS is still the better
  // tool than signals, since signals have no built-in equivalent for "wait for typing to pause".
  private searchTerms = new Subject<string>();

  ngOnInit(): void {
    this.searchTerms
      .pipe(
        // debounceTime(400) waits for a pause in typing before firing, avoiding an HTTP request
        // on every keystroke; distinctUntilChanged() then skips re-searching if the debounced
        // value didn't actually change from the last one.
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          return this.productService.search(searchTerm.trim());
        }),
      )
      .subscribe((products) => {
        console.log('🚀 ~ ProductListComponent ~ ngOnInit ~ products:', products);
        this.products.set(products);
      });

    this.searchTerms.next('');

    this.categoryService.getAll().subscribe((categories) => {
      this.categories.set(categories);
    });
  }

  onSearch(searchTerm: string) {
    this.searchTerms.next(searchTerm);
  }

  // Runs right before Angular destroys the component (e.g. navigating away) - always clean up
  // subscriptions/timers here or they keep running and leak memory.
  ngOnDestroy(): void {
    console.log('ProductListComponent component is about to be destroyed');
    this.subscription.unsubscribe();
  }
}
