import type { APIRoute } from 'astro';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { rateLimit } from '@/utils/rateLimit';

export const prerender = false;

const rpID = import.meta.env.PROD ? 'bjoernf.com' : 'localhost';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isInRate = rateLimit(request, [
    {
      timeframe: 60,
      maxRequests: 10,
    },
  ]);
  if (!isInRate) {
    return new Response(
      JSON.stringify({ error: 'Too many requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Generate authentication options
    // We use empty allowCredentials to allow any registered passkey (usernameless flow)
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
    });

    // Store the challenge in a cookie for verification
    cookies.set('passkey_auth_challenge', options.challenge, {
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
    console.error('Error generating authentication options:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate authentication options', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
