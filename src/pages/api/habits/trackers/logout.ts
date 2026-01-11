import type { APIRoute } from 'astro';
import { clearTrackerSession } from '@/db/habits/session';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  try {
    await clearTrackerSession(cookies);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error logging out:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to log out', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
