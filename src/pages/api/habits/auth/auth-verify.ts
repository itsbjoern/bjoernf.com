import type { APIRoute } from 'astro';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/browser';
import { db } from '@/db';
import { habitPasskeys, habitTrackers } from '@/db/schema';
import { setTrackerSession } from '@/db/habits';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/utils/rateLimit';

export const prerender = false;

const rpID = import.meta.env.PROD ? 'bjoernf.com' : 'localhost';
const origin = import.meta.env.PROD ? 'https://bjoernf.com' : 'http://localhost:4321';

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
    const body = await request.json();
    const { credential } = body;

    // Get the challenge from cookie
    const expectedChallenge = cookies.get('passkey_auth_challenge')?.value;

    if (!expectedChallenge) {
      return new Response(
        JSON.stringify({ error: 'Authentication session expired', code: 'SESSION_EXPIRED' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const authResponse = credential as AuthenticationResponseJSON;

    // Find the passkey credential in the database
    // authResponse.id is already base64url encoded by the browser
    const credentialId = authResponse.id;

    const [passkey] = await db
      .select()
      .from(habitPasskeys)
      .where(eq(habitPasskeys.id, credentialId))
      .limit(1);

    if (!passkey) {
      return new Response(
        JSON.stringify({ error: 'Passkey not found', code: 'INVALID_CREDENTIALS' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.id,
        publicKey: Uint8Array.from(Buffer.from(passkey.publicKey, 'base64')),
        counter: passkey.counter,
      },
    });

    if (!verification.verified) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify passkey', code: 'VERIFICATION_FAILED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update the counter
    await db
      .update(habitPasskeys)
      .set({ counter: verification.authenticationInfo.newCounter })
      .where(eq(habitPasskeys.id, credentialId));

    // Get tracker info
    const [tracker] = await db
      .select()
      .from(habitTrackers)
      .where(eq(habitTrackers.id, passkey.trackerId))
      .limit(1);

    if (!tracker) {
      return new Response(
        JSON.stringify({ error: 'Tracker not found', code: 'TRACKER_NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    await setTrackerSession(cookies, tracker.id);

    // Clear the challenge cookie
    cookies.delete('passkey_auth_challenge', { path: '/' });

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
    console.error('Error verifying authentication:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to verify authentication', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
