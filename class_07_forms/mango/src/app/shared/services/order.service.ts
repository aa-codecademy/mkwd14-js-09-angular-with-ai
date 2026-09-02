import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../tokens/api-url.token';
import type { Observable } from 'rxjs';
import type { CreateOrder, Order } from '../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  create(body: CreateOrder): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, body);
  }
}
