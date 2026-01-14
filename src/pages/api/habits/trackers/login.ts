import type { APIRoute } from 'astro';
import { db } from '@/db';
import { habitTrackers } from '@/db/schema';
import { setTrackerSession } from '@/db/habits';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/utils/rateLimit';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const isInRate = rateLimit(request, [
    {
      timeframe: 60,
      maxRequests: 3,
    },
    {
      timeframe: 60 * 30,
      maxRequests: 5,
    },
  ]);
  if (!isInRate) {
    return new Response(
      JSON.stringify({ error: 'Too many requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

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
    const allTrackers = await db.select().from(habitTrackers);

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
        isPublic: tracker.isPublic,
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
