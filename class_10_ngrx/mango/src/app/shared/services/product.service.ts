import { inject, Injectable } from '@angular/core';
import type { Product } from '../../core/models/product.model';
import type { Observable } from 'rxjs';
import type {
  ProductQuery,
  PaginatedProducts,
} from '../../store/features/product.feature';
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
  // The backend only paginates when it actually receives page/limit - without them it
  // answers with the whole (filtered) array. So every defined field of the query has to be
  // turned into a real query param, or `result.data`/`result.total` come back undefined.
  getAll(query: ProductQuery = {}): Observable<PaginatedProducts> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.httpClient.get<PaginatedProducts>(`${this.apiUrl}/products`, {
      params,
    });
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
}
