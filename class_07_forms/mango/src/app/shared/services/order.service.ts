import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../tokens/api-url.token';
import type { Observable } from 'rxjs';
import type { CreateOrder, Order } from '../../core/models/order.model';

// providedIn: 'root' = one shared instance for the whole app (a singleton), tree-shaken away
// if nothing injects it. You never add it to a component's `providers` with this setup.
@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  // Injecting the URL through a token (instead of importing environment.ts here) keeps the
  // service ignorant of where the value comes from - easy to swap in tests.
  private apiUrl = inject(API_URL);

  // Note the two different types: CreateOrder is what we SEND, Order is what the API RETURNS.
  // Returning the Observable (not subscribing here) lets the component decide when to fire it.
  create(body: CreateOrder): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, body);
  }
}
