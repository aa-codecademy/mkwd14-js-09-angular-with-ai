import { Component, input, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import type { ProductSortField } from '../../../store/features/product.feature';
import type { Category } from '../../../core/models/category.model';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import type { SortDirection } from '../../../core/types/sort-direction.type';

@Component({
  imports: [
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatChipsModule,
  ],
  selector: 'app-product-filters',
  styleUrl: './product-filters.component.css',
  templateUrl: './product-filters.component.html',
})
// A purely presentational ("dumb") component: it has NO store, no service, no HTTP.
// Everything comes in through inputs and everything goes out through outputs. That's what
// makes it reusable - the products page and the admin page both render it, each wiring it to
// a different store.
export class ProductFiltersComponent {
  // Inputs mirror the store's state, but as plain values. The component never learns *where*
  // those values live, which is exactly why it can be reused.
  search = input.required<string>();
  sortBy = input.required<ProductSortField>();
  sortDir = input.required<SortDirection>();
  categories = input<Category[]>([]);
  categoryId = input<number | null>(null);

  // Outputs are named `<input>Change` by convention. We only *report* what the user did -
  // deciding what it means (reset to page 1, refetch, etc.) is the store's job, not ours.
  searchChange = output<string>();
  sortByChange = output<ProductSortField>();
  sortDirChange = output<SortDirection>();
  categoryChange = output<number | null>();

  // A "variant" input: same logic, two looks. Prefer this over copy-pasting the component
  // when only the presentation differs - the template switches on it with @if.
  categoryStyle = input<'chips' | 'select'>('chips');
}
