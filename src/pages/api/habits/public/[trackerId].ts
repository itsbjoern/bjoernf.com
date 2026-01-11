import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { trackers, completions, habits } from '@/db/habits/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { trackerId } = params;

    if (!trackerId) {
      return new Response(
        JSON.stringify({ error: 'Tracker ID is required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if tracker exists and is public
    const [tracker] = await db.select().from(trackers).where(eq(trackers.id, trackerId)).limit(1);

    if (!tracker) {
      return new Response(
        JSON.stringify({ error: 'Tracker not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!tracker.isPublic) {
      return new Response(
        JSON.stringify({ error: 'Tracker is not public', code: 'NOT_PUBLIC' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current year's completions with only counts
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;

    // Join completions with habits to filter by trackerId
    const trackerCompletions = await db
      .select({
        completedAt: completions.completedAt,
      })
      .from(completions)
      .innerJoin(habits, eq(completions.habitId, habits.id))
      .where(
        and(
          eq(habits.trackerId, trackerId),
          eq(habits.isActive, true),
          gte(completions.completedAt, yearStart),
          lte(completions.completedAt, yearEnd)
        )
      );

    // Count completions by date (not revealing which habits were completed)
    const completionCounts: Record<string, number> = {};

    for (const completion of trackerCompletions) {
      const date = completion.completedAt;
      completionCounts[date] = (completionCounts[date] || 0) + 1;
    }

    // Convert to array format
    const completionsArray = Object.entries(completionCounts).map(([date, count]) => ({
      date,
      count,
    }));

    return new Response(
      JSON.stringify({
        trackerId: tracker.id,
        color: tracker.color,
        year: currentYear,
        completions: completionsArray,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching public tracker data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch tracker data', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
