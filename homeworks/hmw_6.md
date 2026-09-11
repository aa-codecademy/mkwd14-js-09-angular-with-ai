# Homework 6 — Nestly gets accounts: login, roles and token refresh

This is the **last homework**. You're adding the final missing piece to **Nestly**: real users.
By the end, visitors can register and log in, the app remembers them across refreshes, protected
pages are actually protected, and an expired access token is renewed silently in the background
instead of logging the user out.

> **Keep it small.** Two roles, five screens' worth of wiring, one interceptor, two guards. No
> password reset, no email confirmation, no profile editing.

## Setup

`nestly-server` now has auth built in. Pull the latest version and run it:

```bash
cd nestly-server
npm install
npm run start:dev
```

Then seed the demo accounts once:

```bash
curl -X POST http://localhost:3000/api/seed/users
```

| Email | Password | Role |
| --- | --- | --- |
| `admin@nestly.dev` | `password123` | `ADMIN` |
| `user@nestly.dev` | `password123` | `USER` |

Full endpoint docs: [nestly-server/README.md](./nestly-server/README.md) and Swagger at
`http://localhost:3000/api/docs`.

## The API you're talking to

| Endpoint | Body | Returns |
| --- | --- | --- |
| `POST /api/auth/register` | `{ email, password, firstName, lastName }` | `{ user, accessToken, refreshToken }` |
| `POST /api/auth/login` | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| `POST /api/auth/refresh` | `{ refreshToken }` | a **new** `{ user, accessToken, refreshToken }` |
| `POST /api/auth/logout` | — (needs the bearer token) | `{ success: true }` |
| `GET /api/auth/me` | — (needs the bearer token) | the current `User` |

```ts
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}
```

Who may do what on the stays routes:

| Route | Who |
| --- | --- |
| `GET /api/stays`, `GET /api/stays/:id` | anyone |
| `POST /api/stays`, `PUT /api/stays/:id` | any logged-in user → `401` without a token |
| `DELETE /api/stays/:id` | `ADMIN` only → `403` for a logged-in `USER` |

> **The access token expires after 60 seconds.** That's on purpose — it means your refresh logic
> either works or you'll notice within a minute. The refresh token lasts 7 days, and calling
> `/auth/refresh` **rotates** it: the old refresh token stops working immediately, so you must
> store the new one you get back.

## What you must build

### 1. `AuthService`

A service that owns every call to `/api/auth/*`:

```ts
register(data: Register): Observable<LoginResponse>
login(data: Login): Observable<LoginResponse>
refresh(refreshToken: string): Observable<LoginResponse>
logout(): Observable<{ success: boolean }>
me(): Observable<User>
```

### 2. `AuthStore` — a `signalStore` (Homework 5 concepts, reused)

```ts
type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
};
```

Required members:

| Member | Kind | Notes |
| --- | --- | --- |
| `isLoggedIn` | `withComputed` | `!!user()` |
| `isAdmin` | `withComputed` | `user()?.role === 'ADMIN'` |
| `login(credentials)` | `rxMethod` | on success: store user + both tokens, navigate to `/` |
| `register(data)` | `rxMethod` | same as login — the server logs you in right away |
| `logout()` | method | call the API, clear state **and** localStorage, navigate to `/login` |
| `setTokens({ accessToken, refreshToken, user })` | method | used by the refresh flow |

Persist `accessToken`, `refreshToken` and `user` to `localStorage` so a page reload keeps you
logged in, and read them back when the store is created (`withHooks({ onInit })`). Clear all three
on logout.

> Doing the persistence with an `effect()` inside `withHooks` — write to `localStorage` whenever
> the token signals change — is the tidy version, and it's exactly what `mango`'s
> `token-storage.feature.ts` does. A plain `localStorage.setItem(...)` inside your methods is an
> acceptable simpler solution.

### 3. Two route guards

Both are **functional** guards (`CanActivateFn`), in their own files:

- `authGuard` — lets the route through when `store.isLoggedIn()`, otherwise
  `router.createUrlTree(['/login'])`.
- `adminGuard` — lets the route through when `store.isAdmin()`, otherwise
  `router.createUrlTree(['/not-allowed'])`.

You also need the page it redirects to: a `/not-allowed` route with a small component saying the
user doesn't have permission to see that page, plus a link back to the stays list. Keep it plain —
a heading, a sentence and a `routerLink` is enough.

Apply them in your routes:

| Route | Guard |
| --- | --- |
| `/host/new` (the Homework 4 form) | `authGuard` |
| `/admin` (new, see below) | `authGuard, adminGuard` |
| `/not-allowed` (new) | none — the logged-in `USER` who got bounced has to be able to see it |
| everything else | none — browsing stays stays public |

### 4. An `authInterceptor` (functional `HttpInterceptorFn`)

It has two jobs:

1. **Attach the token.** If there's an access token in the store, clone the request and add
   `Authorization: Bearer <accessToken>`. Skip this for the `/auth/login`, `/auth/register` and
   `/auth/refresh` calls.
2. **Refresh on 401.** `catchError` a `401`: call `POST /auth/refresh` with the stored refresh
   token, put the new tokens in the store, and **retry the original request** with the new access
   token (`switchMap` back into `next(retriedRequest)`). If the refresh itself fails, log out and
   send the user to `/login`.

Register it in `app.config.ts`:

```ts
provideHttpClient(withInterceptors([authInterceptor]))
```

> **Watch out for the loop.** If a refresh 401s and your interceptor tries to refresh again,
> you'll spin forever. Guard against it: never run the refresh branch for a request whose URL is
> `/auth/refresh`.

### 5. Login and register pages

Two routes, `/login` and `/register`, both built with **Reactive Forms** (Homework 4 concepts):

| Page | Fields | Validation |
| --- | --- | --- |
| `/login` | email, password | both required, `email` must be a valid email |
| `/register` | firstName, lastName, email, password, confirmPassword | all required, password `minLength(8)`, `confirmPassword` must match — **a cross-field validator**, like in Homework 4 |

Both must:

- disable the submit button while the form is invalid or the request is in flight
  (`store.isLoading()`),
- show the server's error message when login fails (`store.error()`) — wrong credentials returns
  `401`, an already-registered email returns `409`,
- redirect to the stays list on success.

### 6. An admin-only page

A `/admin` route showing the list of stays with a **Delete** button per row that calls
`DELETE /api/stays/:id`. It only has to work — styling is up to you. This exists so you can prove
your `adminGuard` and the server's role check both do their jobs.

### 7. Navbar

The navbar must react to auth state:

- logged out → **Login** and **Register** links,
- logged in → the user's name (or email), a **Logout** button, and the **List a stay** link,
- logged in as `ADMIN` → additionally an **Admin** link.

Use `@if (store.isLoggedIn())` / `@if (store.isAdmin())` — no manual subscriptions.

## Behavior requirements

1. Registering logs you straight in and lands you on the stays list.
2. Logging in with bad credentials shows an error and does **not** navigate anywhere.
3. Reloading the page while logged in keeps you logged in (tokens read back from `localStorage`).
4. Visiting `/host/new` while logged out redirects to `/login`.
5. Visiting `/admin` as `user@nestly.dev` does **not** show the admin page — the user lands on
   `/not-allowed` instead.
6. Logging in as `admin@nestly.dev` shows the Admin link, and deleting a stay there works.
7. Logging out clears the state, clears `localStorage`, and protected routes redirect again.
8. **The refresh flow works.** Log in, wait ~70 seconds, then submit the Homework 4 form. The
   request 401s, your interceptor refreshes and retries, and the stay is created — the user never
   sees an error and is never kicked out. Be ready to demo this in class.
9. Everything from Homework 1–5 still works.

## Bonus (optional, only if the rest works)

- Deleting a stay as a `USER` returns `403` — catch it and show "You don't have permission"
  instead of a generic error.
- After an `authGuard` redirect, remember where the user was headed (`returnUrl` query param) and
  send them there after a successful login.
- Queue requests that arrive while a refresh is already in flight, instead of firing a refresh per
  request (`shareReplay` / a `BehaviorSubject` gate). This is the real-world version and it's
  genuinely tricky — only after everything else is done.

## Self-check before submitting

- [ ] `/api/seed/users` has been called and you can log in with both demo accounts.
- [ ] There is one `AuthStore` created with `signalStore`, and state only changes via `patchState`.
- [ ] `isLoggedIn` and `isAdmin` are `withComputed` signals and are used in the navbar.
- [ ] Tokens survive a page reload, and logout clears them from `localStorage`.
- [ ] `authGuard` and `adminGuard` are functional guards in their own files and are wired to routes.
- [ ] `adminGuard` redirects to `/not-allowed`, and that route exists and renders.
- [ ] `authInterceptor` attaches the bearer token to protected calls only.
- [ ] A `401` triggers exactly one refresh and the original request is retried — no infinite loop.
- [ ] A failed refresh logs the user out and redirects to `/login`.
- [ ] Login and register are Reactive Forms, with a cross-field password-match validator on register.
- [ ] Server errors (`401`, `409`, `403`) are shown in the UI — the app never crashes.
- [ ] `ng serve` runs with no errors.
