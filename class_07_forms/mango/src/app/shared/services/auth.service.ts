import { inject, Injectable } from '@angular/core';
import type { Login, Register, User } from '../../core/models/auth.model';
import { map, type Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  register(body: Register): Observable<User> {
    return this.httpClient
      .post<{ user: User }>(`${this.apiUrl}/auth/register`, body)
      .pipe(map((response) => response.user));
  }

  login(body: Login): Observable<User> {
    return this.httpClient
      .post<{ user: User }>(`${this.apiUrl}/auth/login`, body)
      .pipe(map((response) => response.user));
  }
}
