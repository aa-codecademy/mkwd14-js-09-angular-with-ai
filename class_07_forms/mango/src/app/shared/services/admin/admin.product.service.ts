import { inject, Injectable } from '@angular/core';
import type { CreateProduct, Product } from '../../../core/models/product.model';
import { BehaviorSubject, type Observable } from 'rxjs';
import { API_URL } from '../../../tokens/api-url.token';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  create(body: CreateProduct): Observable<Product> {
    return this.httpClient.post<Product>(`${this.apiUrl}/products`, body);
  }
}
