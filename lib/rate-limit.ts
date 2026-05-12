/**
 * Lightweight in-process rate limiter (sliding window).
 *
 * Trade-offs:
 *  - Per-instance only. Multi-instance deployments share no state — each
 *    instance enforces its own quota. For strict global limits, swap the
 *    `store` for Upstash Redis (`@upstash/ratelimit`) — the API stays the same.
 *  - Memory-bounded: stale buckets are evicted on every check.
 *  - Good enough for blocking burst abuse on a single Vercel function.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

function evictStale(now: number) {
  // Cheap O(n) pass triggered only when the map gets large enough to matter.
  if (store.size < 1000) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Remaining requests in the current window. */
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
  /** Window size in seconds. */
  limit: number;
}

/**
 * Returns whether a request keyed by `identifier` is allowed.
 * Each unique `bucket` (e.g. "otp", "coupon-validate") has its own quota.
 */
export function rateLimit(input: {
  bucket: string;
  identifier: string;
  /** Max calls per window. */
  max: number;
  /** Window length in seconds. */
  windowSec: number;
}): RateLimitResult {
  const now = Date.now();
  const key = `${input.bucket}:${input.identifier}`;
  const bucket = store.get(key);

  evictStale(now);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + input.windowSec * 1000 });
    return {
      ok: true,
      remaining: input.max - 1,
      retryAfter: input.windowSec,
      limit: input.max,
    };
  }

  if (bucket.count >= input.max) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      limit: input.max,
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: input.max - bucket.count,
    retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    limit: input.max,
  };
}

/**
 * Best-effort client IP extraction. Vercel proxies set `x-forwarded-for`;
 * other hosts may set `x-real-ip` or `cf-connecting-ip`.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

/**
 * Helper that returns a standard 429 Response when over the limit.
 * Pass the original Request only to grab the URL for the `Date` header.
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "Retry-After": String(result.retryAfter),
  };
}
