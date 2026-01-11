import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { habits } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq, and, asc } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get tracker ID from session
    const trackerId = await getTrackerFromSession(cookies);

    if (!trackerId) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all active habits for this tracker, ordered by order field
    const trackerHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.trackerId, trackerId), eq(habits.isActive, true)))
      .orderBy(asc(habits.order), asc(habits.createdAt));

    return new Response(
      JSON.stringify({ habits: trackerHabits }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching habits:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch habits', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
