# Homework 3 — Nestly gets real HTTP calls

You're extending **Nestly** again — the app from Homework 1 (hardcoded data) and Homework 2
(routing). Now the hardcoded `stays` array goes away and gets replaced with real HTTP calls to
a small backend, the same way `mango` and `example1`/`example2` did in Class 4.

## Goal

Swap your hardcoded `Stay[]` array for data fetched from a real API using Angular's
`HttpClient`, wrapped in a service, with proper loading and error states — without breaking
anything you built in Homework 1 or 2.

## Backend: `nestly-server`

A ready-made NestJS + PostgreSQL API lives at [`nestly-server/`](./nestly-server) in this repo.
You don't write any backend code for this homework — you run it locally and call it from
Angular.

**Before you start writing Angular code, go set it up:** follow
[`nestly-server/README.md`](./nestly-server/README.md) to install PostgreSQL (if you don't have
it), create the database, run the server, and seed it with sample stays. It should only take a
few minutes and ends with:

- The API running at `http://localhost:3000/api`
- Swagger docs at `http://localhost:3000/api/docs` — this is your reference for every route,
  query parameter, and request/response shape
- 8 sample stays already in the database via the seed endpoint

Every route on this API is **public** — there's no login/auth yet, so you can call every
endpoint straight away. Auth comes in a later homework.

## What you must use

Everything from Homework 1 and 2 still applies — `StayCard`, `Badge`/`Panel`, your custom pipe,
`appHighlightCard`, and your routes (`''`, `stays/:id`, `**`) should all keep working. On top of
that:

| Concept | Where to use it | From |
|---|---|---|
| `provideHttpClient()` | In `app.config.ts` — don't forget it, it's an easy miss (see Class 4's gotcha) | Class 4 |
| `HttpClient` inside a service | A `StaysService` that calls `nestly-server`, replacing your hardcoded array | Class 4 |
| Typed HTTP responses | `HttpClient.get<Stay[]>(...)` / `HttpClient.get<Stay>(...)` | Class 4 |
| `Observable` + `subscribe` (or `async` pipe / `toSignal`) | Getting the list and a single stay into your components | Class 4 |
| Loading state | Show something ("Loading stays...") while the request is in flight | Class 4 |
| Error state | Show something friendly if the API call fails (e.g. server not running) | Class 4 |

## What must NOT change

- Do not introduce new concepts beyond HTTP + services — no NgRx, no new directives/pipes, no
  auth. Your route table, page components, and reusable components stay as they are; only where
  the data comes from changes.
- Keep reusing `StayCard`, `Badge`/`Panel`, your custom pipe, and `appHighlightCard` exactly as
  before.

## Data model

The API returns stays shaped like this (your existing `Stay` interface, plus a timestamp):

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
  createdAt: string;
}
```

## Suggested `StaysService` shape

```ts
@Injectable({ providedIn: 'root' })
export class StaysService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/stays';

  getStays(params?: { superhost?: boolean; search?: string }): Observable<Stay[]> {
    return this.http.get<Stay[]>(this.baseUrl, { params: toHttpParams(params) });
  }

  getStay(id: number): Observable<Stay> {
    return this.http.get<Stay>(`${this.baseUrl}/${id}`);
  }
}
```

> Check the `stays` section in Swagger (`/api/docs`) for the exact supported query parameters
> (`superhost`, `search`, `page`, `limit`, `sortBy`, `sortDir`) — you don't have to use all of
> them, but at least reuse your Homework 1 "superhosts only" filter by passing `superhost=true`
> to the API instead of filtering client-side.

## Behavior requirements

1. `app-stays-list` no longer owns a hardcoded array — it calls `StaysService.getStays()` and
   renders whatever comes back.
2. `app-stay-detail` fetches the single stay by `id` from the route via
   `StaysService.getStay(id)` instead of looking it up in a local array. If the API returns a
   404 (no matching stay), fall through to your "not found" state from Homework 2.
3. Both pages show a loading indicator while the request is pending, and a clear error message
   if the request fails (try it: stop `nestly-server` and reload the page).
4. Your "Show superhosts only" toggle still works — either by re-calling the API with
   `superhost=true` or by filtering the fetched list client-side. Either is fine; say in your
   README which you picked and why.
5. Favoriting stays can stay purely client-side (in-memory/service state) — the API has no
   concept of favorites, and you don't need to add one.

## How to build it

Keep working in your existing `nestly/` project from Homework 1/2 — don't `ng new` a fresh app.
Add `provideHttpClient()` to `app.config.ts`, add a `core/services/stays.service.ts` (or wherever
your services already live), and update `app-stays-list` / `app-stay-detail` to consume it
instead of a hardcoded array.

## Self-check before submitting

- [ ] `nestly-server` runs locally and `/api/stays` returns seeded data (see its README).
- [ ] `npm run start` (Angular) runs with no console errors, with the API running.
- [ ] The listings page and detail page both come from real HTTP calls, not a hardcoded array.
- [ ] A loading state is visible while data is in flight.
- [ ] Stopping the API and reloading shows an error state, not a blank page or a stuck spinner.
- [ ] Everything from Homework 1 and 2 (components, directive, pipe, routing) still works.
