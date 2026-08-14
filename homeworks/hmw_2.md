# Homework 2 — Nestly gets multiple pages

You're extending **Nestly**, the app you built in Homework 1. So far it's a single page. Now it becomes a small multi-page app using the Angular Router — the same mechanics you saw in Class 3 with `example1` and `mango`.

## Goal

Take your existing Nestly solution and turn it into a routed app: a home/listings page, a detail page per stay, and a not-found page — without rebuilding anything you already have. You're adding routing (and a service, if you need one to share data across routes) on top of Homework 1, not starting over.

## What you must use

Everything from Homework 1 still applies — your `StayCard`, `Badge`/`Panel`, custom pipe, and `appHighlightCard` directive should all keep working exactly as they did. On top of that:

| Concept | Where to use it | From |
|---|---|---|
| A route table (`Routes` array) | Splitting your single page into a listings route and a detail route | Class 3 |
| Lazy loading (`loadComponent`) | Every route you add | Class 3 |
| The wildcard route (`**`) | A "stay not found" page | Class 3 |
| `RouterOutlet` | In your root component, replacing the spot where the listings page currently renders | Class 3 |
| `RouterLink` / `RouterLinkActive` | Navigation between "Home" and wherever else you decide to link to | Class 3 |
| A route parameter | `stays/:id` for the detail page | Class 3 |
| A service with `providedIn: 'root'` | Only if you need your `stays` array (and favorited/filter state) available to more than one routed component | Class 3 |

> **Note:** the service is optional. If you can pass everything you need through route parameters and a simple lookup, you don't need one. Only add a service if two different routed components genuinely need to read or change the same data (e.g. the listings page and the detail page both need the full `stays` array, or favoriting a stay on the detail page should show up back on the listings page).

## What must NOT change

- Do not introduce new concepts beyond routing and (optionally) a service — no NgRx, no new directives, no new pipes, no HTTP calls. If Homework 1 didn't need it, Homework 2 doesn't either.
- Your existing `StayCard`, `Badge`/`Panel`, custom pipe, and `appHighlightCard` directive should be reused as-is inside whichever routed components now render them.

## Suggested route table

```ts
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/stays-list/stays-list.component').then(m => m.StaysListComponent) },
  { path: 'stays/:id', loadComponent: () => import('./pages/stay-detail/stay-detail.component').then(m => m.StayDetailComponent) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
```

## Suggested component/file breakdown

- `app-root` — now just a shell: a small nav (`routerLink`s) and a `<router-outlet />`. It no longer owns the `stays` array directly.
- `app-stays-list` (a new "page" component) — everything your old `app-root` did: renders the grid of `StayCard`s, the superhost filter, the empty state.
- `app-stay-detail` (a new page component) — reads `:id` from the route, looks up the matching stay, and shows its full details (bigger image, full description, price, rating badge).
- `app-not-found` (a new page component) — a friendly "this stay doesn't exist" message with a `routerLink` back home.
- `StaysService` (optional, only if needed) — owns the `stays` array (and favorited state, if you want favoriting to persist across pages) behind an `Observable`, the same shape as `mango`'s `ProductService`.

## Behavior requirements

1. Clicking a `StayCard` (or a "View details" link/button on it) navigates to `stays/:id` for that stay — use `routerLink`, not a manual `(click)` + `Router.navigate` unless you have a good reason to.
2. The detail page reads the `id` from `ActivatedRoute`, finds the matching stay, and displays it. If no stay matches that `id`, show a "not found" state (either your own inline check, or by design letting an invalid id fall through your own guard logic — your call).
3. Visiting a URL that matches no route at all (e.g. `/nonsense`) renders your wildcard "not found" page.
4. The nav in `app-root` uses `routerLinkActive` so the active section is visually obvious.
5. If you added a service: favoriting a stay from either the list or the detail page should stay consistent — i.e. the state lives in the service, not duplicated in two components.

## How to build it

Keep working in your existing `nestly/` project from Homework 1 — don't `ng new` a fresh app. Add a `pages/` folder (or reuse `shared/components` / `core/models` if that's already how you organized things) and wire `app.routes.ts` + `app.config.ts` the same way `example1` and `mango` do.

## Self-check before submitting

- [ ] `npm run start` runs with no console errors.
- [ ] All of Homework 1's concepts still work exactly as before.
- [ ] Every concept in the table above is used at least once.
- [ ] Navigating directly to a bad URL shows your not-found page, not a blank screen.
