import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { habits } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

export const DELETE: APIRoute = async ({ cookies, params }) => {
  try {
    // Get tracker ID from session
    const trackerId = await getTrackerFromSession(cookies);

    if (!trackerId) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const habitId = params.id;
    if (!habitId) {
      return new Response(
        JSON.stringify({ error: 'Habit ID is required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Permanently delete habit (only if it belongs to the authenticated tracker)
    // Completions will be cascade deleted automatically due to foreign key constraint
    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, habitId), eq(habits.trackerId, trackerId)))
      .returning();

    if (!deletedHabit) {
      return new Response(
        JSON.stringify({ error: 'Habit not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error permanently deleting habit:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to permanently delete habit', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
