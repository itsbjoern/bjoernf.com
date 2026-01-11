import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { trackers } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq } from 'drizzle-orm';

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

    // Get tracker info
    const [tracker] = await db
      .select()
      .from(trackers)
      .where(eq(trackers.id, trackerId))
      .limit(1);

    if (!tracker) {
      return new Response(
        JSON.stringify({ error: 'Tracker not found', code: 'TRACKER_NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        trackerId: tracker.id,
        colorTheme: tracker.colorTheme,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get session', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
