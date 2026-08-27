# Class 6 — Angular Signals

Welcome! In this class you'll learn Angular's newest reactivity primitive: **Signals**. Signals give you a way to hold state that Angular can track automatically — no `async` pipe, no manual subscribe/unsubscribe, no `BehaviorSubject` boilerplate for simple cases. Three projects back this class: `example` is a small, self-contained playground for `signal()`, `computed()`, and `effect()` with no HTTP involved; `mango` takes the shopping-cart app from earlier classes and refactors *some* of its state to signals while deliberately leaving other pieces (like `CartService`) as plain fields, so you can compare the two styles side by side; `mango-http` goes further, combining signals with a functional HTTP interceptor that tracks a shared loading state across every request.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [signal() — reactive state](#signal--reactive-state)
  - [computed() — derived state](#computed--derived-state)
  - [effect() — side effects](#effect--side-effects)
  - [Signals vs. plain fields and RxJS](#signals-vs-plain-fields-and-rxjs)
  - [Signal-based input()](#signal-based-input)
  - [Functional HTTP interceptors](#functional-http-interceptors)
- [Theory](#theory)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### signal() — reactive state

A signal is a wrapper around a value that Angular can track. You create one with `signal(initialValue)`, read it by **calling it as a function**, and change it with `.set()` or `.update()` — never by reassigning it directly.

**Why it exists:** before signals, tracking "did this value change?" relied on Angular's zone-based change detection (checking the whole component tree) or manual RxJS subscriptions. Signals let Angular know *exactly* which pieces of state changed and re-render only what depends on them — simpler code, better performance.

```typescript
const count = signal(0);
count();          // read — note the parentheses!
count.set(5);      // replace
count.update(v => v + 1); // derive the new value from the old one
```

> **Gotcha:** `count` (without parentheses) is the signal object, not its value. Forgetting the `()` is the single most common signals mistake — you'll see it called out throughout this class's code.

### computed() — derived state

`computed()` creates a **read-only** signal whose value is calculated from other signals. It automatically tracks whichever signals you read inside its callback — no dependency array required.

**Why it exists:** a plain getter recalculates every single time it's accessed, even if nothing changed. `computed()` memoizes its result and only recomputes when one of its actual dependencies changes, which matters once the calculation gets expensive or is read many times per render.

```typescript
const price = signal(10);
const quantity = signal(3);
const total = computed(() => price() * quantity()); // recomputes only when price or quantity change
```

### effect() — side effects

`effect()` runs a function whenever any signal it reads changes — used for things that live *outside* the component's rendered output, like writing to `localStorage` or logging.

**Why it exists:** `computed()` is for producing a value you'll read elsewhere; `effect()` is for reacting to a change by *doing* something. Mixing the two up (using `computed()` for side effects) is a common source of confusing bugs, since Angular expects `computed()` callbacks to be pure.

```typescript
effect(() => {
  localStorage.setItem('cart', JSON.stringify(cartItems()));
});
```

> **Note:** effects registered inside a component are automatically cleaned up when that component is destroyed — you don't need to manage that yourself, unlike an RxJS subscription.

### Signals vs. plain fields and RxJS

Not everything in these projects uses signals — `mango`'s `CartService` intentionally keeps a plain field with getters, and services that call `HttpClient` still return RxJS `Observable`s (HTTP itself isn't signal-based). Components bridge the two worlds by subscribing once and writing the result into a signal: `this.service.getData().subscribe(data => this.data.set(data))`.

**Why it exists / mental model:** signals solve *synchronous, in-memory* reactive state really well, but they don't replace RxJS for async streams, cancellation, or operators like `debounceTime` and `switchMap` — you'll see both used together, not one replacing the other.

> **Gotcha:** `[(ngModel)]` two-way binding assumes a plain mutable property. Bound directly to a `WritableSignal`, it overwrites the signal itself with a raw value on change, breaking every future call to it as a function. Use `[ngModel]="mySignal()"` + `(ngModelChange)="mySignal.set($event)"` instead.

### Signal-based input()

Angular now offers `input()` and `input.required()` as a signal-based alternative to the `@Input()` decorator — a component's inputs become signals you read with `()`, just like state you create yourself.

```typescript
product = input.required<Product>();
// template: {{ product().name }}
```

### Functional HTTP interceptors

`mango-http` shows an `HttpInterceptorFn` — a plain function (not a class) registered via `provideHttpClient(withInterceptors([loadingInterceptor]))` — that wraps every outgoing request to flip a shared `LoadingService` signal on and off.

**Why it exists:** cross-cutting concerns (loading spinners, auth headers, logging) shouldn't be duplicated in every service method. An interceptor sits in the middle of the HTTP pipeline and applies to every request automatically, and using `finalize()` guarantees the "loading off" step runs whether the request succeeds or fails.

```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  loadingService.show();
  return next(req).pipe(finalize(() => loadingService.hide()));
};
```

> **Note:** interceptor **order matters** — the array passed to `withInterceptors([...])` runs in that order for the outgoing request and the reverse order for the response.

## Theory

- **Signals and change detection:** a component that only reads signals in its template can opt into a more granular change-detection strategy — Angular knows precisely which DOM bindings depend on which signal, instead of re-checking the whole tree on every event. This is part of Angular's broader move toward signal-based, "zoneless" apps.
- **Push-based vs. pull-based reactivity:** RxJS is push-based — values are pushed to subscribers as they happen. Signals are closer to pull-based — a signal's value is just read synchronously when needed, and Angular tracks *who* read it to know what to re-check later. `computed()` is what makes signals feel push-based in practice, since it recomputes automatically.
- **Why some services in `mango` still avoid signals:** signals are a tool, not a mandate. A service like `CartService` that's only ever read synchronously and doesn't need fine-grained tracking works fine as a plain field — comparing it against a signal-based equivalent (as this class's code does) is a good way to build intuition for when signals actually pay off.
- **Interceptors and the request/response pipeline:** every `HttpClient` call passes through the chain of registered interceptors before hitting the network, and the response passes back through the same chain in reverse — the same shape as Express/Koa middleware, if that's a comparison you already know.

## Useful Links

| Topic | Link |
|---|---|
| Signals guide | [angular.dev/guide/signals](https://angular.dev/guide/signals) |
| `signal()` API | [angular.dev/api/core/signal](https://angular.dev/api/core/signal) |
| `computed()` API | [angular.dev/api/core/computed](https://angular.dev/api/core/computed) |
| `effect()` API | [angular.dev/api/core/effect](https://angular.dev/api/core/effect) |
| Signal-based `input()` | [angular.dev/guide/signals/inputs](https://angular.dev/guide/signals/inputs) |
| HttpClient interceptors guide | [angular.dev/guide/http/interceptors](https://angular.dev/guide/http/interceptors) |
| `provideHttpClient` / `withInterceptors` | [angular.dev/api/common/http/withInterceptors](https://angular.dev/api/common/http/withInterceptors) |
| RxJS `switchMap` | [rxjs.dev/api/operators/switchMap](https://rxjs.dev/api/operators/switchMap) |
| RxJS `debounceTime` | [rxjs.dev/api/operators/debounceTime](https://rxjs.dev/api/operators/debounceTime) |
| MDN: `localStorage` | [developer.mozilla.org/en-US/docs/Web/API/Window/localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |

## Mini Examples

**1. A signal-backed counter with a computed doubled value**

```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);

count.update(v => v + 1);
console.log(doubled()); // recalculated automatically
```

**2. Syncing a signal to localStorage with effect()**

```typescript
const theme = signal<'light' | 'dark'>('light');

effect(() => {
  localStorage.setItem('theme', theme());
});
```

**3. A signal-based input on a presentational component**

```typescript
@Component({
  selector: 'app-badge',
  template: `<span>{{ label() }}: {{ count() }}</span>`,
})
export class BadgeComponent {
  label = input.required<string>();
  count = input(0);
}
```

**4. A minimal functional interceptor**

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(cloned);
};
```

## Practice Exercises

**Beginner**
- In `example`, add a new `signal<string>('')` for a "name" field, and render `Hello, {{ name() }}!` in the template — wire an `<input>` to it using `(input)` and `.set()`.

**Beginner**
- In `mango-http`, open `loading.interceptor.ts` and add a `console.log` before and after the request to confirm the interceptor really does wrap every outgoing call, not just one.

**Intermediate**
- In `mango`, refactor `CartService` from its plain-field implementation to use `signal()` and `computed()` for the item count and total price — compare how much code changes in the components that read from it.

**Intermediate**
- In `mango-http`, add a second signal to `LoadingService` that tracks the *number* of in-flight requests (not just a boolean), so the loading overlay only hides once every concurrent request has finished.

**Challenge**
- In `example`, extend the `summary` computed signal (or a similar computed) to depend on multiple signals, then use `untracked()` inside it to read one signal without registering it as a dependency — verify in the console which signal changes actually trigger a recompute and which don't.
