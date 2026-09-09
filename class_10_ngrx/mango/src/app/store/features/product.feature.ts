import {
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { Product } from '../../core/models/product.model';
import { computed, inject, type Signal } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { catchError, debounceTime, distinctUntilChanged, of, pipe, switchMap, tap } from 'rxjs';
import type { SortDirection } from '../../core/types/sort-direction.type';

export type ProductSortField = 'id' | 'name' | 'price' | 'stock' | 'rating' | 'createdAt';

// This is the shape we send TO the server. Keeping it separate from the store's own state
// (below) means the UI can hold extra bookkeeping the API never needs to know about.
export interface ProductQuery {
  search?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
  sortBy?: ProductSortField;
  sortDir?: SortDirection;
}

/** Mirrors the backend's PaginatedProducts response. */
export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Config is passed in when the feature is used, NOT stored in state - these are constants
// chosen by whoever builds the store, so they never need to trigger a re-render.
export type ProductQueryConfig = {
  pageSize?: number;
  sortBy?: ProductSortField;
  sortDir?: SortDirection;
  pageSizeOptions?: readonly number[];
  searchDebounceMs?: number;
};

export type ProductQueryState = {
  // Two separate search fields on purpose: `searchInput` updates on every keystroke so the
  // textbox feels instant, while `search` only catches up after the debounce fires.
  // If you bound the HTTP request straight to `searchInput` you'd fire a request per letter.
  searchInput: string;
  search: string; // debounced
  categoryId: number | null;
  sortBy: ProductSortField;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
  // `total`/`totalPages` are server-owned values we cache so the paginator can render.
  total: number;
  totalPages: number;
  isLoading: boolean;
};

// A *feature*, not a store. `signalStoreFeature` returns a reusable bundle of state +
// computed + methods that you plug into any `signalStore()`. Think of it as a mixin:
// it lets you split one big store into focused, testable, shareable pieces.
export function withProductQuery(config: ProductQueryConfig = {}) {
  // Destructuring with defaults - the caller can override any single option and still
  // get sensible values for the rest.
  const {
    pageSize = 12,
    sortBy = 'createdAt',
    sortDir = 'desc',
    pageSizeOptions = [4, 8, 12, 24, 48, 96],
    searchDebounceMs = 400,
  } = config;

  const initialState: ProductQueryState = {
    searchInput: '',
    search: '',
    categoryId: null,
    sortBy,
    sortDir,
    page: 1,
    pageSize,
    total: 0,
    totalPages: 1,
    isLoading: false,
  };

  return signalStoreFeature(
    // withEntities gives you a normalized collection: an `entityMap` (id -> Product) plus an
    // `ids` array, and exposes them as an `entities()` signal. Normalizing means updating one
    // product is a cheap map write instead of scanning and rebuilding a whole array.
    withEntities<Product>(),
    // Every key in the object becomes its OWN signal on the store - so `state.page` is a
    // signal, and reading it is `state.page()`. That's why components can depend on just the
    // slice they use instead of re-rendering whenever anything in the store changes.
    withState(initialState),
    withComputed((state) => {
      // Computed signals are derived and lazy: this re-runs only when one of the signals it
      // reads actually changes, and only if somebody is listening. Never store derived data
      // in state - you'd then have two sources of truth to keep in sync.
      const query: Signal<ProductQuery> = computed(() => ({
        // Empty string / null get normalized to `undefined` so the service can skip the param
        // entirely rather than sending `search=`.
        search: state.search() || undefined,
        categoryId: state.categoryId() ?? undefined,
        sortBy: state.sortBy(),
        sortDir: state.sortDir(),
        page: state.page(),
        limit: state.pageSize(),
      }));

      return {
        query,
        // Friendlier name for the entities collection so templates read `store.products()`.
        products: computed(() => state.entities()),
        // Constant wrapped in a computed just to keep the store's public API uniform -
        // everything you read off the store is a signal you call.
        pageSizeOptions: computed(() => pageSizeOptions),
        hasActiveFilters: computed(() => state.search() !== '' || state.categoryId() !== null),
        firstResult: computed(() =>
          state.total() === 0 ? 0 : (state.page() - 1) * state.pageSize() + 1,
        ),
        lastResult: computed(() => Math.min(state.page() * state.pageSize(), state.total())),
      };
    }),
    // The second parameter with a default value is the DI trick for signal stores: `inject()`
    // can only run in an injection context, and withMethods' factory IS one. You cannot
    // `inject()` inside the returned methods later.
    withMethods((store, productService = inject(ProductService)) => {
      // rxMethod bridges signals and RxJS. Call it with a *signal* and it re-runs the pipeline
      // every time that signal changes; call it with a plain value and it runs once.
      const load = rxMethod<ProductQuery>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          // switchMap CANCELS the in-flight request when a new query arrives. Use it (not
          // mergeMap) for search-as-you-type, or a slow old response can land last and
          // overwrite the newest results.
          switchMap((query) =>
            productService.getAll(query).pipe(
              tap((result) =>
                // patchState takes updaters and/or partial objects and applies them in one go -
                // one atomic state change, so subscribers see the entities and the totals update
                // together instead of in two separate ticks.
                patchState(store, setAllEntities(result.data), {
                  total: result.total,
                  totalPages: result.totalPages,
                  isLoading: false,
                }),
              ),
              // catchError MUST be on the inner observable. Put it on the outer pipe and the
              // first error kills the whole rxMethod - it would never react to a query again.
              catchError(() => {
                patchState(store, { isLoading: false });
                return of(null);
              }),
            ),
          ),
        ),
      );

      const commitSearch = rxMethod<string>(
        pipe(
          // debounceTime waits for the user to stop typing; distinctUntilChanged drops
          // duplicates (e.g. type a letter then delete it) so we don't refetch identical data.
          debounceTime(searchDebounceMs),
          distinctUntilChanged(),
          // Resetting to page 1 matters: you're on page 5, you filter down to 3 pages, and
          // without this you'd be stuck staring at an empty page.
          tap((search) => patchState(store, { search, page: 1 })),
        ),
      );

      return {
        // Leading underscore is the NgRx convention for "internal" members - they're still
        // reachable, it's just a signal to other developers that components shouldn't call them.
        _load: load,
        _commitSearch: commitSearch,

        setSearch(searchInput: string): void {
          // Only touches the instant-feedback field. The debounced pipeline (wired up in
          // onInit) is what eventually turns this into a request.
          patchState(store, { searchInput });
        },
        setCategory(categoryId: number | null): void {
          patchState(store, { categoryId, page: 1 });
        },
        setSortField(sortField: ProductSortField): void {
          patchState(store, { sortBy: sortField });
        },
        setSortDir(sortDir: SortDirection): void {
          patchState(store, { sortDir: sortDir });
        },
        setPage(page: number): void {
          // Clamping here keeps invalid state impossible to reach - the store, not each
          // caller, owns the rule "page is between 1 and totalPages".
          patchState(store, { page: Math.min(Math.max(page, 1), store.totalPages()) });
        },
        setPageSize(pageSize: number): void {
          patchState(store, { pageSize, page: 1 });
        },
        clearFilters(): void {
          patchState(store, {
            searchInput: '',
            search: '',
            categoryId: null,
            page: 1,
          });
        },
      };
    }),
    // withHooks is the store's lifecycle. onInit runs once, when the store is first injected.
    withHooks({
      onInit(store) {
        // Passing SIGNALS (not `store.searchInput()`) is the whole point: each rxMethod now
        // watches its signal forever. Change any filter and the request re-fires automatically -
        // no manual "reload after every setter" calls anywhere in the app.
        store._commitSearch(store.searchInput);
        store._load(store.query);
      },
    }),
  );
}
