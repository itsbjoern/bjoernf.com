# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website for Björn Friedrichs (bjoernf.com) built with Astro 5. The site features a blog with MDX content, interactive games, and creative projects like a 3D virtual bookshelf.

## Development Commands

Uses Bun as the package manager:

- `bun start` - Start development server (runs on localhost:4321)
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

**Wikipedia Connections Game** (`src/pages/games/wikipedia-connections/`):
- React-based daily puzzle game (no external game libraries)
- Custom drag-and-drop implementation (no DnD libraries)
- Uses static JSON data files (no API calls)
- Game data structure: pages with url, title, summary, and array of links
- Python scripts in `data/` directory generate game content

**Virtual Bookshelf** (`src/pages/fun/bookshelf/`):
- Three.js 3D visualization
- Reads book data from XML file (`list.xml`)
- Standalone page with custom layout (no Header/Footer)

### Utilities

- `createImage.ts` - Sharp-based OG image generator with gradient overlays
- `formatDate.ts` - Date formatting for post metadata
- `share.ts` - Social sharing link generators (Email, LinkedIn, WhatsApp, X)

### Build Configuration

- Static site output (`output: "static"`)
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
