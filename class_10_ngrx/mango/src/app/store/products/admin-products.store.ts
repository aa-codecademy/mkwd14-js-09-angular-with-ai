import { signalStore, withComputed } from '@ngrx/signals';
import { withProductQuery } from '../features/product.feature';
import { withCategories } from '../features/categories.feature';
import { computed } from '@angular/core';

export const AdminProductsStore = signalStore(
  { providedIn: 'root' },
  withProductQuery({
    pageSize: 10,
    sortBy: 'name',
    sortDir: 'asc',
    pageSizeOptions: [10, 25, 50],
  }),
  withCategories(),
  withComputed(({ entities }) => ({
    lowStockCount: computed(() => entities().filter((product) => product.stock <= 5).length),
    outOfStockCount: computed(() => entities().filter((product) => product.stock === 0).length),
  })),
);
