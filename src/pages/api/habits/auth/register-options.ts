import type { APIRoute } from 'astro';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { rateLimit } from '@/utils/rateLimit';

export const prerender = false;

const rpName = 'Habit Tracker';
const rpID = import.meta.env.PROD ? 'bjoernf.com' : 'localhost';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isInRate = rateLimit(request, [
    {
      timeframe: 60,
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
    const { userId } = body;

    // Generate a user ID if not provided (for new signups)
    const userIdToUse = userId || crypto.randomUUID();

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: `tracker-${userIdToUse}`,
      userDisplayName: 'Habit Tracker User',
      // Require resident key for better UX (allows usernameless login)
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Store the challenge in a cookie for verification
    cookies.set('passkey_challenge', options.challenge, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: import.meta.env.PROD ? 'none' : 'strict',
      maxAge: 60 * 5, // 5 minutes
    });

    // Store the user ID for later
    cookies.set('passkey_user_id', userIdToUse, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: import.meta.env.PROD ? 'none' : 'strict',
      maxAge: 60 * 5, // 5 minutes
    });

    return new Response(JSON.stringify(options), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating registration options:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate registration options', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
