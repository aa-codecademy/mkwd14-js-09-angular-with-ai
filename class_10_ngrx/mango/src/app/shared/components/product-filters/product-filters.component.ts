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
export class ProductFiltersComponent {
  search = input.required<string>();
  sortBy = input.required<ProductSortField>();
  sortDir = input.required<SortDirection>();
  categories = input<Category[]>([]);
  categoryId = input<number | null>(null);

  searchChange = output<string>();
  sortByChange = output<ProductSortField>();
  sortDirChange = output<SortDirection>();
  categoryChange = output<number | null>();

  categoryStyle = input<'chips' | 'select'>('chips');
}
