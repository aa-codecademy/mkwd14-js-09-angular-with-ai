import { inject, Injectable } from '@angular/core';
import type { CreateProduct, Product } from '../../../core/models/product.model';
import type { Observable } from 'rxjs';
import { API_URL } from '../../../tokens/api-url.token';
import { HttpClient } from '@angular/common/http';

// Admin write operations live in their own service, separate from the read-only ProductService.
// Splitting them keeps the public catalogue service small and makes permissions easier later.
@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  // POST creates a resource; the server echoes back the saved Product including its new id.
  create(body: CreateProduct): Observable<Product> {
    return this.httpClient.post<Product>(`${this.apiUrl}/products`, body);
  }
}
