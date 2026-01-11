import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Trackers table - represents a user/tracker
export const trackers = sqliteTable('trackers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  passwordHash: text('password_hash').notNull().unique(),
  color: text('color').notNull().default('#216e39'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Habits table - individual habits belonging to a tracker
export const habits = sqliteTable('habits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trackerId: text('tracker_id')
    .notNull()
    .references(() => trackers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Completions table - tracks which habits were completed on which days
export const completions = sqliteTable('completions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  habitId: text('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  completedAt: text('completed_at').notNull(), // Store as YYYY-MM-DD string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Sessions table - for authentication
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  trackerId: text('tracker_id')
    .notNull()
    .references(() => trackers.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  data: text('data', { mode: 'json' }).notNull().default('{}'),
});

// Type exports for use in application code
export type Tracker = typeof trackers.$inferSelect;
export type NewTracker = typeof trackers.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type Completion = typeof completions.$inferSelect;
export type NewCompletion = typeof completions.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
