import { Component, inject } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ProductsStore } from '../../store/products/products.store';
import { MatSelectModule } from '@angular/material/select';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ProductFiltersComponent } from "../../shared/components/product-filters/product-filters.component";

@Component({
  selector: 'app-product-list',
  imports: [
    ProductCardComponent,
    PaginationComponent,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatSelectModule,
    ProductFiltersComponent
],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
// Compare this to the class_06 version of the same page: no signals, no subscriptions, no
// ngOnInit, no ngOnDestroy, no debounce plumbing. Moving all of it into the store turned this
// into a "dumb" component whose only job is to render the store and forward user events.
export class ProductListComponent {
  // `protected` (not private) because the template needs to read it - Angular templates can
  // reach protected members, and keeping it out of `public` stops other code depending on it.
  // `readonly` because the store reference itself never changes; only the state inside it does.
  protected readonly store = inject(ProductsStore);
}
