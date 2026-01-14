import type { APIRoute } from 'astro';
import { db } from '@/db';
import { habitHabits } from '@/db/schema';
import { getTrackerFromSession } from '@/db/habits';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
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

    const body = await request.json();
    const { name, description } = body;

    // Build update object
    const updates: { name?: string; description?: string } = {};
    if (name !== undefined && typeof name === 'string' && name.trim().length > 0) {
      updates.name = name.trim();
    }
    if (description !== undefined && typeof description === 'string') {
      updates.description = description.trim();
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid updates provided', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update habit (only if it belongs to the authenticated tracker)
    const [updatedHabit] = await db
      .update(habitHabits)
      .set(updates)
      .where(and(eq(habitHabits.id, habitId), eq(habitHabits.trackerId, trackerId)))
      .returning();

    if (!updatedHabit) {
      return new Response(
        JSON.stringify({ error: 'Habit not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ habit: updatedHabit }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update habit', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

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

    // Soft delete habit (only if it belongs to the authenticated tracker)
    const [deletedHabit] = await db
      .update(habitHabits)
      .set({ isActive: false })
      .where(and(eq(habitHabits.id, habitId), eq(habitHabits.trackerId, trackerId)))
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
    console.error('Error deleting habit:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete habit', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
