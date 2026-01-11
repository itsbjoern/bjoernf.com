import type { AstroCookies } from 'astro';
import { db } from '@/db/habits';
import { sessions } from '@/db/habits/schema';
import { eq, lt } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'habits_session';
const SESSION_DURATION_DAYS = 30;

// Generate a random session ID
function generateSessionId(): string {
  return crypto.randomUUID();
}

// Get tracker ID from session cookie
export async function getTrackerFromSession(cookies: AstroCookies): Promise<string | null> {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  try {
    // Find session in database
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
      return null;
    }

    return session.trackerId;
  } catch (error) {
    console.error('Error getting tracker from session:', error);
    return null;
  }
}

// Create a new session for a tracker
export async function setTrackerSession(
  cookies: AstroCookies,
  trackerId: string
): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  try {
    // Create session in database
    await db.insert(sessions).values({
      id: sessionId,
      trackerId,
      expiresAt,
      data: {},
    });

    // Set session cookie
    cookies.set(SESSION_COOKIE_NAME, sessionId, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      expires: expiresAt,
    });

    return sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

// Clear session (logout)
export async function clearTrackerSession(cookies: AstroCookies): Promise<void> {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    try {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  // Delete session cookie
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}
