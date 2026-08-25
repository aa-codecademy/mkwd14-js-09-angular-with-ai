# Nestly API (Homework 3 backend)

A small NestJS + PostgreSQL API that serves `Stay` data for the Nestly app. It's the backend
you'll call from Angular's `HttpClient` in [Homework 3](../hmw_3.md) instead of using a
hardcoded array.

Every route is **public** — there is no authentication in this project (that comes later in the
course). This keeps Homework 3 focused purely on HTTP calls.

## What's in here

- `stays` — full CRUD for stay listings (`GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`)
- `seed` — endpoints to fill the database with sample stays so you have real data immediately
- Swagger docs at `/api/docs` describing every route, query param and request/response shape

## 1. Prerequisites

- **Node.js** 20+ and npm
- **PostgreSQL** running locally (or reachable from your machine) — version 14+ recommended

If you don't have Postgres installed yet, the easiest options are:

- macOS: `brew install postgresql@16 && brew services start postgresql@16`
- Docker (any OS, no local install needed):
  ```bash
  docker run --name nestly-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
  ```

## 2. Create the database

Create an empty database named `nestly_dev` (or whatever you set `DB_NAME` to in your `.env`).

Using `psql`:

```bash
psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE nestly_dev;"
```

Or with a GUI tool (TablePlus, pgAdmin, DBeaver, Postico, ...): just create a new, empty database
called `nestly_dev`. You don't need to create any tables — the server does that for you.

## 3. Configure environment variables

Copy the example env file and adjust it if your Postgres credentials differ from the defaults:

```bash
cp .env.example .env
```

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nestly_dev
PORT=3000
CORS_ORIGIN=*
```

> The app already comes with a working `.env` for the most common local Postgres setup
> (`postgres`/`postgres` on `127.0.0.1:5432`). If your local Postgres uses different
> credentials, edit `.env` to match — don't change the code.

## 4. Install and run

```bash
npm install
npm run start:dev
```

You should see:

```
Nestly API listening on http://localhost:3000/api
Swagger docs at http://localhost:3000/api/docs
```

The server automatically creates the `stays` table on first boot (via TypeORM's `synchronize`
option) — you don't need to write or run any migrations for this homework.

If you see a connection error instead, double-check:

- Postgres is actually running (`pg_isready` or check Docker Desktop)
- The database named in `DB_NAME` actually exists (step 2)
- `DB_USERNAME` / `DB_PASSWORD` in `.env` match your local Postgres setup

## 5. Load sample data (seeding)

The database starts empty. Use the seed endpoints to fill it with sample stays so you have
something real to fetch from Angular right away.

**Option A — Swagger UI (recommended, no extra tools needed):**

1. Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
2. Find the `seed` section, expand `POST /api/seed/stays`
3. Click **Try it out** → **Execute**

**Option B — curl:**

```bash
curl -X POST http://localhost:3000/api/seed/stays
```

Both return a summary like:

```json
{ "created": 8, "skipped": 0, "total": 8 }
```

Calling `POST /api/seed/stays` again is safe — stays that already exist (matched by title) are
skipped, so you'll never end up with duplicates.

Other seed endpoints:

| Endpoint | Method | What it does |
| --- | --- | --- |
| `/api/seed/stays` | `POST` | Insert sample stays (skips ones that already exist) |
| `/api/seed/stays` | `DELETE` | **Wipe every stay** and re-insert the sample data fresh |
| `/api/seed/status` | `GET` | Check how many stays currently exist in the database |

Use `DELETE /api/seed/stays` any time you've been creating/editing/deleting stays from your
Angular app while testing and want a clean slate again.

## 6. Explore the API

Once seeded, try these in the browser, Postman, or straight from Angular:

- `GET http://localhost:3000/api/stays` — list all stays
- `GET http://localhost:3000/api/stays?superhost=true` — only superhosts
- `GET http://localhost:3000/api/stays?search=river` — search title/location
- `GET http://localhost:3000/api/stays?sortBy=pricePerNight&sortDir=asc` — sort by price
- `GET http://localhost:3000/api/stays/1` — a single stay by id
- `POST http://localhost:3000/api/stays` — create a stay (see Swagger for the request body)
- `PUT http://localhost:3000/api/stays/1` — update a stay
- `DELETE http://localhost:3000/api/stays/1` — delete a stay

Full request/response shapes, query parameters, and example payloads are all documented in
Swagger at `/api/docs` — that's the fastest way to understand what to call from your
`StaysService` in Angular.

## Data shape

The `Stay` returned by the API matches the interface from Homework 1, plus timestamps:

```ts
interface Stay {
  id: number;
  title: string;
  location: string;
  pricePerNight: number;
  rating: number;
  image: string;
  superhost: boolean;
  description: string;
  createdAt: string; // ISO date string
}
```

## Available scripts

| Command | What it does |
| --- | --- |
| `npm run start:dev` | Start the server in watch mode (restarts on file changes) |
| `npm run start` | Start the server once, no watch |
| `npm run build` | Compile to `dist/` |
| `npm run lint` | Lint and auto-fix `src/` |
| `npm run format` | Format `src/` with Prettier |

## Troubleshooting

- **`NullInjectorError` / connection refused on boot** — Postgres isn't running, or the
  host/port/credentials in `.env` don't match your setup.
- **`database "nestly_dev" does not exist`** — go back to step 2 and create it.
- **CORS errors in the browser console when calling from Angular** — make sure your Angular
  dev server origin (usually `http://localhost:4200`) is allowed; `CORS_ORIGIN=*` in `.env`
  already allows every origin, which is fine for local homework use.
- **Port 3000 already in use** — change `PORT` in `.env`, then use that new port in your
  Angular service's base URL.
