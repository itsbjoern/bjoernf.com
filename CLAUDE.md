# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website for Björn Friedrichs (bjoernf.com) built with Astro 5. The site features a blog with MDX content, interactive games, and creative projects like a 3D virtual bookshelf.

See README.md for the overall picture: where each feature's data lives, the daily routine, env vars and DB migrations. Keep it up to date when any of those change.

**Runtime:** a single Bun Docker container (`Dockerfile`) serves the prerendered pages (`dist/client`) and the API routes (`dist/server`, everything with `export const prerender = false`, under `src/pages/api/`). The API is same-origin, so call it as `/api/...` (`src/utils/api.ts`). Persistent data lives in Postgres via Drizzle (`src/db/`).

## Development Commands

Uses Bun as the package manager:

- `bun start` - Apply DB migrations, then start development server (runs on localhost:4321)
- `bun run migrate` - Apply DB migrations (`scripts/migrate.ts`)
- `bun run build` - Build production site to ./dist/
- `bun run preview` - Preview production build locally
- `bun run astro` - Run Astro CLI commands

## Architecture

### Content System

The site uses Astro's Content Collections with a custom glob loader:

- Blog posts are in `src/blog/` organized by year (e.g., `src/blog/2025/post-name/post.mdx`)
- Each post directory contains `post.mdx` and optionally `title.png` for OG images
- Content schema defined in `src/content.config.ts` with required fields: title, summary, image, tags, slugs, createdAt, published
- Posts support multiple slugs for URL routing (defined in frontmatter as array)

### Routing & Pages

- File-based routing in `src/pages/`
- Dynamic blog routes: `[post].astro` uses `getStaticPaths()` to generate pages for all post slugs
- OG images generated dynamically at `/assets/blog/[post].png` using Sharp library
- RSS feed at `/rss.xml/` renders full HTML content using experimental AstroContainer API

### Layouts

Two main layouts:
- `Layout.astro` - Primary layout with Header, Footer, Navigation, and SEO metadata
- `Game.astro` - Simplified layout for interactive experiences

### Styling

- TailwindCSS with custom theme colors (default: #e9e9e9, paper: #f5f5f5, primary: #2a2a2a)
- Custom responsive breakpoints: `smo` (max: 639px), `lgo` (max: 1023px)
- Global styles for "neo" glow effects defined in Layout.astro
- Path alias `@/*` maps to `src/*` (configured in tsconfig.json)

### Component Patterns

Components are organized by function:
- `Navigation/` - Multi-file nav with button components
- `Tabs/` - Tab interface with button and pane components
- `Ref/` - Link rendering components
- Standalone components in `src/components/`

### Interactive Features

**Wikipedia Connections Game** (`src/pages/games/wikipedia-connections/`, `src/components/Game/`):
- React-based daily puzzle game (no external game libraries)
- Custom drag-and-drop implementation (no DnD libraries)
- Puzzle generator: `src/utils/wikipediaPuzzle.ts` (TypeScript, uses the Wikipedia REST API)
- Stored in the `wikipedia_puzzles` table (one row per UTC date, see `src/db/wikipedia.ts`)
- `GET /api/wikipedia/today` serves it; the first request of each day generates it (~20s, concurrent requests share one generation), and if generation fails the latest stored puzzle is served
- No cron jobs: nothing runs on a schedule

**Habit Tracker** (`src/pages/fun/habits/`, `src/components/Habits/`, `src/pages/api/habits/`):
- Passkey (WebAuthn) auth, sessions in the `habit_sessions` table
- Public embed at `/fun/habits/embed?tracker=<id>`

### Database

- Postgres + Drizzle. All tables are in `src/db/schema.ts`; queries per feature are in `src/db/<feature>.ts`
- Migrations in `drizzle/` are applied by `scripts/migrate.ts` before the server starts (Dockerfile CMD, `bun start`); `bun run migrate` runs them by hand
- Schema change: edit `schema.ts`, then `bunx drizzle-kit generate --name <change>`, then commit the generated SQL
- Env var: `DATABASE_URL`

**Virtual Bookshelf** (`src/pages/fun/bookshelf/`):
- Three.js 3D visualization
- Reads book data from XML file (`list.xml`)
- Standalone page with custom layout (no Header/Footer)

### Utilities

- `createImage.ts` - Sharp-based OG image generator with gradient overlays
- `formatDate.ts` - Date formatting for post metadata
- `share.ts` - Social sharing link generators (Email, LinkedIn, WhatsApp, X)

### Build Configuration

- `output: "static"` with the Node adapter: pages are prerendered and routes with `prerender = false` run on the server
- Build assets directory: `static/`
- Vite includes XML files as assets
- Site URL: https://bjoernf.com
- Integrations: Tailwind, MDX, Sitemap, React
- Uses Prettier with Astro plugin for formatting

### Blog Post Requirements

When creating new blog posts:
- Create directory: `src/blog/YYYY/slug-name/`
- Required files: `post.mdx`
- Optional: `title.png` (used in OG image generation)
- Frontmatter must include all schema fields from content.config.ts
- Use `slugs` array for primary slug and any redirect URLs
- Set `published: true` to make visible
