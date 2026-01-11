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
    const { color, isPublic } = body;

    // Build update object
    const updates: { color?: string; isPublic?: boolean } = {};

    if (color !== undefined) {
      // Validate color
      if (typeof color !== 'string' || color.length !== 7 || !color.startsWith('#')) {
        return new Response(
          JSON.stringify({ error: 'Invalid color', code: 'INVALID_COLOR' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      updates.color = color;
    }

    if (isPublic !== undefined) {
      if (typeof isPublic !== 'boolean') {
        return new Response(
          JSON.stringify({ error: 'isPublic must be a boolean', code: 'INVALID_INPUT' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      updates.isPublic = isPublic;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid updates provided', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update tracker settings
    const [updatedTracker] = await db
      .update(trackers)
      .set(updates)
      .where(eq(trackers.id, trackerId))
      .returning();

    if (!updatedTracker) {
      return new Response(
        JSON.stringify({ error: 'Tracker not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ color: updatedTracker.color, isPublic: updatedTracker.isPublic }),
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
