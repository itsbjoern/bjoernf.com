# bjoernf.com

Personal website: blog, small games and fun projects. Built with [Astro](https://astro.build), run with [Bun](https://bun.sh).

## How it fits together

```
                       ┌──────────────── Docker container (Bun) ────────────────┐
  visitor ──────────▶  │  dist/client   prerendered pages (blog, projects, …)    │
                       │  dist/server   API routes under /api                    │──▶ Postgres
                       │                (habits, wikipedia)                      │
                       └─────────────────────────────────────────────────────────┘
```

One container serves everything. Most pages are prerendered at build time, and only `src/pages/api/**` runs on request.

## Where things live

| What                       | Code                                          | Data                                               |
| -------------------------- | --------------------------------------------- | -------------------------------------------------- |
| Blog posts                 | `src/blog/YYYY/<slug>/post.mdx`               | the repo                                           |
| Virtual bookshelf          | `src/pages/fun/bookshelf/`                    | `src/pages/fun/bookshelf/list.xml` (in the repo)   |
| Code animator              | `src/components/Animator/`                    | the visitor's browser                              |
| Habit tracker              | `src/components/Habits/`, `src/pages/api/habits/` | Postgres: `habit_*` tables                     |
| Wikipedia Connections game | `src/components/Game/`, `src/pages/api/wikipedia/` | Postgres: `wikipedia_puzzles` (one row per day) |

Database code is in `src/db/`: `schema.ts` holds all tables, and `habits.ts` / `wikipedia.ts` hold the queries.

## Routines

There are no scheduled jobs. The daily Wikipedia puzzle is created on demand: the first visit to the game each day (UTC) makes `/api/wikipedia/today` build a new puzzle from Wikipedia (`src/utils/wikipediaPuzzle.ts`). That visitor waits about 20 seconds, and everyone after them gets the stored puzzle right away. If generation fails, the most recent stored puzzle is served instead.

`.github/workflows/main.yml` builds the site on every push and PR. It only checks that the build works; deploying is done by the Docker host.

## Database

- Postgres, accessed through [Drizzle](https://orm.drizzle.team).
- **Migrations run automatically** before the server starts (`scripts/migrate.ts`, called from the Dockerfile and `bun start`), using the SQL files in `drizzle/`. Run them by hand with `bun run migrate`.
- To change the schema: edit `src/db/schema.ts`, run `bunx drizzle-kit generate --name <what-changed>`, and commit the new file in `drizzle/`.

## Environment variables

| Variable       | Used by                    | Notes                                                                             |
| -------------- | -------------------------- | --------------------------------------------------------------------------------- |
| `DATABASE_URL` | everything under `/api`    | Postgres connection string                                                        |

Locally it goes in `.env`.

## Development

```sh
bun install
bun start            # http://localhost:4321 (needs DATABASE_URL for /api routes)
bun run build        # builds dist/client + dist/server
docker build -t bjoernf .
```

Locally, opening `/games/wikipedia-connections/` generates a puzzle the same way, as long as `DATABASE_URL` is set.
