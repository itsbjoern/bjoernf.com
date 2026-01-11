import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { completions, habits } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

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

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error unmarking habit completion:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to unmark habit completion', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
