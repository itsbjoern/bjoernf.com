import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Database file path from environment variable (specific to habits app)
const dbPath = path.join(process.cwd(), 'data', 'habits.db');

// Create SQLite connection
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create drizzle instance with schema
export const db = drizzle(sqlite, { schema });

console.log(path.join(process.cwd(), 'drizzle', 'habits'))
migrate(db, {
  migrationsFolder: path.join(process.cwd(), 'drizzle', 'habits'),
});

// Export schema for use in queries
export { schema };
