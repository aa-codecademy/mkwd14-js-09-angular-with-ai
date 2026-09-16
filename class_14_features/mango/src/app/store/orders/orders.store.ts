import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import type { Order } from '../../core/models/order.model';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withDevtools } from '@ngrx-toolkit/core';
import { catchError, mergeMap, of, pipe, switchMap, tap } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { OrderService } from '../../shared/services/order.service';

type OrdersState = {
  loading: boolean;
};

const initialState: OrdersState = {
  loading: false,
};

export const OrdersStore = signalStore(
  { providedIn: 'root' },

  withEntities<Order>(),
  // ...and withState adds our own fields on top. Each key becomes its own signal.
  withState(initialState),
  withComputed((state) => ({
    orders: computed(() => state.entities()),

    isEmpty: computed(() => !state.loading() && state.entities().length === 0),

    statuses: computed(() => ['PENDING', 'SHIPPED', 'CANCELLED', 'DELIVERED']),
  })),
  withDevtools('OrdersStore'),

  withMethods(
    (
      store,
      orderService = inject(OrderService),
      notificationService = inject(NotificationService),
    ) => {
      const loadMyOrders = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(() =>
            orderService.getMyOrders().pipe(
              tap((res) => {
                patchState(store, setAllEntities(res), {
                  loading: false,
                });
              }),

              catchError(() => {
                patchState(store, { loading: false });
                return of(null);
              }),
            ),
          ),
        ),
      );

      return {
        loadMyOrders,
        cancelOrder: rxMethod<number>(
          pipe(
            tap(() => patchState(store, { loading: true })),
            switchMap((orderId) =>
              orderService.cancelOrder(orderId).pipe(
                tap(() => {
                  notificationService.showSuccess('Order canceled successfully.');
                }),
                catchError((err) => {
                  patchState(store, { loading: false });
                  notificationService.showError(
                    err.error.message || 'Error while canceling order.',
                  );
                  return of(null);
                }),
              ),
            ),
            mergeMap(() =>
              orderService.getMyOrders().pipe(
                tap((res) => patchState(store, setAllEntities(res), { loading: false })),
                catchError((err) => {
                  patchState(store, { loading: false });
                  return of();
                }),
              ),
            ),
          ),
        ),
      };
    },
  ),
);
