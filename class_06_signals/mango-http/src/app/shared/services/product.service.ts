import { inject, Injectable } from '@angular/core';
import type { Product } from '../../core/models/product.model';
import { BehaviorSubject, type Observable } from 'rxjs';
import { API_URL } from '../../tokens/api-url.token';
import { HttpClient, HttpParams } from '@angular/common/http';

// providedIn: 'root' registers this service with Angular's dependency injection system as a single,
// app-wide singleton - every component that `inject()`s it shares the exact same instance and data.
@Injectable({ providedIn: 'root' })
export class ProductService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  // These methods intentionally return Observable<T>, not signals. HttpClient always deals in
  // observables (each one emits once then completes); components that want the result as a
  // signal should convert with toSignal() rather than this service trying to hold the state.
  // Keeping the service "dumb" (just HTTP calls) and letting components own their own signals
  // for loading/data/error state keeps responsibilities cleanly split.
  getAll(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.apiUrl}/products`);
  }

  // HttpParams is immutable - .set() returns a NEW HttpParams instance rather than mutating this
  // one, so it must be chained/reassigned, never called and discarded.
  search(query: string): Observable<Product[]> {
    const params = new HttpParams().set('search', query);
    return this.httpClient.get<Product[]>(`${this.apiUrl}/products`, { params });
  }

  getFeatured(): Observable<Product[]> {
    const params = new HttpParams().set('featured', true);
    return this.httpClient.get<Product[]>(`${this.apiUrl}/products`, { params });
  }

  getById(id: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  // Note: this doesn't actually send an HTTP POST - it's a placeholder/stub left for a future
  // exercise. A real implementation would be `this.httpClient.post<Product>(...)`.
  addProduct(product: Product) {
    console.log(product);
  }
}
