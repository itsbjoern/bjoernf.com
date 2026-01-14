import type { APIRoute } from 'astro';
import { db } from '@/db';
import { habitTrackers } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/utils/rateLimit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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

    // Check if password matches any tracker
    const allTrackers = await db.select().from(habitTrackers);

    for (const tracker of allTrackers) {
      const isValidPassword = await bcrypt.compare(password, tracker.passwordHash);
      if (isValidPassword) {
        return new Response(JSON.stringify({ exists: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // No tracker found with this password
    return new Response(JSON.stringify({ exists: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error checking password:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check password', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
