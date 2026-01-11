import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { completions, habits } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq, and, gte, lte } from 'drizzle-orm';

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

    return new Response(JSON.stringify({ completions: completionsArray }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching completions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch completions', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get tracker ID from session
    const trackerId = await getTrackerFromSession(cookies);

    if (!trackerId) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { habitId, date } = body;

    // Validate input
    if (!habitId || !date) {
      return new Response(
        JSON.stringify({ error: 'Habit ID and date are required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD', code: 'INVALID_DATE' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify habit belongs to this tracker
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.trackerId, trackerId)))
      .limit(1);

    if (!habit) {
      return new Response(
        JSON.stringify({ error: 'Habit not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if completion already exists
    const [existingCompletion] = await db
      .select()
      .from(completions)
      .where(and(eq(completions.habitId, habitId), eq(completions.completedAt, date)))
      .limit(1);

    if (existingCompletion) {
      // Already completed, return success
      return new Response(JSON.stringify({ success: true, alreadyCompleted: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create completion
    await db.insert(completions).values({
      habitId,
      completedAt: date,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error marking habit complete:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to mark habit complete', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Get tracker ID from session
    const trackerId = await getTrackerFromSession(cookies);

    if (!trackerId) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { habitId, date } = body;

    // Validate input
    if (!habitId || !date) {
      return new Response(
        JSON.stringify({ error: 'Habit ID and date are required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify habit belongs to this tracker
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.trackerId, trackerId)))
      .limit(1);

    if (!habit) {
      return new Response(
        JSON.stringify({ error: 'Habit not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete completion
    await db
      .delete(completions)
      .where(and(eq(completions.habitId, habitId), eq(completions.completedAt, date)));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error unmarking habit completion:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to unmark habit completion', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
