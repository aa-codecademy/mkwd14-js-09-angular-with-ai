import {
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
  patchState,
} from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { Product } from '../../core/models/product.model';
import { computed, inject, type Signal } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

export type ProductSortField = 'id' | 'name' | 'price' | 'stock' | 'rating' | 'createdAt';

export type SortDirection = 'asc' | 'desc';

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

export type ProductQueryConfig = {
  pageSize?: number;
  sortBy?: ProductSortField;
  sortDir?: SortDirection;
  pageSizeOptions?: readonly number[];
  searchDebounceMs?: number;
};

export type ProductQueryState = {
  searchInput: string;
  search: string; // debounced
  categoryId: number | null;
  sortBy: ProductSortField;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
};

export function withProductQuery(config: ProductQueryConfig = {}) {
  const {
    pageSize = 12,
    sortBy = 'createdAt',
    sortDir = 'desc',
    pageSizeOptions = [],
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
    withEntities<Product>(),
    withState(initialState),
    withComputed((state) => {
      const query: Signal<ProductQuery> = computed(() => ({
        search: state.search() || undefined,
        categoryId: state.categoryId() ?? undefined,
        sortBy: state.sortBy(),
        sortDir: state.sortDir(),
        page: state.page(),
        limit: state.pageSize(),
      }));

      return {
        query,
        products: computed(() => state.entities()),
      };
    }),
    withMethods((store, productService = inject(ProductService)) => {
      const load = rxMethod<ProductQuery>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((query) =>
            productService.getAll(query).pipe(
              tap((result) =>
                patchState(store, setAllEntities(result.data), {
                  total: result.total,
                  totalPages: result.totalPages,
                  isLoading: false,
                }),
              ),
              catchError(() => {
                patchState(store, { isLoading: false });
                return of(null);
              }),
            ),
          ),
        ),
      );

      return {
        _load: load,
      };
    }),
  );
}
