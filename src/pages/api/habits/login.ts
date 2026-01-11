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
    const { password } = body;

    // Validate input
    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find all trackers and check password against each
    // (SQLite doesn't support bcrypt in queries, so we need to check in-app)
    const allTrackers = await db.select().from(trackers);

    let tracker = null;
    for (const t of allTrackers) {
      const isValidPassword = await bcrypt.compare(password, t.passwordHash);
      if (isValidPassword) {
        tracker = t;
        break;
      }
    }

    if (!tracker) {
      return new Response(
        JSON.stringify({ error: 'Invalid password', code: 'INVALID_CREDENTIALS' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    await setTrackerSession(cookies, tracker.id);

    return new Response(
      JSON.stringify({
        success: true,
        trackerId: tracker.id,
        color: tracker.color,
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
