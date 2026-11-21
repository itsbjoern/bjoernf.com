import type { APIRoute } from 'astro';
import { getLatestPuzzle, getOrCreatePuzzle, todayUtc } from '@/db/wikipedia';

export const prerender = false;

/**
 * Today's Wikipedia Connections puzzle. The first request of the day (UTC)
 * generates it, which takes ~20s. If that fails, the latest stored puzzle is served.
 */
export const GET: APIRoute = async () => {
  try {
    const puzzle = await getOrCreatePuzzle(todayUtc());
    return Response.json(puzzle, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (error) {
    console.error('[wikipedia] Could not generate puzzle', error);
    const fallback = await getLatestPuzzle();
    if (fallback) {
      return Response.json(fallback, { headers: { 'Cache-Control': 'no-store' } });
    }
    return Response.json(
      { error: 'Puzzle could not be generated', code: 'UNAVAILABLE' },
      { status: 503 },
    );
  }
};
