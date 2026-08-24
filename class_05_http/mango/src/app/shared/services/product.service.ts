import { inject, Injectable } from '@angular/core';
import type { Product } from '../../core/models/product.model';
import { BehaviorSubject, type Observable } from 'rxjs';
import { API_URL } from '../../tokens/api-url.token';
import { HttpClient } from '@angular/common/http';

// providedIn: 'root' registers this service with Angular's dependency injection system as a single,
// app-wide singleton - every component that `inject()`s it shares the exact same instance and data.
@Injectable({ providedIn: 'root' })
export class ProductService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getAll(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.apiUrl}/products`);
  }

  getById(id: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  addProduct(product: Product) {
    console.log(product);
  }
}
