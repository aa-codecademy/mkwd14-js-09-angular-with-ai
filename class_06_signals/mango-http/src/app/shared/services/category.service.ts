import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_URL } from '../../tokens/api-url.token';
import type { Category } from '../../core/models/category.model';

// Small HTTP wrapper service - no signals needed here since it holds no state of its own,
// it just issues a request and hands back an observable for the caller to consume.
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private httpClient = inject(HttpClient);
  // API_URL is an injection token (see tokens/api-url.token.ts) rather than a hardcoded string,
  // so the base URL can be swapped per environment (dev/prod) without touching this service.
  private apiUrl = inject(API_URL);

  getAll(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.apiUrl}/categories`);
  }
}
