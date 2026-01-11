import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import Database from 'bun:sqlite';
import * as schema from './schema';
import path from 'path';

// Database file path from environment variable (specific to habits app)
const dbPath = path.join(process.cwd(), 'data', 'habits.db');

// Create SQLite connection
const sqlite = new Database(dbPath, { create: true });

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');

// Create drizzle instance with schema
export const db = drizzle(sqlite, { schema });

console.log(path.join(process.cwd(), 'drizzle', 'habits'))
migrate(db, {
  migrationsFolder: path.join(process.cwd(), 'drizzle', 'habits'),
});

// Export schema for use in queries
export { schema };
