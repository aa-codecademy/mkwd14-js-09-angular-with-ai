# Class 3 — Routing, Services & Component Composition

In this class you'll make the leap from a single-page component tree to a real multi-page application using Angular's Router. You'll learn how to declare routes, lazy-load components so the app stays fast, navigate without full page reloads, and handle unknown URLs gracefully. Along the way you'll also see how a shared `Injectable` service backed by an RxJS `BehaviorSubject` lets sibling components (a navbar badge and a product list) stay in sync with the same piece of state, and how bigger apps get organized into `shared/` and `core/` folders with small, composed components (navbar, footer, card-shell, product-card). Two projects back this class: a minimal `example1` for the core routing mechanics, and a fuller `mango` app that puts routing together with services, models, and Angular Material.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [Defining Routes](#defining-routes)
  - [Lazy Loading with loadComponent](#lazy-loading-with-loadcomponent)
  - [The Wildcard Route](#the-wildcard-route)
  - [RouterOutlet](#routeroutlet)
  - [RouterLink & RouterLinkActive](#routerlink--routerlinkactive)
  - [provideRouter & Application Config](#providerouter--application-config)
  - [Services & Dependency Injection](#services--dependency-injection)
  - [Sharing State with RxJS BehaviorSubject](#sharing-state-with-rxjs-behaviorsubject)
  - [Models/Interfaces for Typed Data](#modelsinterfaces-for-typed-data)
  - [Component Composition (shared/core folders)](#component-composition-sharedcore-folders)
- [Theory](#theory)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### Defining Routes

A route table is just a plain array of `Route` objects — each one maps a URL `path` to a component. The Router walks the array top to bottom and renders the first entry whose `path` matches the current URL.

**Why it exists:** a single-page app (SPA) still needs to feel like a multi-page website — different URLs, back/forward button support, bookmarkable links — without actually asking the server for a new HTML page every time. The route table is the map the Router uses to decide what to show for a given URL.

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
];
```

### Lazy Loading with loadComponent

Instead of a static `component:` reference, a route can use `loadComponent: () => import('./x.component').then(m => m.XComponent)`. Angular only downloads that component's JavaScript the first time the route is actually visited.

**Why it exists:** without lazy loading, every component in your app — even ones the user may never visit — gets bundled into the initial download. For a big app, that means a slower first load. Lazy loading splits the app into chunks so the browser only fetches what's needed, when it's needed.

```ts
{
  path: 'products',
  loadComponent: () => import('./products.component').then((m) => m.ProductsComponent),
}
```

> **Note:** the dynamic `import()` is standard JavaScript, not an Angular-specific trick — Angular's build tooling (esbuild/Vite) recognizes it and automatically creates a separate bundle chunk for it.

### The Wildcard Route

A route with `path: '**'` matches any URL that didn't match anything above it — commonly used to show a "404 / not found" page.

**Why it exists:** without a catch-all, mistyped or invalid URLs would just show a blank router outlet. A wildcard route gives users (and search engines) a real page instead of silence.

```ts
{ path: '**', loadComponent: () => import('./not-found.component').then((m) => m.NotFoundComponent) }
```

> **Gotcha:** the wildcard route **must be the last item** in the array. Since the Router takes the first match, a `'**'` placed earlier would swallow every URL and none of your other routes would ever be reached.

### RouterOutlet

`<router-outlet />` is a placeholder in a template — it marks *where* the Router should render whichever component matches the current URL.

**Why it exists:** the Router needs somewhere to put the matched component. Without an outlet, the Router has a route table but nowhere to render into.

```html
<nav>...</nav>
<main>
  <router-outlet />
</main>
```

> **Gotcha:** for standalone components, `RouterOutlet` must be explicitly imported and added to the component's `imports` array — it isn't available "for free" the way it used to be when apps relied on `NgModule`s.

### RouterLink & RouterLinkActive

`routerLink` replaces a plain `href` so clicking a link navigates through the Angular Router (updating the URL and swapping the outlet's content) instead of triggering a full page reload. `routerLinkActive` adds a CSS class to the link when its route is the currently active one.

**Why it exists:** a full page reload would throw away all in-memory app state (open forms, loaded data, scroll position) — exactly what an SPA is trying to avoid. `routerLinkActive` gives users a visual cue ("you are here") for free, without manually tracking the current URL yourself.

```html
<a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
<a routerLink="/products" routerLinkActive="active">Products</a>
```

> **Gotcha:** without `[routerLinkActiveOptions]="{ exact: true }"`, a link to `/` stays highlighted on every route, because `/` is technically a prefix of every path. Add `exact: true` for links that should only be active on an exact match.

### provideRouter & Application Config

Modern standalone Angular apps don't bootstrap through an `NgModule` — instead, `app.config.ts` builds an `ApplicationConfig` object whose `providers` array wires up app-wide services, including the Router via `provideRouter(routes)`.

**Why it exists:** this is the standalone equivalent of `RouterModule.forRoot(routes)` from the old NgModule-based setup — it registers your route table with Angular's dependency injection system so the Router service knows what routes exist.

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```

```ts
// main.ts
bootstrapApplication(App, appConfig);
```

### Services & Dependency Injection

A service is just a class decorated with `@Injectable`. `providedIn: 'root'` tells Angular to create exactly **one shared instance** for the whole app, and to hand that same instance to any component that asks for it via constructor injection or `inject()`.

**Why it exists:** components should focus on displaying data and handling user interaction, not fetching/storing/mutating data themselves. A service centralizes that logic in one place so multiple unrelated components (a navbar, a product list) can read and react to the same data without knowing about each other directly.

```ts
@Injectable({ providedIn: 'root' })
export class ProductService {
  private products = inject(SomeDep);
}
```

```ts
export class NavbarComponent {
  private productService = inject(ProductService); // the modern alternative to constructor injection
}
```

### Sharing State with RxJS BehaviorSubject

A `BehaviorSubject` is an RxJS observable that always remembers its **current value** and immediately hands it to any new subscriber. Exposing it as `.asObservable()` lets components *read* the stream without being able to push new values into it directly.

**Why it exists:** plain `Subject`s only emit to subscribers that were already listening *at the moment* a value was pushed — a component that subscribes late would miss the current state entirely. `BehaviorSubject` fixes that by always replaying the latest value, which is exactly what you want for shared app state like "the current product list."

```ts
private _products = new BehaviorSubject<Product[]>([]);
products(): Observable<Product[]> {
  return this._products.asObservable();
}
addProduct(p: Product) {
  this._products.next([...this._products.getValue(), p]);
}
```

> **Gotcha:** always subscribe in `ngOnInit` (not the constructor) and unsubscribe in `ngOnDestroy` — otherwise you leak subscriptions every time the component is destroyed and recreated (e.g. by navigating away and back).

### Models/Interfaces for Typed Data

A plain TypeScript `interface` (like `Product`) describes the *shape* of data flowing through the app — it has no runtime behavior of its own.

**Why it exists:** without a shared interface, every component would need to independently guess (or duplicate) the shape of a product object, with no compiler help if a field is renamed or missing. A single `Product` interface gives you autocomplete and compile-time errors everywhere that data is used.

```ts
export interface Product {
  id: number;
  name: string;
  price: number;
}
```

### Component Composition (shared/core folders)

Bigger Angular apps organize files into folders like `shared/components` (reusable UI pieces: navbar, footer, card-shell), `shared/services` (things like `ProductService`), and `core/models` (interfaces/types) — as opposed to dumping everything flat next to `app.component.ts`.

**Why it exists:** as an app grows past a handful of components, a flat structure becomes hard to navigate. Grouping by *role* (a reusable component vs. a page vs. a data model) makes it obvious where to look for something and where a new file belongs.

```
src/app/
  core/models/product.model.ts        <- data shapes
  shared/services/product.service.ts  <- shared state/logic
  shared/components/navbar/...        <- reusable UI
  components/home/...                 <- page-level components
```

## Theory

- **Client-side routing vs. server-side routing**: in a traditional multi-page site, every link click sends a new HTTP request and the browser reloads the whole page. Angular's Router intercepts link clicks and history navigation, then updates only the part of the DOM inside `<router-outlet>` — the browser's URL bar changes, but no page reload happens. This is what makes an Angular app a true Single Page Application (SPA).
- **Lazy loading and bundle splitting**: when you use `loadComponent` (or `loadChildren` for grouping multiple routes), Angular's build tool creates a separate JS "chunk" for that code path. The browser only downloads that chunk when the user actually navigates there, which is why lazy loading matters more and more as an app grows — it keeps the *initial* bundle small even if the *total* app is large.
- **Why routing needs its own DI-registered provider (`provideRouter`)**: the Router itself is implemented as an injectable Angular service. Registering it via `provideRouter(routes)` in `app.config.ts` is what makes `Router`, `ActivatedRoute`, `RouterLink`, etc. actually resolvable through dependency injection anywhere in the app — without it, those APIs simply wouldn't be available.
- **Singleton services and shared state**: `providedIn: 'root'` is a form of the Singleton pattern enforced by Angular's injector. Because there's only ever one `ProductService` instance app-wide, a `BehaviorSubject` inside it becomes a lightweight, framework-native alternative to a full state-management library (like NgRx) for small-to-medium apps.

## Useful Links

| Topic | Link |
|---|---|
| Router overview | [angular.dev/guide/routing](https://angular.dev/guide/routing) |
| Common routing tasks (wildcard, lazy loading, router-outlet) | [angular.dev/guide/routing/common-router-tasks](https://angular.dev/guide/routing/common-router-tasks) |
| `provideRouter` API | [angular.dev/api/router/provideRouter](https://angular.dev/api/router/provideRouter) |
| `RouterLink` / `RouterLinkActive` API | [angular.dev/api/router/RouterLink](https://angular.dev/api/router/RouterLink) |
| Dependency injection guide | [angular.dev/guide/di](https://angular.dev/guide/di) |
| `@Injectable` and `providedIn` | [angular.dev/api/core/Injectable](https://angular.dev/api/core/Injectable) |
| RxJS `BehaviorSubject` | [rxjs.dev/api/index/class/BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject) |
| Angular component lifecycle hooks | [angular.dev/guide/components/lifecycle](https://angular.dev/guide/components/lifecycle) |
| Angular Material components (used in Mango) | [material.angular.dev/components/categories](https://material.angular.dev/components/categories) |
| `bootstrapApplication` API | [angular.dev/api/platform-browser/bootstrapApplication](https://angular.dev/api/platform-browser/bootstrapApplication) |

## Mini Examples

**1. A route with a route parameter**

```ts
// app.routes.ts
{ path: 'products/:id', loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent) }
```
```ts
// product-detail.component.ts
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  id = toSignal(this.route.paramMap.pipe(map(p => p.get('id'))));
}
```

**2. Programmatic navigation from code**

```ts
export class LoginComponent {
  private router = inject(Router);

  onLoginSuccess() {
    this.router.navigate(['/dashboard']); // navigate without a template <a> click
  }
}
```

**3. A tiny counter service shared across two components**

```ts
@Injectable({ providedIn: 'root' })
export class CounterService {
  private count = new BehaviorSubject(0);
  value$ = this.count.asObservable();
  increment() { this.count.next(this.count.getValue() + 1); }
}
```

**4. Redirecting one path to another**

```ts
{ path: 'home', redirectTo: '', pathMatch: 'full' }
```

## Practice Exercises

**Beginner**
- Add a new `ContactComponent` to `example1` and register a lazy-loaded `contact` route for it, with a `routerLink` in the navbar.

**Beginner**
- In `mango`, add a `stock === 0` check in `product-card.component.html` that shows an "Out of Stock" badge using `@if`.

**Intermediate**
- Add a route parameter to `mango`'s products route (e.g. `products/:id`) and build a `ProductDetailComponent` that reads the `id` from `ActivatedRoute` and looks up the matching product from `ProductService`.

**Intermediate**
- Extend `ProductService` with a `removeProduct(id: number)` method, and wire up a delete button in `product-card.component.html` that calls it — watch the navbar's product count update automatically since both read from the same `BehaviorSubject`.

**Challenge**
- Add route guards: create a `CanActivateFn` that blocks navigation to a new `admin` route unless a (mocked) `AuthService.isLoggedIn()` returns true, and redirect unauthenticated users to the home route instead.
