# Class 5 — HTTP Client & API Communication in Angular

Welcome! In this class you'll connect an Angular app to a real backend API. You already know how to build components and templates — now you'll learn how `HttpClient` fetches data over the network, why that fetch comes back as an RxJS `Observable` instead of a `Promise`, how to keep that logic out of your components by wrapping it in an injectable service, and how to configure things like an API base URL and route parameters the "Angular way." The `mango` project in this folder is a small shop app — products, a product detail page, and a cart — that ties all of these pieces together.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [HttpClient](#httpclient)
  - [Services as singletons (`providedIn: 'root'`)](#services-as-singletons-providedin-root)
  - [RxJS Observables](#rxjs-observables)
  - [Dependency injection](#dependency-injection)
  - [Injection tokens & environment files](#injection-tokens--environment-files)
  - [Routing to detail pages (route params)](#routing-to-detail-pages-route-params)
  - [Error / not-found handling](#error--not-found-handling)
  - [Model interfaces (TypeScript)](#model-interfaces-typescript)
- [Theory](#theory)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### HttpClient

`HttpClient` is Angular's built-in service for talking to HTTP APIs — `get`, `post`, `put`, `delete`, and friends. It's just another injectable service, obtained with `inject(HttpClient)` the same way you'd inject anything else.

**Why it exists / mental model:** you *could* reach for the browser's native `fetch()`, but `HttpClient` gives you automatic JSON parsing, generics for typing the response, and (once you register `provideHttpClient()` in your app config) a pipeline of interceptors for things like auth headers or logging. Think of it as "fetch, but wired into Angular's DI and RxJS."

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private httpClient = inject(HttpClient);

  getAll() {
    return this.httpClient.get<Product[]>('/api/products');
  }
}
```

> **Note:** `HttpClient` only works if `provideHttpClient()` is registered in `app.config.ts`'s `providers` array. In this project's current `app.config.ts`, that call is **missing** — `ProductService` injects `HttpClient` but nothing ever provided it. Angular's DI would throw a `NullInjectorError` the first time a component actually tries to use `ProductService`. Spotting and fixing this is Exercise 1 below.

### Services as singletons (`providedIn: 'root'`)

A service is a plain class decorated with `@Injectable({ providedIn: 'root' })`. Angular's injector then hands out exactly **one** shared instance to every component that asks for it.

**Why it exists / mental model:** if you're coming from React, this is roughly like a context provider you never have to wrap your tree in — instead of `useContext(SomeContext)`, every component just calls `inject(SomeService)` and gets the same object back. `mango`'s `CartService` is a good example: the navbar badge and the cart page both `inject(CartService)` and always see the same cart, with no prop-drilling or context boilerplate.

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  // one instance, shared by every component/service that injects it
}
```

> **Note:** `providedIn: 'root'` registers the service with the app's root injector. If you instead listed the same service in one component's own `providers` array, that component (and its children) would get a *separate* instance — rarely what you want for shared state like a cart.

### RxJS Observables

`HttpClient.get<T>(url)` returns an `Observable<T>`, not a `Promise<T>`. Nothing happens until something calls `.subscribe()` on it (or a template uses the `async` pipe, which subscribes for you behind the scenes).

**Why it exists / mental model:** a `Promise` starts running the instant it's created and can only ever resolve once. An `Observable` is lazy — it does nothing until subscribed — and can emit many values over time, which is what makes it a good fit for things beyond one-off HTTP calls (WebSocket messages, keystrokes, timers). For a single HTTP request, think of `.subscribe()` as the moment the request is actually sent.

```typescript
this.productService.getById(id).subscribe({
  next: (product) => this.product.set(product),
  error: (error) => console.log(error),
});
```

> **Gotcha:** every call to `.subscribe()` on `HttpClient.get(...)` triggers its own separate HTTP request. Subscribing twice to the same Observable (without sharing it) means two network calls, not one. Also: a subscription that's never cleaned up in a component that gets destroyed can leak memory — prefer the `async` pipe or `takeUntilDestroyed()` over manual subscribe/unsubscribe bookkeeping where you can.

### Dependency injection

Instead of a component creating a `new ProductService()` itself, it asks Angular's injector for one via `inject(ProductService)` (or a constructor parameter). Angular figures out which instance to hand back by walking up an injector tree.

**Why it exists / mental model:** this decouples *who uses* a service from *how it's constructed*. It's the same problem `import` solves for pulling in a module in plain JS/React, except DI additionally lets you swap out what a token resolves to per part of the app (handy for tests — swap in a fake `ProductService` without touching the component).

```typescript
export class ProductListComponent {
  private productService = inject(ProductService); // no "new", no constructor wiring
}
```

### Injection tokens & environment files

A plain interface or type disappears at runtime, so it can't identify a DI provider. `InjectionToken<T>` creates a unique, runtime-visible identifier you can provide a value for and inject elsewhere — used here for the API's base URL.

**Why it exists / mental model:** hardcoding `'http://localhost:3000/api'` inside every service would make switching environments (dev → staging → prod) painful and error-prone. Instead, `environment.ts` holds the URL per build configuration, and an `InjectionToken` exposes it to any service via `inject(API_URL)`.

```typescript
// api-url.token.ts
export const API_URL = new InjectionToken<string>('API_URL');

// app.config.ts
providers: [
  { provide: API_URL, useValue: environment.apiUrl },
]

// product.service.ts
private apiUrl = inject(API_URL);
```

> **Gotcha:** the whole point of this pattern is defeated if a service ever falls back to a hardcoded URL string "just this once" — that URL silently stops tracking environment changes.

### Routing to detail pages (route params)

`app.routes.ts` maps a path pattern like `'products/:id'` to a component; that component reads the `:id` segment via `ActivatedRoute`.

**Why it exists / mental model:** this is Angular's equivalent of a dynamic route param in React Router (`/products/:id` → `useParams()`). `ProductDetails` reads it with `this.route.snapshot.paramMap.get('id')` — a one-time read taken when the component is created, which is enough here because navigating to a *different* `:id` re-creates the component from scratch.

```typescript
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // ... fetch the product with this id
  }
}
```

> **Note:** `route.snapshot` is a one-shot read. If a component could be reused across param changes without being destroyed, you'd need to subscribe to `route.paramMap` (an Observable) instead to react to each new value.

### Error / not-found handling

`app.routes.ts` ends with a `path: '**'` wildcard route rendering a `NotFound` component — Angular's catch-all for any URL that doesn't match a defined route. Separately, `ProductDetails` renders a `ProductNotFound` component when a *valid* route (`/products/999`) resolves to no matching product.

**Why it exists / mental model:** these are two different failure modes worth telling apart — "this URL doesn't correspond to any route at all" versus "this route is valid but the data behind it doesn't exist." Handling both means a user never sees a blank page or a raw error.

```typescript
// app.routes.ts
{
  path: '**',
  loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFound),
}
```

```typescript
// product-details.component.ts
this.productService.getById(id).subscribe({
  next: (product) => this.product.set(product),
  error: (error) => console.log(error), // product() stays null → template shows <app-product-not-found>
});
```

> **Gotcha:** the wildcard (`'**'`) route must always be the *last* entry in the routes array — the router matches top to bottom, so putting it earlier would swallow every route defined after it.

### Model interfaces (TypeScript)

`Product` and `CartItem` are plain TypeScript `interface`s — not an Angular concept at all, just a description of the shape of the data flowing through the app.

**Why it exists / mental model:** without a shared interface, every component touching a `Product` would have to guess its shape, and a typo like `product.pricee` would only surface as `undefined` at runtime instead of a compile error. `HttpClient.get<Product[]>(...)` uses the interface as a generic so the compiler knows exactly what came back.

```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}
```

> **Gotcha:** interfaces are compile-time only — `HttpClient.get<Product[]>()` doesn't validate the response at runtime. If the API's real JSON shape drifts from the interface, TypeScript won't catch it; you'd need a runtime validator (e.g. Zod) for that.

## Theory

- **The injector tree, briefly:** Angular's DI isn't flat. There's a root injector (created once for the whole app by `bootstrapApplication`) and additional injectors that can exist per component or per lazy-loaded route. `providedIn: 'root'` registers a service with the root injector, so `inject(ProductService)` anywhere in the app resolves to the same single instance. Listing that same service in a component's own `providers` array instead creates a fresh instance scoped to just that component and its children — the injector for that subtree resolves the token differently than its parent would.
- **Observables vs. Promises:** a `Promise` executes immediately and settles exactly once; you can't cancel it once started. An `Observable` is lazy (nothing runs until `.subscribe()`), can emit zero, one, or many values over time, and is cancellable via `.unsubscribe()`. `HttpClient.get()` happens to return an Observable that emits once and completes — behaviorally close to a Promise for a single request — but every `.subscribe()` call re-runs the whole request from scratch, which a `Promise` (a single already-in-flight value) cannot do.
- **Change detection basics relevant here:** this app uses Angular signals (`signal()`, `input()`) for local component state — e.g. `ProductDetails.product = signal<Product | null>(null)`. A template that reads `product()` re-renders automatically whenever `.set()` is called, because Angular can precisely track which signal was read where. Where plain arrays/objects are used instead (like `CartService._items`), the convention in this codebase is to always **reassign** (`this._items = [...this._items, newItem]`) rather than mutate in place (`this._items.push(newItem)`) — bindings like `[dataSource]` on a Material table compare references, so an in-place mutation can leave the UI silently stale even though the underlying data changed.

## Useful Links

| Resource | Relevant to |
|---|---|
| [Angular HttpClient guide](https://angular.dev/guide/http) | Making GET/POST requests, typing responses |
| [Angular Dependency Injection guide](https://angular.dev/guide/di) | How `inject()` and the injector tree resolve services |
| [Angular `InjectionToken` API](https://angular.dev/api/core/InjectionToken) | The `API_URL` token pattern for config values |
| [Angular Router guide](https://angular.dev/guide/routing) | Route params (`:id`), lazy-loaded routes, wildcard routes |
| [RxJS `Observable` guide](https://rxjs.dev/guide/observable) | What `.subscribe()` actually does, laziness, cancellation |
| [RxJS `subscribe` API](https://rxjs.dev/api/index/class/Observable#subscribe) | The `{ next, error }` observer object used in `ProductDetails` |
| [MDN: Fetch API / making HTTP requests](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) | Background on what `HttpClient` is abstracting over |
| [TypeScript Interfaces handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html) | The `Product` / `CartItem` model interfaces |

## Mini Examples

**1. A weather service with error handling**

```typescript
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);

  getForecast(city: string) {
    return this.http.get<Forecast>(`/api/weather/${city}`).pipe(
      catchError((err) => {
        console.error('Weather lookup failed', err);
        return of(null); // fall back to a safe value instead of breaking the stream
      }),
    );
  }
}
```

**2. A `USER_ID` injection token for a per-session value**

```typescript
export const USER_ID = new InjectionToken<string>('USER_ID');

// app.config.ts
providers: [{ provide: USER_ID, useValue: 'guest-42' }]

// profile.service.ts
export class ProfileService {
  private userId = inject(USER_ID);
  getProfile() {
    return this.http.get<Profile>(`/api/users/${this.userId}`);
  }
}
```

**3. A todos service with a loading signal**

```typescript
@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);
  loading = signal(false);

  load() {
    this.loading.set(true);
    return this.http.get<Todo[]>('/api/todos').pipe(
      finalize(() => this.loading.set(false)),
    );
  }
}
```

**4. Consuming a service with the `async` pipe (no manual subscribe/unsubscribe)**

```typescript
@Component({
  selector: 'app-todo-count',
  imports: [AsyncPipe],
  template: `<span>{{ (todos$ | async)?.length ?? 0 }} todos</span>`,
})
export class TodoCountComponent {
  private todoService = inject(TodoService);
  todos$ = this.todoService.load();
}
```

## Practice Exercises

**Beginner**
- Add `provideHttpClient()` (from `@angular/common/http`) to the `providers` array in `mango/src/app/app.config.ts`. Without it, `ProductService` (which injects `HttpClient`) fails at runtime — confirm this for yourself by removing it, running the app, and reading the console error before you add it back.

**Beginner**
- Add a loading state to `ProductListComponent`: a `loading = signal(true)` set to `false` inside the `.subscribe()` callback (or via the RxJS `finalize` operator), and show a spinner or "Loading products…" message in the template while it's `true`.

**Intermediate**
- Add user-facing error handling to `ProductDetails.ngOnInit()`: introduce an `errorMessage = signal<string | null>(null)`, set it inside the `error` callback of the existing `.subscribe({ next, error })` call, and show it in the template instead of only `console.log`-ing the error.

**Intermediate**
- Add a second `InjectionToken` (e.g. `REVIEWS_API_URL`) alongside `API_URL`, provide it in `app.config.ts` from a new `environment.reviewsApiUrl` field, and inject it into a new `ReviewService` that fetches product reviews from that separate base URL.

**Challenge**
- Convert `ProductListComponent`'s manual `Subscription` + `ngOnDestroy` cleanup to use `takeUntilDestroyed()` from `@angular/core/rxjs-interop` instead, and confirm you can delete the `subscription` field and the `ngOnDestroy` method entirely once you do.
