import { pgTable, text, boolean, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

// Trackers table - represents a user/tracker
export const habitTrackers = pgTable('habit_trackers', {
  id: uuid('id').primaryKey().defaultRandom(),
  passwordHash: text('password_hash').notNull().unique(),
  color: text('color').notNull().default('#216e39'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Habits table - individual habits belonging to a tracker
export const habitHabits = pgTable('habit_habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackerId: uuid('tracker_id')
    .notNull()
    .references(() => habitTrackers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  isActive: boolean('is_active').notNull().default(true),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Completions table - tracks which habits were completed on which days
export const habitCompletions = pgTable('habit_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id')
    .notNull()
    .references(() => habitHabits.id, { onDelete: 'cascade' }),
  completedAt: text('completed_at').notNull(), // Store as YYYY-MM-DD string
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Sessions table - for authentication
export const habitSessions = pgTable('habit_sessions', {
  id: text('id').primaryKey(),
  trackerId: uuid('tracker_id')
    .notNull()
    .references(() => habitTrackers.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  data: jsonb('data').notNull().default('{}'),
});

// Type exports for use in application code
export type HabitTracker = typeof habitTrackers.$inferSelect;
export type HabitNewTracker = typeof habitTrackers.$inferInsert;

export type HabitHabits = typeof habitHabits.$inferSelect;
export type HabitNewHabit = typeof habitHabits.$inferInsert;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type HabitNewCompletion = typeof habitCompletions.$inferInsert;

export type HabitSession = typeof habitSessions.$inferSelect;
export type HabitNewSession = typeof habitSessions.$inferInsert;
