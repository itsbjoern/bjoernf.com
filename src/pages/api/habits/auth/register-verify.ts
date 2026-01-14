import type { APIRoute } from 'astro';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/browser';
import { db } from '@/db';
import { habitTrackers, habitPasskeys } from '@/db/schema';
import { setTrackerSession } from '@/db/habits';
import { rateLimit } from '@/utils/rateLimit';
import { DEFAULT_COLOR } from '@/components/Habits/util';

export const prerender = false;

const rpID = import.meta.env.PROD ? 'bjoernf.com' : 'localhost';
const origin = import.meta.env.PROD ? 'https://bjoernf.com' : 'http://localhost:4321';

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
    const { credential, color = DEFAULT_COLOR } = body;

    // Get the challenge and user ID from cookies
    const expectedChallenge = cookies.get('passkey_challenge')?.value;
    const userId = cookies.get('passkey_user_id')?.value;

    if (!expectedChallenge || !userId) {
      return new Response(
        JSON.stringify({ error: 'Registration session expired', code: 'SESSION_EXPIRED' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify passkey', code: 'VERIFICATION_FAILED' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const registrationInfo = verification.registrationInfo;
    if (!registrationInfo) {
      return new Response(
        JSON.stringify({ error: 'No registration info returned', code: 'VERIFICATION_FAILED' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create tracker
    const [newTracker] = await db
      .insert(habitTrackers)
      .values({
        color,
      })
      .returning();

    // The credential.id from the browser is already base64url encoded
    // This is what we'll receive during authentication, so store it as-is
    const credentialIdString = credential.id;
    const publicKeyString = Buffer.from(registrationInfo.credential.publicKey).toString('base64');

    // Store the passkey credential
    await db.insert(habitPasskeys).values({
      id: credentialIdString,
      trackerId: newTracker.id,
      publicKey: publicKeyString,
      counter: registrationInfo.credential.counter,
      deviceType: registrationInfo.credentialDeviceType,
      backedUp: registrationInfo.credentialBackedUp,
      transports: (credential?.response?.transports as string[]) || null,
    });

    // Create session
    await setTrackerSession(cookies, newTracker.id);

    // Clear the challenge cookies
    cookies.delete('passkey_challenge', { path: '/' });
    cookies.delete('passkey_user_id', { path: '/' });

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
    console.error('Error verifying registration:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to verify registration', code: 'SERVER_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
