# Class 4 — HTTP Client & Services in Angular

In this class you'll connect your Angular apps to the outside world. You'll learn how `HttpClient` lets you fetch data from a real API, why that call returns an `Observable` instead of a plain value, and how to wrap that logic in an injectable `service` so components stay focused on displaying data rather than fetching it. You'll also see how to give HTTP responses proper TypeScript types so the compiler catches mistakes for you. Three projects back this class: `example1` shows a raw `HttpClient` call straight from a component with the `async` pipe, `example2` moves that same call into a dedicated `PostService` using signals, and `mango` puts everything together into a small shopping-cart app where services (`ProductService`, `CartService`) hold shared state that multiple components (navbar, product list, cart) all read from.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [HttpClient & provideHttpClient](#httpclient--providehttpclient)
  - [Observables & subscribe](#observables--subscribe)
  - [Services & Dependency Injection](#services--dependency-injection)
  - [Typing HTTP Responses](#typing-http-responses)
  - [Structuring a Feature: Services + Components](#structuring-a-feature-services--components)
  - [RxJS Operators: map & pipe](#rxjs-operators-map--pipe)
- [Theory](#theory)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### HttpClient & provideHttpClient

`HttpClient` is Angular's built-in service for making HTTP requests (GET, POST, PUT, DELETE, ...). It's injectable like any other service, but it only works once `provideHttpClient()` has been added to your app's providers.

**Why it exists:** you could use the browser's native `fetch()`, but `HttpClient` gives you automatic JSON parsing, generics for response typing, built-in support for interceptors (auth headers, logging), and — most importantly for this class — it returns RxJS `Observable`s instead of `Promise`s, unlocking operators like `map`, `retry`, and `debounceTime`.

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};
```

> **Note:** both `example1` and `example2` in this class inject `HttpClient` but are **missing** `provideHttpClient()` in their `app.config.ts`. This is a deliberate gotcha to spot — without it, Angular's injector has no provider for `HttpClient`, and injecting it throws a `NullInjectorError` at runtime. Fixing it is exercise #1 below.

### Observables & subscribe

`HttpClient.get<T>(url)` doesn't fetch anything by itself — it returns a "cold" `Observable<T>` that stays completely inert until something calls `.subscribe()` on it (or a template uses the `async` pipe, which subscribes for you).

**Why it exists:** Observables let you compose behavior around a stream of values *before* anything actually runs — you can `pipe()` in transformations, retries, or cancellation logic, and nothing executes until a subscriber shows up. This also means the same Observable can be subscribed to multiple times, re-triggering the request each time.

```typescript
this.http.get<Post[]>('/api/posts').subscribe({
  next: (posts) => console.log(posts),
  error: (err) => console.error('Request failed', err),
});
```

> **Gotcha:** logging the Observable itself right after calling `.get()` (without subscribing) will never show you the actual data — the request hasn't fired yet. This exact trap is baked into `example1` and `example2`'s `ngOnInit` — check the console output order for yourself.

### Services & Dependency Injection

A service is a plain class decorated with `@Injectable({ providedIn: 'root' })`. Angular's dependency injection (DI) system then hands out one shared singleton instance to every component that asks for it — either via a constructor parameter or the newer `inject()` function.

**Why it exists:** components should render UI and react to user input, not own business logic or duplicate HTTP calls. Centralizing that logic in a service means multiple components can share the same data and the same in-flight request, and it makes the logic trivially unit-testable in isolation from any component.

```typescript
@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient); // functional DI - no constructor needed

  getPosts() {
    return this.http.get<Post[]>('/api/posts');
  }
}
```

```typescript
export class MyComponent {
  private postService = inject(PostService); // same singleton everywhere
}
```

> **Note:** `providedIn: 'root'` is what makes it a singleton. If you instead list a service in a single component's `providers` array, that component (and its children) get their own separate instance — useful sometimes, but rarely what you want for shared app state.

### Typing HTTP Responses

A TypeScript `interface` (like `Post` or `Product` in this class) describes the *shape* of the JSON coming back from the server, and gets passed as a generic to `HttpClient.get<Post[]>(...)`.

**Why it exists:** without a shared type, every component that touches the response would need to guess its shape independently, and a typo like `post.titel` would only fail at runtime. A shared interface gives you autocomplete and compile-time errors everywhere the data flows.

```typescript
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}
```

> **Gotcha:** TypeScript types are compile-time only — `HttpClient.get<Post[]>()` doesn't actually *validate* the response at runtime. If the API's real shape drifts from your interface, TypeScript won't catch it; you'd need something like Zod for runtime validation.

### Structuring a Feature: Services + Components

The `mango` app splits responsibilities across dedicated services (`ProductService`, `CartService`, both `providedIn: 'root'`) and "dumb" presentational components (`ProductCardComponent`, `NavbarComponent`) that just read from those services via `inject()`.

**Why it exists:** because `ProductService` holds the product list in a `BehaviorSubject`, both `ProductListComponent` (which displays products) and `NavbarComponent` (which shows a product count badge) automatically stay in sync — neither component knows the other exists. This is a lightweight, framework-native alternative to a full state-management library for small-to-medium apps.

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private _items: CartItem[] = [];
  get items() { return this._items; }
  add(product: Product) { this._items = [...this._items, { product, quantity: 1 }]; }
}
```

### RxJS Operators: map & pipe

`.pipe()` chains RxJS operators together to transform or react to values as they flow through an Observable, without needing to subscribe first. `map()` transforms each emitted value; `tap()` (used in `example1`) runs a side effect without changing the value.

**Why it exists:** instead of subscribing and then manually reshaping data inside the callback, `pipe()` lets you describe the transformation declaratively, and keeps that logic reusable and composable with other operators (`catchError`, `retry`, `debounceTime`, etc.).

```typescript
this.http.get<Post[]>('/api/posts').pipe(
  map((posts) => posts.filter((p) => p.userId === 1)),
);
```

## Theory

- **Observables vs. Promises**: a `Promise` represents a single future value and starts executing the moment it's created, regardless of whether anyone is listening. An `Observable` can emit zero, one, or many values over time, is "lazy" (it does nothing until subscribed to), and is cancellable (`unsubscribe()`) — a `Promise` can't be cancelled once started. HTTP requests via `HttpClient` are single-value Observables, but the same API also powers streams like WebSocket messages or keyboard events, which is where the extra power of Observables really shows.
- **Cold vs. hot Observables (beginner level)**: a "cold" Observable — like `HttpClient.get()` — doesn't do any work until you subscribe, and each new subscriber triggers its own independent execution (its own separate HTTP request). A "hot" Observable — like a `BehaviorSubject` inside a shared service — is already "running" and simply broadcasts new values to whoever happens to be subscribed at the time, which is why `BehaviorSubject` is the right tool for shared app state (everyone shares one source, not one request each).
- **Why Angular services exist for sharing state/logic**: components are created and destroyed as the user navigates around (thanks to routing), but a `providedIn: 'root'` service is created once and lives for the lifetime of the app. That makes services the natural home for anything that needs to outlive a single component or be shared between components that don't have a parent/child relationship.
- **The DI hierarchy, briefly**: Angular's injector isn't flat — there's a root injector (app-wide) and injectors per component/route that can override what a service resolves to for that subtree. `providedIn: 'root'` registers with the root injector, giving you one instance for the whole app; listing the same service in a component's own `providers` array creates a fresh instance scoped to that component and its children instead.

## Useful Links

| Topic | Link |
|---|---|
| HttpClient guide | [angular.dev/guide/http](https://angular.dev/guide/http) |
| `provideHttpClient` API | [angular.dev/api/common/http/provideHttpClient](https://angular.dev/api/common/http/provideHttpClient) |
| Dependency injection guide | [angular.dev/guide/di](https://angular.dev/guide/di) |
| `inject()` function | [angular.dev/api/core/inject](https://angular.dev/api/core/inject) |
| Standalone components guide | [angular.dev/guide/components/importing](https://angular.dev/guide/components/importing) |
| `@Injectable` and `providedIn` | [angular.dev/api/core/Injectable](https://angular.dev/api/core/Injectable) |
| Signals guide | [angular.dev/guide/signals](https://angular.dev/guide/signals) |
| RxJS Observable overview | [rxjs.dev/guide/observable](https://rxjs.dev/guide/observable) |
| RxJS `map` operator | [rxjs.dev/api/operators/map](https://rxjs.dev/api/operators/map) |
| RxJS `BehaviorSubject` | [rxjs.dev/api/index/class/BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject) |
| MDN: using Promises | [developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) |
| MDN: `fetch()` API | [developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) |

## Mini Examples

**1. A GET request with error handling**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUser(id: number) {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      catchError((err) => {
        console.error('Failed to load user', err);
        return of(null); // fall back to a safe value instead of breaking the stream
      }),
    );
  }
}
```

**2. A POST request that sends a body**

```typescript
@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);

  addTodo(title: string) {
    return this.http.post<Todo>('/api/todos', { title, done: false });
  }
}
```

**3. A shared counter service pattern (same shape as CartService)**

```typescript
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favorites = new BehaviorSubject<number[]>([]);
  favorites$ = this.favorites.asObservable();

  toggle(id: number) {
    const current = this.favorites.getValue();
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    this.favorites.next(next);
  }
}
```

**4. Consuming a service with the async pipe (no manual subscribe/unsubscribe)**

```typescript
@Component({
  selector: 'app-favorites-count',
  imports: [AsyncPipe],
  template: `<span>{{ (favoritesService.favorites$ | async)?.length }} favorites</span>`,
})
export class FavoritesCountComponent {
  favoritesService = inject(FavoritesService);
}
```

## Practice Exercises

**Beginner**
- Fix the missing `provideHttpClient()` call in `example1/src/app/app.config.ts` and `example2/src/app/app.config.ts` so the HTTP requests actually work — import it from `@angular/common/http` and add it to the `providers` array.

**Beginner**
- In `example2`, add a `console.log` inside the `.subscribe()` callback in `app.component.ts` that logs `Date.now()`, and compare the timestamp to the one already logged outside the subscription — confirm for yourself which one runs first and why.

**Intermediate**
- Add a `removeProduct(id: number)` method to `mango`'s `ProductService`, and wire up a "Remove" button in `product-card.component.html` — watch the navbar's product count badge update automatically since both read from the same `BehaviorSubject`.

**Intermediate**
- Give `example2`'s `PostService.getPosts()` a `.pipe(map(...))` step that filters posts to only `userId === 1`, and confirm the component doesn't need any changes since it just consumes whatever the service returns.

**Challenge**
- Add a `catchError` to `mango`'s `ProductService` (simulate a failing request with `throwError`) and surface a user-friendly error message in `ProductListComponent` instead of letting the Observable silently break.
