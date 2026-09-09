# Homework 5 — Nestly gets a Signal Store

You're extending **Nestly** one more time. Right now your stays list lives inside a component:
the component calls `StaysService`, keeps the array in a field or a signal, and holds the
search/filter state. In this homework you move all of that into **one NgRx Signal Store**.

> **This one is deliberately small.** The Signal Store is a big topic — this assignment only asks
> for the four core building blocks (`withState`, `withComputed`, `withMethods`, `rxMethod`) on a
> single store. No `signalStoreFeature`, no `withEntities`, no multiple stores. You've seen the
> bigger version in class in `mango`'s `ProductsStore` — you're building the beginner cousin of it.

## Setup

```bash
npm install @ngrx/signals
```

`nestly-server` must be running (see [nestly-server/README.md](./nestly-server/README.md)).

## Goal

A single `StaysStore` that owns the stays list, the loading flag, the search term and the
"superhosts only" toggle. Your list component should have **no `stays` array, no `isLoading`
field, and no `subscribe(...)` of its own** — it just reads signals from the store and calls store
methods.

## What you must use

| Concept | Where |
|---|---|
| `signalStore({ providedIn: 'root' }, ...)` | Your `StaysStore` |
| `withState(...)` | The state below |
| `withComputed(...)` | At least one derived signal |
| `withMethods(...)` | The methods below |
| `patchState(store, {...})` | Every state update — never assign to state directly |
| `rxMethod<T>(pipe(...))` | Loading stays from `StaysService` |
| `withHooks({ onInit })` | Trigger the initial load |

## The state

```ts
type StaysState = {
  stays: Stay[];
  isLoading: boolean;
  error: string | null;
  search: string;
  superhostOnly: boolean;
};
```

## The store skeleton

Fill in the blanks — this is the shape you're aiming for:

```ts
export const StaysStore = signalStore(
  { providedIn: 'root' },
  withState<StaysState>({
    stays: [],
    isLoading: false,
    error: null,
    search: '',
    superhostOnly: false,
  }),
  withComputed((state) => ({
    // derived, read-only values
    count: computed(() => state.stays().length),
    // TODO: at least one more, e.g. `hasResults` or `averagePrice`
  })),
  withMethods((store, staysService = inject(StaysService)) => ({
    loadStays: rxMethod<{ search: string; superhostOnly: boolean }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ search, superhostOnly }) =>
          staysService.getStays({ search, superhost: superhostOnly || undefined }).pipe(
            tap((stays) => patchState(store, { stays, isLoading: false })),
            catchError(() => {
              patchState(store, { isLoading: false, error: 'Could not load stays' });
              return of([]);
            }),
          ),
        ),
      ),
    ),

    setSearch(search: string): void {
      // TODO: patchState
    },
    toggleSuperhostOnly(): void {
      // TODO: patchState
    },
  })),
  withHooks({
    onInit(store) {
      // TODO: call loadStays once on startup
    },
  }),
);
```

> **Reloading on change:** `rxMethod` accepts a signal as its argument, and re-runs whenever that
> signal changes. So if you add a `computed` that bundles `search` + `superhostOnly` into one
> object, you can call `store.loadStays(store.query)` **once** in `onInit` and the store reloads
> itself whenever a filter changes. That's exactly the trick `mango`'s `ProductsStore` uses. If
> that feels like too much, calling `loadStays({...})` again from inside `setSearch` /
> `toggleSuperhostOnly` is an acceptable simpler solution.

## Behavior requirements

1. The stays list page injects `StaysStore` and renders `store.stays()`, showing a loading
   indicator while `store.isLoading()` is `true`.
2. Typing in the search box calls `store.setSearch(...)` and the list updates (server-side
   filtering — keep passing `search` to the API, as in Homework 3).
3. The "superhosts only" toggle calls `store.toggleSuperhostOnly()`.
4. Somewhere on the page, show at least one computed value from the store (e.g. "12 stays found").
5. If the request fails, `store.error()` is set and shown in the UI — the app must not crash.
6. Navigating away and back must not re-fetch from scratch every time... actually it may — with
   `providedIn: 'root'` the store survives navigation, so the previously loaded stays are still
   there. Notice this and be able to explain why in class.
7. Everything from Homework 1–4 keeps working. Your detail page and the Homework 4 form can stay
   as they are — only the list page has to go through the store.

## Bonus (optional, only if the rest works)

- Add `withDevtools()` (or `@ngrx/store-devtools`) and inspect state changes in Redux DevTools.
- Move the search/filter part into its own `signalStoreFeature` called `withStaySearch()` — this
  is the step up to what `mango` does in `class_10_ngrx`.

## Self-check before submitting

- [ ] `npm install @ngrx/signals` is in `package.json`.
- [ ] There is exactly one `StaysStore` created with `signalStore(...)`.
- [ ] All state lives in `withState` and is only ever changed via `patchState`.
- [ ] At least two `withComputed` signals exist and are used in the template.
- [ ] Loading goes through `rxMethod` — no `subscribe()` anywhere in the list component.
- [ ] The list component has no local `stays`/`isLoading` state left.
- [ ] Loading and error states are both visible in the UI.
- [ ] `ng serve` runs with no errors.
