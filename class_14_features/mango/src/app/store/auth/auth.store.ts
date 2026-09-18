import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { Login, Register, User } from '../../core/models/auth.model';
import { computed, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { withTokenStorage } from '../features/token-storage.feature';
import { catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import type { TokenPayload } from '../../core/types/token-payload.type';
import type { ResetPassword } from '../../core/types/auth-response.type';
import { NotificationService } from '../../shared/services/notification.service';

type AuthState = {
  // Only the user. The tokens are NOT declared here - withTokenStorage() already
  // contributes `accessToken` / `refreshToken` to the same store.
  user: User | null;
  passwordError: string;
};

const initialState = {
  user: null,
  passwordError: '',
};

export const AuthStore = signalStore(
  // 'root' = one shared instance for the whole app. Auth must be a singleton: if each
  // component got its own copy, logging in on one page wouldn't log you in anywhere else.
  { providedIn: 'root' },
  // Order matters - withTokenStorage runs first, so the state/methods it adds
  // (accessToken, setTokens, clearTokens) are available to everything below it.
  withTokenStorage(),
  withState<AuthState>(initialState),

  withComputed(({ accessToken, user }) => {
    // Fallback chain: use the user object from the login response if we have it, otherwise
    // rebuild a partial user from the JWT. That second path is what a page REFRESH hits -
    // the token survived in localStorage but the user object did not.
    const currentUser = computed<User | null>(() => user() ?? decodeToken(accessToken()));

    return {
      // "Logged in" is DERIVED from the token, never stored as its own boolean. One source
      // of truth - you can't end up with isLoggedIn === true and no token.
      isLoggedIn: computed<boolean>(() => !!accessToken()),
      currentUser,
      role: computed(() => currentUser()?.role ?? null),
      isAdmin: computed(() => currentUser()?.role === 'ADMIN'),
    };
  }),

  // Services are injected as default parameters - withMethods' factory is an injection
  // context; calling inject() inside the methods themselves would throw.
  withMethods(
    (
      store,
      authService = inject(AuthService),
      notificationService = inject(NotificationService),
      router = inject(Router),
    ) => ({
      login(body: Login) {
        // RETURNS the observable instead of subscribing here. The store handles the state
        // side effect (tap), the component decides what the UI does next (toast, navigate)
        // and, importantly, gets to handle the error.
        return authService.login(body).pipe(
          tap((res) => {
            store.setTokens(res.accessToken, res.refreshToken);
            patchState(store, { user: res.user });
          }),
        );
      },
      register(body: Register) {
        // Registering does NOT log you in - no tokens come back, so there is no state to
        // change. The store just passes the call straight through.
        return authService.register(body);
      },
      refresh() {
        return authService
          .refresh(store.refreshToken()!)
          .pipe(tap((res) => store.setTokens(res.accessToken, res.refreshToken)));
      },
      resetPassword(body: ResetPassword) {
        return authService.resetPassword(body).pipe(
          tap(() => {
            notificationService.showSuccess('Password reset was successful. Please login again.');
            this.logout();
          }),
          catchError((error) => {
            if (error.error.status === 401) {
              patchState(store, {
                passwordError: 'Current password is incorrect',
              });
            } else {
              patchState(store, {
                passwordError: 'Issue while resetting your password',
              });
            }
            return of(null);
          }),
        );
      },
      clearPasswordError() {
        patchState(store, { passwordError: '' });
      },
      logout() {
        // Synchronous on purpose: logging out is a local action. Clear tokens, clear the
        // user, then leave the page - in that order, so nothing renders with stale state.
        store.clearTokens();
        patchState(store, { user: null });
        router.navigate(['/login']);
      },
    }),
  ),
);

// A plain helper function, deliberately outside the store: it takes input and returns
// output with no state involved, so it needs nothing from DI and is trivial to test.
function decodeToken(token: string | null): User | null {
  if (!token) return null;

  try {
    // jwtDecode only READS the payload - it does not verify the signature. Never trust a
    // decoded token for security decisions; the server must re-check it on every request.
    // Client-side decoding is for showing the right UI, nothing more.
    const payload = jwtDecode<TokenPayload>(token);
    return {
      // `sub` ("subject") is the standard JWT claim for "who this token is about".
      id: payload.sub,
      email: payload.email,
      // Empty strings because the token simply doesn't carry these claims - keep JWTs
      // small, and fetch the full profile from the API when you actually need it.
      firstName: '',
      lastName: '',
      role: payload.role,
      createdAt: '',
    };
  } catch {
    // A malformed or tampered token throws. Returning null means "not logged in" instead
    // of crashing the whole app on a bad localStorage value.
    return null;
  }
}
