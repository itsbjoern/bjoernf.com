import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { wikipediaPuzzles } from '@/db/schema';
import { generatePuzzle, type Puzzle } from '@/utils/wikipediaPuzzle';

export function todayUtc(): string {
  return new Date().toISOString().split('T')[0];
}

// Generations currently running, so simultaneous first visitors share one instead of each starting their own.
const inFlight = new Map<string, Promise<Puzzle>>();

/**
 * The puzzle for `date`. The first request for a day generates it (~20s) and
 * stores it; everyone after that gets the stored one.
 */
export async function getOrCreatePuzzle(date: string): Promise<Puzzle> {
  const existing = await findPuzzle(date);
  if (existing) return existing;

  let pending = inFlight.get(date);
  if (!pending) {
    pending = createPuzzle(date).finally(() => inFlight.delete(date));
    inFlight.set(date, pending);
  }
  return pending;
}

/** The most recent stored puzzle, used as a fallback if generating today's fails. */
export async function getLatestPuzzle(): Promise<Puzzle | null> {
  const [row] = await db
    .select()
    .from(wikipediaPuzzles)
    .orderBy(desc(wikipediaPuzzles.date))
    .limit(1);
  return (row?.puzzle as Puzzle) ?? null;
}

async function findPuzzle(date: string): Promise<Puzzle | null> {
  const [row] = await db.select().from(wikipediaPuzzles).where(eq(wikipediaPuzzles.date, date));
  return (row?.puzzle as Puzzle) ?? null;
}

async function createPuzzle(date: string): Promise<Puzzle> {
  const started = Date.now();
  const puzzle = await generatePuzzle(date);
  // If a puzzle for this date was stored in the meantime, keep that one so everyone plays the same puzzle.
  await db.insert(wikipediaPuzzles).values({ date, puzzle }).onConflictDoNothing();
  console.log(`[wikipedia] Generated puzzle for ${date} in ${(Date.now() - started) / 1000}s`);
  return (await findPuzzle(date)) ?? puzzle;
}
