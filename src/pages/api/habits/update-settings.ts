import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { trackers } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const PATCH: APIRoute = async ({ request, cookies }) => {
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
    const { color } = body;

    // Validate input
    if (!color) {
      return new Response(
        JSON.stringify({ error: 'Color is required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate color
    if (color.length !== 7 || !color.startsWith('#')) {
      return new Response(
        JSON.stringify({ error: 'Invalid color', code: 'INVALID_COLOR' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update tracker settings
    const [updatedTracker] = await db
      .update(trackers)
      .set({ color })
      .where(eq(trackers.id, trackerId))
      .returning();

    if (!updatedTracker) {
      return new Response(
        JSON.stringify({ error: 'Tracker not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ color }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update settings', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
