import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { completions, habits } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

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
      return new Response(
        JSON.stringify({ success: true, alreadyCompleted: true }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create completion
    await db.insert(completions).values({
      habitId,
      completedAt: date,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error marking habit complete:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to mark habit complete', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
