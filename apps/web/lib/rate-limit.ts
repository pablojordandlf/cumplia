/**
 * Simple in-memory sliding window rate limiter for Next.js API routes.
 * For production, use Upstash Redis or Vercel Edge Config for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited.
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param limit - Max requests allowed in the window
 * @param windowMs - Window size in milliseconds
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up expired entries periodically
  if (store.size > 10000) {
    for (const [key, value] of store.entries()) {
      if (value.resetAt < now) store.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Get client IP from Next.js request headers.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'anonymous';
}

/**
 * Add RateLimit headers to a Response.
 */
export function withRateLimitHeaders(
  response: Response,
  remaining: number,
  resetAt: number
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Remaining', String(remaining));
  headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
