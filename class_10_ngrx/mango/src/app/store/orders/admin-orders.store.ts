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

type AdminOrdersState = {
  status: OrderStatus | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: SortDirection;
  total: number;
  loading: boolean;
  updatingId: number | null;
};

const initialState: AdminOrdersState = {
  status: null,
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortDir: 'desc',
  total: 0,
  loading: true,
  updatingId: null,
};

export const AdminOrdersStore = signalStore(
  { providedIn: 'root' },
  withEntities<Order>(),
  withState(initialState),
  withComputed((state) => ({
    orders: computed(() => state.entities()),
    query: computed(() => ({
      page: state.page(),
      limit: state.pageSize(),
      sortBy: state.sortBy(),
      sortDir: state.sortDir(),
      status: state.status() || undefined,
    })),
    isEmpty: computed(() => !state.loading() && state.entities().length === 0),
    pageIndex: computed(() => state.page() - 1),
    pageSizeOptions: computed(() => [10, 25, 50]),
    statuses: computed(() => ['PENDING', 'SHIPPED', 'CANCELLED']),
  })),
  withDevtools('AdminOrdersStore'),

  withMethods((store, orderService = inject(AdminOrderService)) => {
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
      setStatusFilter(status: OrderStatus | null) {
        patchState(store, { status, page: 1 });
      },
      setSortBy(sortBy: string) {
        patchState(store, { sortBy });
      },
      setSortDir(sortDir: SortDirection) {
        patchState(store, { sortDir });
      },
      setPage(pageIndex: number) {
        patchState(store, { page: pageIndex + 1 });
      },
      setPageSize(pageSize: number) {
        patchState(store, { pageSize });
      },
    };
  }),

  withHooks({
    onInit(store) {
      store._load(store.query);
    },
  }),
);
