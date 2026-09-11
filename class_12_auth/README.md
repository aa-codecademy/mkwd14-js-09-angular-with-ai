# Class 12 — Authentication with JWT

Your app can list products, filter them and manage orders — but right now anyone can do all of it, and the app has no idea who is using it. In this class you add **authentication**: the user logs in, the server hands back a **JWT**, you store it, and the whole UI reacts to it. You'll build an `AuthStore` on top of the signal store you already know, split token persistence into its own reusable feature, decode the token to find out who the user is, and make the navbar change by itself the moment someone signs in or out.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [Authentication vs. authorization](#authentication-vs-authorization)
  - [What a JWT actually is](#what-a-jwt-actually-is)
  - [Access tokens and refresh tokens](#access-tokens-and-refresh-tokens)
  - [Persisting tokens with a store feature](#persisting-tokens-with-a-store-feature)
  - [The AuthStore](#the-authstore)
  - [Derived auth state](#derived-auth-state)
  - [Decoding the token](#decoding-the-token)
  - [Returning observables from store methods](#returning-observables-from-store-methods)
  - [Reacting in the template](#reacting-in-the-template)
  - [Typing the API contract](#typing-the-api-contract)
- [Theory](#theory)
  - [Why the client can never be trusted](#why-the-client-can-never-be-trusted)
  - [localStorage vs. httpOnly cookies](#localstorage-vs-httponly-cookies)
  - [Surviving a page refresh](#surviving-a-page-refresh)
  - [What still has to be built](#what-still-has-to-be-built)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### Authentication vs. authorization

**Authentication** answers "who are you?" — the login form, the password check, the token.
**Authorization** answers "what are you allowed to do?" — can this user open `/admin`, can they delete a product.

**Why it matters:** students constantly mix these up and then write bugs like "the user is logged in, so show the admin panel". Being logged in is not the same as being an admin. In this app authentication gives you `isLoggedIn()`, and the `role` on the user is what drives authorization.

```ts
// authentication: do we know who this is?
if (store.isLoggedIn()) { /* ... */ }

// authorization: is this person allowed to do the thing?
if (store.currentUser()?.role === 'ADMIN') { /* ... */ }
```

### What a JWT actually is

A JSON Web Token is three Base64 strings joined by dots: `header.payload.signature`. The **payload** holds claims about the user (id, email, role, expiry). The **signature** is what the server computed with a secret only it knows.

**Mental model:** a JWT is a *signed note*, not a *locked box*. Anyone who has the token can read the payload — paste one into [jwt.io](https://jwt.io) and see for yourself. What they cannot do is change it, because they can't recreate the signature.

```ts
// The three parts, split apart by hand just to see what's in there:
const [header, payload, signature] = token.split('.');
console.log(JSON.parse(atob(payload)));
// { sub: 7, email: 'ana@mango.dev', role: 'ADMIN', iat: 1757500000, exp: 1757503600 }
```

> **Note:** because the payload is readable by anyone, never put anything secret in a JWT — no passwords, no private data.

### Access tokens and refresh tokens

The **access token** is short-lived (minutes) and gets sent with every request. The **refresh token** is long-lived (days) and does exactly one thing: exchange it for a new access token.

**Why two?** If a token leaks, you want the damage window small — hence the short expiry. But asking the user to log in every 15 minutes is awful, so the refresh token quietly renews the session in the background.

```ts
export type TokenState = {
  accessToken: string | null;  // sent on every API call
  refreshToken: string | null; // only used against /auth/refresh
};
```

### Persisting tokens with a store feature

`withTokenStorage()` is a `signalStoreFeature` whose entire job is "where do tokens live". It reads `localStorage` for its initial state and writes to it on every change.

**Why a separate feature:** the `AuthStore` never touches `localStorage` directly. If you later move to cookies or `sessionStorage`, you edit one file and nothing else in the app notices.

```ts
export function withTokenStorage() {
  return signalStoreFeature(
    // read on startup - this single line is what survives a page refresh
    withState<TokenState>({
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    }),
    withMethods((store) => ({
      setTokens(accessToken: string, refreshToken: string): void {
        patchState(store, { accessToken, refreshToken }); // signals -> UI updates now
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken); // disk -> survives reload
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      },
      clearTokens() {
        patchState(store, { accessToken: null, refreshToken: null });
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      },
    })),
  );
}
```

> **Note:** always write both places. Update only the signal and the user is logged out again after a refresh; update only `localStorage` and the navbar never changes.

### The AuthStore

`AuthStore` composes the token feature with the user state and the login/register/logout methods.

**Why `providedIn: 'root'`:** auth *must* be a singleton. If every component got its own instance, logging in on the login page would not log you in on the navbar.

```ts
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withTokenStorage(),          // contributes accessToken + setTokens/clearTokens
  withState<AuthState>({ user: null }),
  withComputed(/* ... */),
  withMethods(/* ... */),
);
```

Feature order matters: `withTokenStorage()` comes first, so everything below it can use `store.setTokens()` and read `accessToken()`.

### Derived auth state

`isLoggedIn` is **not** a stored boolean. It's a computed signal derived from the token.

**Why:** two pieces of state that must agree will eventually disagree. Derive one from the other and the bug becomes impossible.

```ts
withComputed(({ accessToken, user }) => ({
  isLoggedIn: computed<boolean>(() => !!accessToken()),
  // fall back to the token when we have no user object (i.e. after a refresh)
  currentUser: computed<User | null>(() => user() ?? decodeToken(accessToken())),
}))
```

### Decoding the token

After a page refresh the token is still in `localStorage`, but the `user` object is gone — it only ever lived in memory. `jwt-decode` rebuilds a partial user from the token's claims.

```ts
function decodeToken(token: string | null): User | null {
  if (!token) return null;
  try {
    const payload = jwtDecode<TokenPayload>(token); // reads only - does NOT verify
    return { id: payload.sub, email: payload.email, role: payload.role,
             firstName: '', lastName: '', createdAt: '' };
  } catch {
    return null; // a tampered or garbage token must not crash the app
  }
}
```

> **Note:** `jwtDecode` does not check the signature. Never make a security decision on the client based on a decoded token — use it to pick which UI to show, and let the server enforce the rules.

### Returning observables from store methods

`login()` returns the observable instead of subscribing inside the store.

**Why:** the store owns the *state* effect (saving tokens, via `tap`), the component owns the *UI* effect (toast, navigation) — and, crucially, the component can handle the error. A store that subscribes internally swallows failures.

```ts
login(body: Login) {
  return authService.login(body).pipe(
    tap((res) => {
      store.setTokens(res.accessToken, res.refreshToken);
      patchState(store, { user: res.user });
    }),
  ); // no .subscribe() here - the caller does that
}
```

And in the component:

```ts
this.store.login(body).subscribe({
  next: () => this.router.navigate(['/']),
  error: (err) => this.notificationService.showError(err.error.message),
});
```

### Reacting in the template

Nothing in the navbar wires itself to the login form. It just reads signals, and Angular does the rest.

```html
@if (store.isLoggedIn()) {
  <a routerLink="/account">{{ store.currentUser()?.email }}</a>
  <button mat-icon-button (click)="store.logout()"><mat-icon>logout</mat-icon></button>
} @else {
  <a mat-stroked-button routerLink="/login">Login</a>
}
```

Two gotchas in three lines: the store field must be **public** (a `private` field is invisible to the template), and `currentUser()?.email` needs the `?.` because the value is `User | null`.

### Typing the API contract

Register returns a user; login returns a user *and* two tokens. Modelling them as one type with optional fields would force `res.accessToken!` at every call site.

```ts
export type RegisterResponse = { user: User };
export type LoginResponse = { user: User; accessToken: string; refreshToken: string };
```

And `UserRole` is a union, not `string` — so `'admin'` (wrong case) fails to compile:

```ts
export type UserRole = 'USER' | 'ADMIN';
```

## Theory

### Why the client can never be trusted

Everything in your Angular app runs on the user's machine. They can open DevTools, edit a signal, flip `isLoggedIn` to `true`, and route themselves into `/admin`. And that's fine — because the admin page's data still comes from the API, and the API rejects requests without a valid token.

Client-side auth decides **what to render**. Server-side auth decides **what is allowed**. A guard that hides the admin link is a usability feature, not a security feature.

### localStorage vs. httpOnly cookies

| | localStorage | httpOnly cookie |
|---|---|---|
| Readable by JS | Yes | No |
| Vulnerable to XSS token theft | Yes | No |
| Vulnerable to CSRF | No | Yes (needs SameSite / CSRF tokens) |
| Sent automatically | No — you attach it yourself | Yes, by the browser |
| Works across subdomains/APIs | Easily | Needs configuration |

This app uses `localStorage` because it's simple to see and debug while learning. Production apps that handle money or personal data usually put the refresh token in an `httpOnly` cookie and keep the access token in memory only. Know the trade-off and be able to explain it in an interview.

### Surviving a page refresh

A page refresh destroys every JavaScript object your app ever created — signals, services, the store, all of it. The only things that survive are what you wrote somewhere durable.

That's why the flow is:

1. `withTokenStorage()` seeds its state straight from `localStorage` when the store is first constructed.
2. `isLoggedIn` is computed from that token, so it's already `true` on the first render.
3. `user` is `null` (it never persisted), so `currentUser` falls back to `decodeToken()`.

If you ever see a flash of the logged-out navbar on reload, it's because something read the token *asynchronously* instead of during construction.

### What still has to be built

The class ends with a working login, but the picture isn't complete. The pieces you're missing:

- An **HTTP interceptor** that attaches `Authorization: Bearer <token>` to outgoing requests. Right now the token is stored but never sent.
- A **route guard** (`CanActivateFn`) that redirects anonymous users away from `/orders` and non-admins away from `/admin`.
- **Expiry handling** — `exp` is in the payload and nothing checks it. An expired token currently looks exactly like a valid one to `isLoggedIn`.
- **Refresh logic** — the refresh token is saved and never used.

Those are the exercises below.

## Useful Links

| Topic | Link |
|---|---|
| NgRx Signal Store | https://ngrx.io/guide/signals/signal-store |
| Custom store features | https://ngrx.io/guide/signals/signal-store/custom-store-features |
| `rxMethod` | https://ngrx.io/guide/signals/rxjs-integration |
| Angular route guards (`CanActivateFn`) | https://angular.dev/api/router/CanActivateFn |
| Angular HTTP interceptors | https://angular.dev/guide/http/interceptors |
| Angular `inject()` | https://angular.dev/api/core/inject |
| Angular signals | https://angular.dev/guide/signals |
| Template-driven forms | https://angular.dev/guide/forms/template-driven-forms |
| `jwt-decode` | https://github.com/auth0/jwt-decode |
| JWT introduction & debugger | https://jwt.io/introduction |
| MDN — `localStorage` | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage |
| MDN — `Authorization` header | https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization |
| OWASP — JWT cheat sheet | https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html |
| Angular Material toolbar | https://material.angular.io/components/toolbar |

## Mini Examples

### 1. An auth interceptor

```ts
// Functional interceptor - register it in app.config.ts:
// provideHttpClient(withInterceptors([authInterceptor]))
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).accessToken();
  if (!token) return next(req); // nothing to attach, pass it through untouched

  // HttpRequest is IMMUTABLE - you must clone it, you cannot mutate headers in place.
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
```

### 2. A guard that protects a route

```ts
export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (store.isLoggedIn()) return true;

  // Remember where they were going so login can send them back afterwards.
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// app.routes.ts
{ path: 'orders', component: OrdersComponent, canActivate: [authGuard] }
```

### 3. Checking token expiry

```ts
withComputed(({ accessToken }) => ({
  isLoggedIn: computed(() => {
    const token = accessToken();
    if (!token) return false;
    try {
      // exp is in SECONDS, Date.now() is in MILLISECONDS - the classic off-by-1000 bug.
      const { exp } = jwtDecode<TokenPayload>(token);
      return exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }),
}))
```

### 4. A role-based directive

```ts
@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  private store = inject(AuthStore);
  private view = inject(ViewContainerRef);
  private tpl = inject(TemplateRef<unknown>);

  role = input.required<UserRole>({ alias: 'appHasRole' });

  constructor() {
    // effect() re-runs whenever currentUser() changes - log out and the element disappears.
    effect(() => {
      this.view.clear();
      if (this.store.currentUser()?.role === this.role()) {
        this.view.createEmbeddedView(this.tpl);
      }
    });
  }
}

// <a *appHasRole="'ADMIN'" routerLink="/admin">Admin</a>
```

## Practice Exercises

### Beginner — hide the Admin link

The navbar still shows **Admin** to everyone, including logged-out visitors.

- Wrap the admin link in an `@if` that checks the user's role.
- Confirm it disappears when you log out and reappears when you log in as an admin.
- Then open `/admin` by typing the URL directly — it still loads. Explain in one sentence why hiding the link is not security.

### Beginner — show the user's name, not their email

`currentUser()` returns empty strings for `firstName`/`lastName` after a refresh, because the JWT doesn't carry them.

- Display `firstName lastName` when you have it, and fall back to the email when you don't.
- Verify the difference: log in (full name shows) then hit F5 (fallback shows).

### Beginner — a logout confirmation

- Add a Material dialog or a simple `confirm()` before `store.logout()` runs.
- Make sure cancelling really does leave the tokens in `localStorage` — check the Application tab in DevTools.

### Intermediate — attach the token to requests

Right now you store a token and never send it.

- Write the `authInterceptor` from the mini examples and register it in `app.config.ts`.
- Confirm in the Network tab that `Authorization: Bearer ...` appears on API calls.
- Make sure it does **not** attach the token to `/auth/login` and `/auth/register` — sending a stale token to the login endpoint is at best pointless.

**Hint:** `req.url` tells you which endpoint you're intercepting.

### Intermediate — guard the protected routes

- Add `authGuard` to `/orders` and an `adminGuard` to the `/admin` children.
- After a redirect to login, send the user back to where they originally wanted to go (use the `returnUrl` query param).
- Handle the edge case: a logged-in non-admin hitting `/admin` should get a "not allowed" message, not an infinite redirect loop.

### Intermediate — handle expired tokens

- Extend `isLoggedIn` to check `exp`, as in mini example 3.
- On app start, clear the tokens if the stored one is already expired.
- Test it by asking the backend for a token with a very short expiry, or by hand-editing `exp` in `localStorage` and reloading.

### Challenge — refresh the token automatically

The refresh token is saved and never used. Make it earn its keep.

- Add a `refresh()` method to `AuthStore` that posts the refresh token to `/auth/refresh` and stores the new pair.
- In the interceptor, catch `401` responses, call `refresh()`, and **retry the original request** with the new token.
- Handle the hard part: if five requests fail at once, you must refresh **once**, not five times. Queue the others until the refresh resolves.
- If the refresh itself fails, log the user out and send them to `/login`.

**Hint:** `catchError` + `switchMap` in the interceptor, plus a shared in-flight observable so concurrent 401s wait on the same refresh. Expect this one to take a while — that's the point.
