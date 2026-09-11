# Class 10 — NgRx Signal Store

Welcome to state management! Up to now every page owned its own signals, its own loading flag, and its own subscriptions — and you saw how quickly that gets repetitive once a page has search, filters, sorting and pagination all talking to each other. In this class you'll pull that whole mess out of the component and into an **NgRx Signal Store**: one injectable object that holds the state, derives values from it, runs the HTTP calls, and refetches automatically when anything changes. By the end, the products page is a component with a single line of logic in it.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [Why a store at all?](#why-a-store-at-all)
  - [signalStore](#signalstore)
  - [withState](#withstate)
  - [patchState](#patchstate)
  - [withComputed](#withcomputed)
  - [withMethods](#withmethods)
  - [withHooks](#withhooks)
  - [rxMethod](#rxmethod)
  - [withEntities](#withentities)
  - [signalStoreFeature](#signalstorefeature)
  - [Configuring one feature twice](#configuring-one-feature-twice)
  - [Smart vs. presentational components](#smart-vs-presentational-components)
- [Theory](#theory)
  - [Signal Store vs. classic NgRx Store](#signal-store-vs-classic-ngrx-store)
  - [The auto-refetch loop](#the-auto-refetch-loop)
  - [Why switchMap and not mergeMap](#why-switchmap-and-not-mergemap)
  - [Where catchError goes](#where-catcherror-goes)
  - [Redux DevTools with withDevtools](#redux-devtools-with-withdevtools)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### Why a store at all?

Look at the class_06 version of the products page and count what the component had to manage: a signal per filter, a `Subject` for the search box, a `debounceTime` pipeline, a `Subscription` to clean up in `ngOnDestroy`, and a "reload" call after every setter. None of that is *product list* logic — it's state plumbing.

**Why it exists:** a store gives that plumbing one home. State lives in one place, the rules that change it live next to it, and the component goes back to doing what components are for — rendering. You also get it for free everywhere: inject the same store in another component and you see the same data.

```ts
// Before: the component owns everything
page = signal(1);
products = signal<Product[]>([]);
ngOnInit() { this.load(); }
setPage(p: number) { this.page.set(p); this.load(); } // easy to forget the load()

// After: the component owns nothing
protected readonly store = inject(ProductsStore);
```

### signalStore

`signalStore()` creates an injectable class out of a list of **features**. You don't write a class body — you compose one.

**Why it exists:** state management libraries traditionally make you write a lot of ceremony (actions, reducers, selectors, effects) before anything works. `signalStore` collapses that into one declaration whose parts are ordinary signals underneath, so it plugs straight into Angular's change detection.

```ts
export const CounterStore = signalStore(
  { providedIn: 'root' },      // app-wide singleton
  withState({ count: 0 }),
  withMethods((store) => ({
    increment: () => patchState(store, { count: store.count() + 1 }),
  })),
);
```

> **Note:** `{ providedIn: 'root' }` means one shared instance for the whole app — your filters survive navigating away and back. Leave it out and you must list the store in a component's `providers`, which gives every component instance its own fresh copy. Pick deliberately.

### withState

`withState()` takes a plain object and turns **each top-level key into its own signal** on the store.

**Why it exists:** if the whole state were one big signal, every component reading any part of it would re-render when anything changed. Splitting per key means a component that only reads `page` ignores changes to `search`.

```ts
withState({ page: 1, search: '' })
// store.page   -> Signal<number>   read it as store.page()
// store.search -> Signal<string>   read it as store.search()
```

> **Note:** always type your state (`const initialState: MyState = {...}`). Without it TypeScript infers `page: number` but also narrows things like `categoryId: null` to the literal type `null`, and you won't be able to assign a number later.

### patchState

`patchState()` is the only way to change store state from outside. Pass the store plus one or more partial objects / updater functions.

**Why it exists:** it applies all your changes as **one atomic update**. Set `total` and `entities` in two separate calls and subscribers briefly see the new list with the old total — one `patchState` and they only ever see a consistent state.

```ts
patchState(store, { isLoading: true });
patchState(store, { search, page: 1 });              // both change together
patchState(store, setAllEntities(items), { total }); // updater + partial in one shot
```

> **Note:** you cannot `store.page.set(2)` — store signals are read-only from the outside. That restriction is a feature: every state change has to go through a named method you can read, test, and log.

### withComputed

`withComputed()` adds derived signals. It receives the state signals and returns an object of `computed()`s.

**Why it exists:** derived data should never be stored. If you kept `hasActiveFilters` as a state field you'd have to remember to update it in five different setters — and one day you'd forget. A `computed` recalculates itself, lazily, only when its inputs change.

```ts
withComputed((state) => ({
  hasActiveFilters: computed(() => state.search() !== '' || state.categoryId() !== null),
  pageCount: computed(() => Math.ceil(state.total() / state.pageSize())),
}))
```

### withMethods

`withMethods()` adds the store's public API — the named operations that change state.

**Why it exists:** it's where business rules live. `setPage` clamps the page between 1 and `totalPages`, so an invalid page is *impossible to reach* no matter which component calls it. Rules in a store apply everywhere; rules in a component apply once.

```ts
withMethods((store, productService = inject(ProductService)) => ({
  setPage(page: number) {
    patchState(store, { page: Math.min(Math.max(page, 1), store.totalPages()) });
  },
}))
```

> **Note:** that `productService = inject(...)` default parameter is not a style quirk — it's the trick that makes DI work. `inject()` only runs inside an injection context, and the `withMethods` factory is one. Calling `inject()` inside a returned method throws.

### withHooks

`withHooks()` is the store's lifecycle: `onInit` runs when the store is first created, `onDestroy` when it's torn down.

**Why it exists:** something has to kick off the initial load. Putting it in the store instead of a component's `ngOnInit` means the data loads no matter *which* component injects the store first.

```ts
withHooks({
  onInit(store) { store._load(store.query); },
  onDestroy() { console.log('store gone'); },
})
```

### rxMethod

`rxMethod()` wraps an RxJS pipeline into a callable method. The magic: you can call it with a **signal**, and it re-runs the pipeline every time that signal changes.

**Why it exists:** it's the bridge between the signal world (your state) and the RxJS world (HTTP, debouncing, cancellation). It also manages the subscription for you and tears it down with the store — no `ngOnDestroy`, no `Subscription` field, no leak.

```ts
const load = rxMethod<ProductQuery>(
  pipe(
    tap(() => patchState(store, { isLoading: true })),
    switchMap((query) => service.getAll(query).pipe(
      tap((res) => patchState(store, setAllEntities(res.data), { isLoading: false })),
      catchError(() => { patchState(store, { isLoading: false }); return of(null); }),
    )),
  ),
);

load(store.query);        // signal  -> re-runs forever, on every change
load({ page: 1 });        // value   -> runs once
```

### withEntities

`withEntities<T>()` stores a collection in **normalized** form — an `entityMap` keyed by id plus an `ids` array — and exposes `entities()` as a signal of the list.

**Why it exists:** updating one item in a plain array means finding it and rebuilding the array. With a map it's a single key write. You also get ready-made updaters instead of writing them yourself.

```ts
withEntities<Product>()
// store.entities()  -> Product[]
// store.entityMap() -> Record<number, Product>
// store.ids()       -> number[]

patchState(store, setAllEntities(products));           // replace everything
patchState(store, addEntity(product));                 // append one
patchState(store, updateEntity({ id: 3, changes: { stock: 0 } }));
patchState(store, removeEntity(3));
```

> **Note:** entities default to an `id` property. If your model uses something else, pass a selector: `withEntities<User>()` + `setAllEntities(users, { selectId: (u) => u.uuid })`.

### signalStoreFeature

`signalStoreFeature()` bundles state + computed + methods + hooks into a reusable unit you plug into any store. It's the same composition idea as a mixin.

**Why it exists:** without it, a store with search, filters, pagination, sorting and categories becomes one 300-line file. Features let you split by concern (`withProductQuery`, `withCategories`) and test each piece on its own. Wrapping the feature in a function also lets you accept **config**:

```ts
export function withPageSize(defaultSize = 12) {
  return signalStoreFeature(
    withState({ pageSize: defaultSize }),
    withMethods((store) => ({
      setPageSize: (pageSize: number) => patchState(store, { pageSize, page: 1 }),
    })),
  );
}

// then: signalStore({ providedIn: 'root' }, withPageSize(24))
```

> **Note:** feature order matters. Features apply top to bottom, and a later one can read what earlier ones added — but not the other way round.

### Configuring one feature twice

Because `withProductQuery` is a *function* that takes config, you can build two completely
different stores out of it. `ProductsStore` (the shop) and `AdminProductsStore` (the admin
table) both plug in the same feature — one with 12 items per page sorted by newest, the other
with 10 sorted by name.

**Why it exists:** this is the whole reason config goes in a function parameter instead of in
state. Config is chosen once by whoever builds the store, so it never has to be a signal and
it never has to be duplicated per store.

```ts
export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withProductQuery({ pageSize: 12 }),                                    // shop defaults
  withCategories(),
  withDevtools('ProductsStore'),
);

export const AdminProductsStore = signalStore(
  { providedIn: 'root' },
  withProductQuery({ pageSize: 10, sortBy: 'name', sortDir: 'asc' }),    // admin defaults
  withCategories(),
  // extra computed, layered on top of what the feature already added
  withComputed(({ entities }) => ({
    outOfStockCount: computed(() => entities().filter((p) => p.stock === 0).length),
  })),
  withDevtools('AdminProductsStore'),
);
```

> **Note:** two stores built from the same feature are still two *separate* instances with
> separate state. Filtering the admin table does not touch the shop page.

### Smart vs. presentational components

`ProductListComponent` injects the store and knows all about it — that's a **smart** (container) component. `PaginationComponent` takes plain numbers in via `input()` and emits plain numbers out via `output()`, and has never heard of a store — that's a **presentational** (dumb) component.

**Why it exists:** the paginator stays reusable precisely *because* it doesn't know where its data comes from. Wire a store into it and you can only ever use it with that one store.

```ts
// dumb: inputs in, outputs out
page = input.required<number>();
pageChange = output<number>();
```

```html
<!-- the smart parent connects the two worlds -->
<app-pagination [page]="store.page()" (pageChange)="store.setPage($event)" />
```

## Theory

### Signal Store vs. classic NgRx Store

You may have seen classic NgRx code — `createAction`, `createReducer`, `createSelector`, `@ngrx/effects`. Both libraries live under the NgRx umbrella but they are **separate implementations**, and this project uses only the signal one.

| | Classic `@ngrx/store` | `@ngrx/signals` |
|---|---|---|
| State container | One global object tree | Many small stores |
| Read a value | `store.select(selector)` → Observable | `store.page()` → signal |
| Change a value | Dispatch an action → reducer | Call a method → `patchState` |
| Derived data | `createSelector` | `withComputed` |
| Side effects | `@ngrx/effects` | `rxMethod` |
| Boilerplate | High | Low |
| Redux DevTools | Built in | Via `withDevtools()` (see below) |

The trade-off is honest: classic NgRx gives you a full audit trail of every action, which is genuinely valuable in a large team. The signal store gives you 80% of the benefit for 20% of the code, which is the right call for most apps.

### The auto-refetch loop

This is the single most important idea in the class. Follow the chain:

1. The user picks a category → the template calls `store.setCategory(3)`.
2. `setCategory` does one thing: `patchState(store, { categoryId: 3, page: 1 })`.
3. The `query` computed reads `categoryId`, so it recomputes.
4. `_load` was called in `onInit` **with the `query` signal**, so it sees the change and re-runs the pipeline.
5. `switchMap` cancels any in-flight request and fires the new one.
6. `setAllEntities` writes the results, the `products()` signal changes, the `@for` block re-renders.

Nobody called "reload". Every setter in the store is a one-liner that only touches state, and the fetch is a *consequence* of the state changing. That's the difference between imperative ("do this, then reload") and reactive ("state changed, everything downstream follows") — and it's why you can't forget a reload call: there isn't one.

### Why switchMap and not mergeMap

Type "phone" quickly and you fire five requests. They can come back in any order — and if the response for `"ph"` arrives after the one for `"phone"`, the stale results win and the user sees the wrong list. That's a **race condition**, and it's one of the classic search bugs.

`switchMap` unsubscribes from the previous inner observable when a new value arrives, cancelling the outdated request. Rule of thumb:

| Operator | Behaviour | Use for |
|---|---|---|
| `switchMap` | Cancel previous | Search, filters, navigation — anything where only the latest matters |
| `mergeMap` | Run all in parallel | Independent writes (e.g. fire 5 deletes) |
| `concatMap` | Queue in order | Ordered writes where sequence matters |
| `exhaustMap` | Ignore new while busy | Login/submit buttons — swallows double-clicks |

### Where catchError goes

Look closely at where `catchError` sits in `product.feature.ts` — **inside** the `switchMap`, on the inner observable:

```ts
switchMap((query) => service.getAll(query).pipe(
  catchError(() => of(null)),   // ✅ inner: only this request fails
))
```

If you put it on the outer pipe instead, the first failed request errors the whole `rxMethod` stream. An errored observable is **finished** — it will never emit again — so your store would silently stop reacting to filter changes forever. One flaky request would break the page until a refresh.

### Redux DevTools with withDevtools

Signal stores have no actions and no reducers, so the Redux DevTools extension has nothing to
subscribe to on its own — and `@ngrx/signals` ships no devtools entry point. The community
package `@ngrx-toolkit/core` fills the gap: it pushes a **state snapshot** into the extension
every time the store changes.

Two pieces have to line up:

```ts
// app.config.ts - name the whole app once
providers: [provideDevtoolsConfig({ name: 'Mango' })]
```

```ts
// each store - add the feature LAST, with a unique name
export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withProductQuery({ pageSize: 12 }),
  withCategories(),
  withDevtools('ProductsStore'),
);
```

Each store shows up as its own slice under that name, so you can watch `page`, `search` and
the entity map change live as you click around.

> **Note:** give every store a **unique** `withDevtools` name. Two stores sharing a name
> overwrite each other in the panel and you end up debugging the wrong state.

Things to be aware of:

- It's not first-party, and it's **dev-mode only** — it strips itself out of production builds.
- Because there are no real actions, you get state *diffs*, not a meaningful action log.
  Time-travel debugging won't work.
- **Angular DevTools** is still the better tool for seeing signal values in the component and
  injector tree.

## Useful Links

| Topic | Link |
|---|---|
| NgRx Signals overview | https://ngrx.io/guide/signals |
| `signalStore` | https://ngrx.io/guide/signals/signal-store |
| Custom store features | https://ngrx.io/guide/signals/signal-store/custom-store-features |
| Entity management | https://ngrx.io/guide/signals/signal-store/entity-management |
| `rxMethod` | https://ngrx.io/guide/signals/rxjs-integration |
| Store lifecycle hooks | https://ngrx.io/guide/signals/signal-store/lifecycle-hooks |
| Angular signals | https://angular.dev/guide/signals |
| `computed()` | https://angular.dev/guide/signals#computed-signals |
| `input()` / `output()` | https://angular.dev/guide/components/inputs |
| `inject()` and DI | https://angular.dev/guide/di/dependency-injection |
| RxJS `switchMap` | https://rxjs.dev/api/operators/switchMap |
| RxJS `debounceTime` | https://rxjs.dev/api/operators/debounceTime |
| RxJS `catchError` | https://rxjs.dev/api/operators/catchError |
| Material Paginator | https://material.angular.io/components/paginator |
| Angular DevTools | https://angular.dev/tools/devtools |
| ngrx-toolkit (`withDevtools`) | https://ngrx-toolkit.angulararchitects.io/ |

## Mini Examples

### 1. The smallest useful store

```ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState({ items: [] as { price: number; qty: number }[] }),
  withComputed(({ items }) => ({
    // derived, never stored - it can't fall out of sync
    total: computed(() => items().reduce((sum, i) => sum + i.price * i.qty, 0)),
    count: computed(() => items().length),
  })),
  withMethods((store) => ({
    add(item: { price: number; qty: number }) {
      patchState(store, { items: [...store.items(), item] }); // new array, never .push()
    },
    clear: () => patchState(store, { items: [] }),
  })),
);
```

### 2. A reusable loading feature

```ts
// Drop this into any store that talks to an API.
export function withLoading() {
  return signalStoreFeature(
    withState({ isLoading: false, error: null as string | null }),
    withMethods((store) => ({
      startLoading: () => patchState(store, { isLoading: true, error: null }),
      finishLoading: () => patchState(store, { isLoading: false }),
      failLoading: (error: string) => patchState(store, { isLoading: false, error }),
    })),
  );
}

export const OrdersStore = signalStore({ providedIn: 'root' }, withLoading(), withEntities<Order>());
```

### 3. rxMethod driven by a route param signal

```ts
withMethods((store, service = inject(ProductService)) => ({
  loadOne: rxMethod<number>(
    pipe(
      // switchMap again: if the route id changes mid-request, cancel the old one
      switchMap((id) => service.getById(id).pipe(
        tap((product) => patchState(store, { product })),
        catchError(() => of(null)),   // inner pipe! keeps the stream alive
      )),
    ),
  ),
}))

// in a component - the store refetches whenever the route id changes:
const id = toSignal(inject(ActivatedRoute).params.pipe(map((p) => Number(p['id']))));
store.loadOne(id);
```

### 4. Optimistic entity update

```ts
withMethods((store, service = inject(ProductService)) => ({
  toggleFavourite: rxMethod<Product>(
    pipe(
      // update the UI immediately, before the server answers - the app feels instant
      tap((p) => patchState(store, updateEntity({ id: p.id, changes: { favourite: !p.favourite } }))),
      mergeMap((p) => service.setFavourite(p.id, !p.favourite).pipe(
        // roll the change back if the request failed
        catchError(() => {
          patchState(store, updateEntity({ id: p.id, changes: { favourite: p.favourite } }));
          return of(null);
        }),
      )),
    ),
  ),
}))
```

## Practice Exercises

### Beginner — a `withSelection` feature

Write a `signalStoreFeature` that tracks a selected product id and add it to `ProductsStore`.

- State: `selectedId: number | null`.
- Computed: `selectedProduct`, derived from `entityMap()` and `selectedId()`.
- Methods: `select(id)`, `clearSelection()`.
- In the template, highlight the selected card and show its name above the grid.

**Hint:** read `store.entityMap()[id]` — that's exactly why `withEntities` normalizes the data.

### Beginner — show the loading state

`isLoading` is already in the store and nothing uses it.

- Render a spinner (or dim the grid with a CSS class) while `store.isLoading()` is true.
- Disable the paginator during loading so the user can't queue up requests.
- Throttle your network in DevTools so you can actually see it.

### Beginner — wire up admin table sorting

`OrdersComponent` (the admin orders table) has an empty `onSortChange(event: any) {}` and a
`matSortChange` binding that currently goes nowhere.

- Type the parameter properly as `Sort` from `@angular/material/sort`.
- Forward it to `store.setSortBy()` and `store.setSortDir()`.
- Confirm the table refetches on its own — you should not have to call any load method.

**Hint:** Material's `Sort` gives you `{ active, direction }`, and `direction` can be `''`
when sorting is cleared. `matSortDisableClear` is already on the table, so think about whether
you still need to handle that case.

### Intermediate — an error state

Right now a failed request silently leaves an empty grid.

- Add `error: string | null` to `ProductQueryState`.
- Set it in the `catchError` block, and clear it whenever a load starts.
- Show a message with a **Retry** button. Retrying should re-trigger the fetch — figure out how to do that *without* duplicating the load pipeline.
- Verify that after an error the filters still work. (If they stop working, check where you put `catchError`.)

### Intermediate — persist the query in the URL

Make filters shareable and survivable across refreshes.

- On every state change, write `search`, `categoryId`, `page`, `sortBy`, `sortDir` into the query string with `router.navigate([], { queryParams, replaceUrl: true })`.
- On store init, read them back and seed the state.
- Confirm that copying the URL into a new tab reproduces the exact same view.

**Hint:** an `effect()` inside `withHooks.onInit` can watch the `query` computed. Watch out for a feedback loop where the URL update re-triggers a state update.

### Challenge — a generic `withQuery` feature

Generalize `withProductQuery` so it works for *any* entity, not just products.

```ts
export function withQuery<T extends { id: number }, Q>(config: {
  fetch: (query: Q) => Observable<{ data: T[]; total: number; totalPages: number }>;
  buildQuery: (state: /* ... */) => Q;
}) { /* ... */ }
```

- Use it to build both a `ProductsStore` and an `OrdersStore` with no duplicated pagination logic.
- Keep it fully type-safe — no `any`.
- Write a test with `TestBed` that asserts `setPage(999)` clamps to `totalPages`.

**Hint:** generic signal store features are genuinely tricky; read the "Custom Store Features" guide and expect to fight TypeScript for a while. That fight is the exercise.
