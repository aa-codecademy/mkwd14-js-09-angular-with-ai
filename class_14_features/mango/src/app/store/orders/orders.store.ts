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
        // rxMethod<number> = call it as cancelOrder(7) and that number flows through the pipe.
        // It manages its own subscription and tears it down with the store - nothing to clean up.
        cancelOrder: rxMethod<number>(
          pipe(
            tap(() => patchState(store, { loading: true })),
            // switchMap CANCELS a previous in-flight cancel if a second one starts. For a write
            // like this that's a deliberate choice: the last click is the one that counts.
            switchMap((orderId) =>
              orderService.cancelOrder(orderId).pipe(
                tap(() => {
                  notificationService.showSuccess('Order canceled successfully.');
                }),
                // Swallowing the error with of(null) keeps the rxMethod ALIVE. Let the error
                // escape instead and the whole pipe completes - the next click does nothing.
                catchError((err) => {
                  patchState(store, { loading: false });
                  notificationService.showError(
                    err.error.message || 'Error while canceling order.',
                  );
                  return of(null);
                }),
              ),
            ),
            // Refetch instead of patching the one order locally: the server may have changed more
            // than the status (stock, totals), and one extra GET is cheaper than a stale UI.
            // GOTCHA: this also runs after a FAILED cancel, because catchError above turned the
            // failure into a successful of(null). Move the refetch inside the success tap to fix it.
            mergeMap(() =>
              orderService.getMyOrders().pipe(
                tap((res) => patchState(store, setAllEntities(res), { loading: false })),
                // of() with no arguments completes WITHOUT emitting - fine here, since there's
                // nothing downstream that needs a value. of(null) would emit one.
                catchError(() => {
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
