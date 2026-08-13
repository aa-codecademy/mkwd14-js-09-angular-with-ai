# Homework 1 — Nestly (an Airbnb-style listings page)

You're building the homepage for **Nestly**, a fictional Airbnb alternative. No booking flow, no backend — just a solid, well-structured Angular front end that shows off everything from Class 1 and Class 2.

## Goal

A single page that lists a set of hardcoded "stays" (like Airbnb listings), lets the user favorite/filter them, and reuses a couple of small, genuinely reusable components — the same way `mango` reused `NavbarComponent`, `CardShellComponent`, and `FooterComponent`.

## What you must use

Pull directly from what you've already seen in class — no need to reach for anything not covered yet, but you are free to do so if you wish.

| Concept | Where to use it | From |
|---|---|---|
| Standalone components | Every component you create | Class 1 |
| Property binding `[prop]` | Passing a stay's data into a `StayCard` component | Class 1 |
| Event binding `(event)` | Favorite button, filter buttons | Class 1 |
| Signal `input()` / `output()` | `StayCard`'s inputs (`stay`) and output (`favorited`) | Class 1 |
| `@if` / `@for` control flow | Rendering the list, showing an empty state | Class 1 |
| Built-in pipes | `currency` for price per night, `date` if you add a "new listing" date | Class 1 / Class 2 |
| Content projection (`ng-content`) | A reusable `Panel`/`Badge` wrapper component | Class 2 |
| A custom pipe | e.g. `truncate` for long descriptions, or your own (see ideas below) | Class 2 |
| An attribute directive | e.g. highlight a card on hover, like `appHighlight` | Class 2 |

## Data model

Create a `Stay` interface:

```ts
export interface Stay {
  id: number;
  title: string;
  location: string;
  pricePerNight: number;
  rating: number;
  image: string;
  superhost: boolean;
  description: string;
}
```

Hardcode at least 6 stays in your root component, similar to how `mango`'s `AppComponent` hardcodes `products`.

## Suggested component breakdown

- `app-root` — owns the `stays` array and the current filter/favorites state.
- `app-stay-card` — receives a `stay` via `input()`, emits `favorited` via `output()` when its heart/favorite button is clicked. Displays price with the `currency` pipe and description with your custom `truncate` pipe.
- `app-badge` (or `app-panel`) — a tiny component that uses `ng-content` to wrap whatever's passed in in a pill/badge shape. Use it for "Superhost" and for the rating.
- `appHighlightCard` (directive) — attach it to each `StayCard`'s host element so it visually highlights (border, shadow, whatever you like) on `mouseenter`.

> **Note:** you don't have to build every piece as a separate file if the homework feels too big — but every concept in the table above must appear *somewhere* in your solution.

## Behavior requirements

1. Render all stays in a grid/list using `@for`, tracking by `stay.id`.
2. Add a "Show superhosts only" toggle button that filters the list using a boolean signal/property and `@if`/array filtering.
3. Clicking the favorite icon on a card should toggle a "favorited" state that's visually obvious (filled vs. outline heart, a class change, whatever you like) — this must flow from child to parent via `output()`, not be faked by mutating a shared object directly.
4. If the filtered list is ever empty, show a friendly empty state instead of a blank page (`@if (stays.length === 0) { ... } @else { ... }`).

## Custom pipe ideas (pick one, or invent your own)

- `pricePerNight | nightly` → formats as `"€120 / night"`.
- `rating | starRating` → converts a number like `4.5` into `"★★★★½"`.
- Reuse and adapt the `truncate` pipe from `class_02_basics/example3-pipes`.

## How to build it

Just create a new Angular app using the Angular cli. Then build the app in `nestly/src/app/`, following the same file layout conventions you saw in `mango` (`core/models`, `shared/components`, etc.) — it's fine to be less elaborate than `mango`, just keep it organized.

## Self-check before submitting

- [ ] `npm run start` runs with no console errors.
- [ ] Every concept in the table above is used at least once.
