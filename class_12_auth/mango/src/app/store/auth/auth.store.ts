import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { Login, Register, User } from '../../core/models/auth.model';
import { computed, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { withTokenStorage } from '../features/token-storage.feature';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import type { TokenPayload } from '../../core/types/token-payload.type';

type AuthState = {
  user: User | null;
};

const initialState = {
  user: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withTokenStorage(),
  withState<AuthState>(initialState),

  withComputed(({ accessToken, user }) => ({
    isLoggedIn: computed<boolean>(() => !!accessToken()),

    currentUser: computed<User | null>(() => user() ?? decodeToken(accessToken())),
  })),

  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    login(body: Login) {
      return authService.login(body).pipe(
        tap((res) => {
          store.setTokens(res.accessToken, res.refreshToken);
          patchState(store, { user: res.user });
        }),
      );
    },
    register(body: Register) {
      return authService.register(body);
    },
    logout() {
      store.clearTokens();
      patchState(store, { user: null });
      router.navigate(['/login']);
    },
  })),
);

function decodeToken(token: string | null): User | null {
  if (!token) return null;

  try {
    const payload = jwtDecode<TokenPayload>(token);
    return {
      id: payload.sub,
      email: payload.email,
      firstName: '',
      lastName: '',
      role: payload.role,
      createdAt: '',
    };
  } catch {
    return null;
  }
}
