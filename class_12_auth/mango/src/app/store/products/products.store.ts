import { signalStore } from '@ngrx/signals';
import { withDevtools } from '@ngrx-toolkit/core';
import { withProductQuery } from '../features/product.feature';
import { withCategories } from '../features/categories.feature';

// signalStore() builds the actual injectable class. Notice how little lives here: all the
// behaviour comes from features, so this file just declares WHAT this store is made of.
export const ProductsStore = signalStore(
  // `providedIn: 'root'` makes the store an app-wide singleton, so every component that
  // injects it shares the same state - navigate away and back and your filters survive.
  // Drop this option and you must list the store in a component's `providers`, which gives
  // each component instance its own fresh copy instead.
  { providedIn: 'root' },
  // Order matters: features are applied top to bottom, and a later feature can read the
  // state/computed/methods that earlier ones added (that's how you'd build on top of them).
  withProductQuery({
    pageSize: 12,
    pageSizeOptions: [4, 8, 12, 24, 48, 96],
  }),
  withCategories(),
  withDevtools('ProductsStore'),
);
