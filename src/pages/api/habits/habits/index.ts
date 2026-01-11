import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { habits } from '@/db/habits/schema';
import { getTrackerFromSession } from '@/db/habits/session';
import { eq, and, asc, desc } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    // Get tracker ID from session
    const trackerId = await getTrackerFromSession(cookies);

    if (!trackerId) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get status from query params (active or inactive)
    const status = url.searchParams.get('status') || 'active';
    const isActive = status === 'active';

    // Get habits for this tracker
    const trackerHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.trackerId, trackerId), eq(habits.isActive, isActive)))
      .orderBy(isActive ? asc(habits.order) : desc(habits.createdAt), asc(habits.createdAt));

    return new Response(JSON.stringify({ habits: trackerHabits }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch habits', code: 'SERVER_ERROR' }),
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
    const { name, description = '' } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Habit name is required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get count of existing habits to determine order
    const existingHabits = await db.select().from(habits).where(eq(habits.trackerId, trackerId));

    const order = existingHabits.length;

    // Create habit
    const [newHabit] = await db
      .insert(habits)
      .values({
        trackerId,
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        order,
      })
      .returning();

    return new Response(JSON.stringify({ habit: newHabit }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create habit', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
