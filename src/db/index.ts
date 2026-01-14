import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import path from 'path';

console.log('Database connected and migrations applied');
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}
console.log('Database connected and migrations applied');

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

console.log('Database connected and migrations applied');
await migrate(db, {
  migrationsFolder: path.join(process.cwd(), 'drizzle'),
});

console.log('Database connected and migrations applied');
export { schema };
