import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { completions, habits } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    // Get tracker ID from session
    const trackerId = await getTrackerFromSession(cookies);

    if (!trackerId) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get year from query param (default to current year)
    const yearParam = url.searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    if (isNaN(year) || year < 2000 || year > 2100) {
      return new Response(
        JSON.stringify({ error: 'Invalid year', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get completions for this tracker's habits for the specified year
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    // Join completions with habits to filter by trackerId
    const trackerCompletions = await db
      .select({
        id: completions.id,
        habitId: completions.habitId,
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

    // Group completions by date
    const completionsByDate: Record<string, string[]> = {};

    for (const completion of trackerCompletions) {
      const date = completion.completedAt;
      if (!completionsByDate[date]) {
        completionsByDate[date] = [];
      }
      completionsByDate[date].push(completion.habitId);
    }

    // Convert to array format
    const completionsArray = Object.entries(completionsByDate).map(([date, habitIds]) => ({
      date,
      habitIds,
    }));

    return new Response(
      JSON.stringify({ completions: completionsArray }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching completions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch completions', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
