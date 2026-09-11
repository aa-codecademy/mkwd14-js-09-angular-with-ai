import {
  patchState,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import type { Category } from '../../core/models/category.model';
import { computed, inject } from '@angular/core';
import { CategoryService } from '../../shared/services/category.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

type CategoriesState = {
  categories: Category[];
};

// A deliberately tiny feature - proof that features don't have to be big. This one owns
// exactly one concern (the category list) and can be dropped into any store that needs it.
export function withCategories() {
  const initialState: CategoriesState = {
    categories: [],
  };

  return signalStoreFeature(
    withState(initialState),
    // Destructuring the state object in the parameter list pulls out just the signals you
    // need - `categories` here is already a signal, so you call it: `categories()`.
    withComputed(({ categories }) => ({
      hasCategories: computed(() => categories().length > 0),
    })),
    withMethods((store, categoryService = inject(CategoryService)) => ({
      // rxMethod<void> = "no argument". You call it as `store._loadCategories()` and the
      // pipeline runs once, which is exactly what a one-time fetch needs.
      _loadCategories: rxMethod<void>(
        pipe(
          switchMap(() =>
            categoryService.getAll().pipe(
              tap((categories) => patchState(store, { categories })),
              // Failing quietly with an empty array is a choice: a missing category filter
              // shouldn't break the whole product page.
              catchError(() => of([])),
            ),
          ),
        ),
      ),
    })),
    withHooks({
      onInit(store) {
        // Because the store is `providedIn: 'root'`, this fires only the first time anything
        // injects it - the categories are fetched once and shared for the app's lifetime.
        store._loadCategories();
      },
    }),
  );
}
