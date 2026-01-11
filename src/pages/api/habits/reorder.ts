import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { habits } from '@/db/habits/schema';
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
    const { habitIds } = body;

    // Validate input
    if (!Array.isArray(habitIds) || habitIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Habit IDs array is required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update order for each habit
    // Use Promise.all to update all habits in parallel
    await Promise.all(
      habitIds.map((habitId, index) =>
        db
          .update(habits)
          .set({ order: index })
          .where(and(eq(habits.id, habitId), eq(habits.trackerId, trackerId)))
      )
    );

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error reordering habits:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to reorder habits', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
