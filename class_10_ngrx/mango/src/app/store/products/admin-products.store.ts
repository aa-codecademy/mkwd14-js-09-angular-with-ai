import { signalStore, withComputed } from '@ngrx/signals';
import { withDevtools } from '@ngrx-toolkit/core';
import { withProductQuery } from '../features/product.feature';
import { withCategories } from '../features/categories.feature';
import { computed } from '@angular/core';

// The payoff of building with features: this whole store is a second, differently-configured
// copy of the products page logic. Zero duplicated code - compare it to ProductsStore, which
// uses the exact same two features with different options.
export const AdminProductsStore = signalStore(
  { providedIn: 'root' },
  // Admin wants a denser table, so it passes its own config. The feature's defaults stay
  // untouched; config is per-usage, which is why it lives in a parameter and not in state.
  withProductQuery({
    pageSize: 10,
    sortBy: 'name',
    sortDir: 'asc',
    pageSizeOptions: [10, 25, 50],
  }),
  withCategories(),
  // Extra computed values layered ON TOP of the feature. Because features apply in order,
  // this one can read `entities` - the signal that withProductQuery's withEntities added above.
  // Derive these; never keep a `lowStockCount` field in state that you must remember to update.
  withComputed(({ entities }) => ({
    lowStockCount: computed(() => entities().filter((product) => product.stock <= 5).length),
    outOfStockCount: computed(() => entities().filter((product) => product.stock === 0).length),
  })),
  // Each store needs a UNIQUE devtools name, or they'd overwrite each other in the Redux
  // DevTools panel and you'd be debugging the wrong state.
  withDevtools('AdminProductsStore'),
);
