import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import type { Order, OrderStatus } from '../../core/models/order.model';
import type { SortDirection } from '../../core/types/sort-direction.type';
import { computed, inject } from '@angular/core';
import {
  AdminOrderService,
  type AdminOrderQuery,
} from '../../shared/services/admin/admin.order.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withDevtools } from '@ngrx-toolkit/core';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

// This store is written the "long way" - state, computed, methods and hooks all inline in one
// signalStore() call. Read it next to product.feature.ts to see the difference: the same
// building blocks, just not extracted into a reusable feature. Do it this way when only one
// store will ever need the logic; extract a feature the moment a second store wants it.
type AdminOrdersState = {
  status: OrderStatus | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: SortDirection;
  total: number;
  loading: boolean;
  // A single "which row is busy" id instead of a boolean per row - lets the template disable
  // exactly one order's buttons while its status update is in flight.
  updatingId: number | null;
  expandedId: number | null;
};

// Starting with `loading: true` avoids a flash of "no orders found" before the first
// response arrives - the empty state only shows once loading has actually finished.
const initialState: AdminOrdersState = {
  status: null,
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortDir: 'desc',
  total: 0,
  loading: true,
  updatingId: null,
  expandedId: null,
};

export const AdminOrdersStore = signalStore(
  { providedIn: 'root' },
  // withEntities adds the normalized `entityMap`/`ids` collection for orders...
  withEntities<Order>(),
  // ...and withState adds our own fields on top. Each key becomes its own signal.
  withState(initialState),
  withComputed((state) => ({
    // Rename for the template's benefit: `store.orders()` reads better than `store.entities()`.
    orders: computed(() => state.entities()),
    // The single signal the request depends on. Change ANY field it reads and `query` produces
    // a new object, which is what makes the auto-refetch in onInit fire.
    query: computed(() => ({
      page: state.page(),
      limit: state.pageSize(),
      sortBy: state.sortBy(),
      sortDir: state.sortDir(),
      status: state.status() || undefined,
    })),
    // "Empty" has to include `!loading`, otherwise it'd be true for a split second on load.
    isEmpty: computed(() => !state.loading() && state.entities().length === 0),
    // Material's paginator is 0-based while our state and the API are 1-based.
    pageIndex: computed(() => state.page() - 1),
    pageSizeOptions: computed(() => [10, 25, 50]),
    statuses: computed(() => ['PENDING', 'SHIPPED', 'CANCELLED']),
  })),
  withDevtools('AdminOrdersStore'),

  withMethods((store, orderService = inject(AdminOrderService)) => {
    // Same rxMethod shape as the products feature: flag loading, switchMap the HTTP call,
    // write results, and keep catchError on the INNER pipe so an error can't kill the method.
    const load = rxMethod<AdminOrderQuery>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((query) =>
          orderService.getAll(query).pipe(
            tap((result) =>
              patchState(store, setAllEntities(result.data), {
                total: result.total,
                loading: false,
              }),
            ),
            catchError(() => {
              patchState(store, { loading: false });
              return of(null);
            }),
          ),
        ),
      ),
    );

    return {
      _load: load,
      // Any filter change also resets to page 1 - otherwise you could sit on page 4 of a
      // result set that now only has one page.
      setStatusFilter(status: OrderStatus | null) {
        patchState(store, { status, page: 1 });
      },
      setSortBy(sortBy: string) {
        patchState(store, { sortBy });
      },
      setSortDir(sortDir: SortDirection) {
        patchState(store, { sortDir });
      },
      // This setter takes Material's 0-based index and converts at the boundary, so the rest
      // of the store only ever deals in 1-based pages.
      setPage(pageIndex: number) {
        patchState(store, { page: pageIndex + 1 });
      },
      setPageSize(pageSize: number) {
        patchState(store, { pageSize });
      },
      updateStatus(order: Order, status: OrderStatus) {
        console.log(order.status, status);
      },

      setExpanded(id: number) {
        if (store.expandedId() === id) {
          patchState(store, { expandedId: null });
        } else {
          patchState(store, { expandedId: id });
        }
      },
    };
  }),

  withHooks({
    onInit(store) {
      // Passing the SIGNAL (no parentheses) subscribes the pipeline to it. Write
      // `store.query()` here instead and you'd fetch once and never react to a filter again.
      store._load(store.query);
    },
  }),
);
