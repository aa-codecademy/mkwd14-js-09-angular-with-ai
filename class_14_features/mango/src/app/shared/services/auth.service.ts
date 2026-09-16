import { inject, Injectable } from '@angular/core';
import type { Login, Register, User } from '../../core/models/auth.model';
import { map, type Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens/api-url.token';
import type {
  LoginResponse,
  RefreshResponse,
  RegisterResponse,
} from '../../core/types/auth-response.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  // An injection token instead of importing `environment` directly - the URL becomes a
  // dependency you can swap in tests rather than a hardcoded import.
  private apiUrl = inject(API_URL);

  // This service is deliberately DUMB: it only talks HTTP. No tokens, no localStorage,
  // no routing. All of that is the AuthStore's job, which keeps each piece testable.
  register(body: Register): Observable<RegisterResponse> {
    return this.httpClient.post<RegisterResponse>(`${this.apiUrl}/auth/register`, body);
  }

  login(body: Login): Observable<LoginResponse> {
    // The generic <LoginResponse> is a compile-time promise, not a runtime check - Angular
    // does not validate the JSON. If the API changes shape, TypeScript stays happy and you
    // get `undefined` at runtime, so keep these types in sync with the backend.
    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/auth/login`, body);
  }

  refresh(refreshToken: string): Observable<RefreshResponse> {
    return this.httpClient.post<RefreshResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken });
  }
}
