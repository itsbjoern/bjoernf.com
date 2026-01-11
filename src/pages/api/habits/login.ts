import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { trackers } from '@/db/habits/schema';
import { setTrackerSession } from '@/db/habits/session';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { trackerId, password } = body;

    // Validate input
    if (!trackerId || !password) {
      return new Response(
        JSON.stringify({ error: 'Tracker ID and password are required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find tracker
    const [tracker] = await db
      .select()
      .from(trackers)
      .where(eq(trackers.id, trackerId))
      .limit(1);

    if (!tracker) {
      return new Response(
        JSON.stringify({ error: 'Invalid tracker ID or password', code: 'INVALID_CREDENTIALS' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, tracker.passwordHash);

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: 'Invalid tracker ID or password', code: 'INVALID_CREDENTIALS' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    await setTrackerSession(cookies, tracker.id);

    return new Response(
      JSON.stringify({
        success: true,
        trackerId: tracker.id,
        colorTheme: tracker.colorTheme,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error logging in:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to log in', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
