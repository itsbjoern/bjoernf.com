import type { APIRoute } from 'astro';
import { db } from '@/db/habits';
import { trackers } from '@/db/habits/schema';
import { setTrackerSession } from '@/db/habits/session';
import bcrypt from 'bcryptjs';
import { DEFAULT_COLOR } from '@/components/Habits/util';
import { rateLimit } from '@/utils/rateLimit';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const isInRate = rateLimit(request, [
    {
      timeframe: 60,
      maxRequests: 2,
    },
    {
      timeframe: 60 * 60,
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
    const { password, color = DEFAULT_COLOR } = body;

    // Validate input
    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required', code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters', code: 'PASSWORD_TOO_SHORT' }),
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create tracker (unique constraint on passwordHash will prevent duplicates)
    let newTracker;
    try {
      [newTracker] = await db
        .insert(trackers)
        .values({
          passwordHash,
          color,
        })
        .returning();
    } catch (error: any) {
      // Check if it's a unique constraint violation
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return new Response(
          JSON.stringify({
            error: 'This password is already in use. Please choose a different password.',
            code: 'PASSWORD_ALREADY_EXISTS',
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    // Create session
    await setTrackerSession(cookies, newTracker.id);

    return new Response(
      JSON.stringify({
        trackerId: newTracker.id,
        color: newTracker.color,
        isPublic: newTracker.isPublic,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating tracker:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create tracker', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
