
type TimeWindow = {
  timeframe: number; // in seconds
  maxRequests: number;
};

export function rateLimit(request: Request, timeWindows: TimeWindow[] = [{
  timeframe: 60, // 1 minute
  maxRequests: 5,
}]): boolean {
  const url = new URL(request.url);
  const ipAddr = request.headers.get('x-forwarded-for') || request.headers.get('host') || 'unknown';
  const key = `${request.method}:${url.pathname}-${ipAddr}`;

  const now = Date.now();
  const windowSize = 60000; // 1 minute in milliseconds

  // Use a simple in-memory store for rate limiting
  if (!(global as any).rateLimitStore) {
    (global as any).rateLimitStore = new Map<string, { timestamps: number[] }>();
  }
  const store = (global as any).rateLimitStore as Map<string, { timestamps: number[] }>;

  const entry = store.get(key) || { timestamps: [] };
  // Remove timestamps older than the window size
  entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < windowSize);

  for (const window of timeWindows) {
    console.log(window)
    const requestsInWindow = entry.timestamps.filter(
      (timestamp) => now - timestamp < window.timeframe * 1000
    ).length;

    if (requestsInWindow >= window.maxRequests) {
      return false; // Rate limit exceeded for this window
    }
  }

  // Add current timestamp
  entry.timestamps.push(now);
  store.set(key, entry);
  return true; // Within rate limit
}
