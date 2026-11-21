// Applies the SQL migrations in drizzle/ to DATABASE_URL.
// Runs before the server starts (Dockerfile CMD and `bun start`).
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { fileURLToPath } from 'node:url';

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn('DATABASE_URL is not set, skipping migrations');
  process.exit(0);
}

const client = postgres(url, { max: 1, onnotice: () => {} });
await migrate(drizzle(client), {
  migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
});
await client.end();
console.log('Database migrations applied');
