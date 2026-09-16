import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../../tokens/api-url.token';
import { of, type Observable } from 'rxjs';
import type { CreateOrder, Order, OrderStatus } from '../../../core/models/order.model';
import type { SortDirection } from '../../../core/types/sort-direction.type';
import { NotificationService } from '../notification.service';

export interface AdminOrderQuery {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: SortDirection;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private apiUrl = inject(API_URL);

  // Note the two different types: CreateOrder is what we SEND, Order is what the API RETURNS.
  // Returning the Observable (not subscribing here) lets the component decide when to fire it.
  getAll(query: AdminOrderQuery): Observable<PaginatedOrders> {
    let params = new HttpParams().set('page', query.page ?? 1).set('limit', query.limit ?? 10);

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    if (query.sortDir) {
      params = params.set('sortDir', query.sortDir);
    }

    return this.http.get<PaginatedOrders>(`${this.apiUrl}/orders/admin`, { params });
  }

  updateStatus(order: Order, status: OrderStatus): Observable<Order> {
    if (order.status === 'PENDING') {
      if (status !== 'SHIPPED' && status !== 'CANCELLED') {
        this.notificationService.showError(
          `Invalid status, cannot go from ${order.status} to ${status}`,
        );
        return of();
      }
    } else if (order.status === 'SHIPPED') {
      if (status !== 'DELIVERED') {
        this.notificationService.showError(
          `Invalid status, cannot go from ${order.status} to ${status}`,
        );
        return of();
      }
    } else if (order.status === 'DELIVERED') {
      this.notificationService.showError(
        `Invalid status, cannot go from ${order.status} to ${status}`,
      );
      return of();
    } else if (order.status === 'CANCELLED') {
      this.notificationService.showError(
        `Invalid status, cannot go from ${order.status} to ${status}`,
      );
      return of();
    } else {
      this.notificationService.showError('Invalid status!');
    }

    const body = {
      status,
    };

    return this.http.patch<Order>(`${this.apiUrl}/orders/${order.id}/status`, body);
  }
}
