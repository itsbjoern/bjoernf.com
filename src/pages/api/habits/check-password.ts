import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { trackers } from '@/db/habits/schema';
import bcrypt from 'bcryptjs';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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
    const allTrackers = await db.select().from(trackers);

    for (const tracker of allTrackers) {
      const isValidPassword = await bcrypt.compare(password, tracker.passwordHash);
      if (isValidPassword) {
        return new Response(
          JSON.stringify({ exists: true }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // No tracker found with this password
    return new Response(
      JSON.stringify({ exists: false }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error checking password:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check password', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
