import { inject, Injectable } from '@angular/core';
import type { Login, Register, User } from '../../core/models/auth.model';
import { map, type Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens/api-url.token';
import type { LoginResponse, RegisterResponse } from '../../core/types/auth-response.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  register(body: Register): Observable<RegisterResponse> {
    return this.httpClient.post<RegisterResponse>(`${this.apiUrl}/auth/register`, body);
  }

  login(body: Login): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/auth/login`, body);
  }
}
