import { getRedisClient } from "./redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetTime: number;
  retryAfter?: number;
}

export interface RateLimitConfig {
  window: number; // seconds
  max: number;
  keyPrefix: string;
}

/**
 * Check rate limit using sliding window algorithm with Redis
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { window, max, keyPrefix } = config;

  try {
    const redis = await getRedisClient();
    const now = Date.now();
    const windowStart = now - window * 1000;
    const key = `rate_limit:${keyPrefix}:${identifier}`;

    // Remove old entries outside the window
    await redis.zRemRangeByScore(key, 0, windowStart);

    // Count current requests in window
    const currentCount = await redis.zCard(key);

    if (currentCount >= max) {
      // Get oldest entry to calculate reset time
      const oldestEntries = await redis.zRangeWithScores(key, 0, 0);
      const oldestTimestamp = oldestEntries.length > 0 ? oldestEntries[0].score : now;
      const resetTime = oldestTimestamp + window * 1000;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        limit: max,
        resetTime,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    // Add current request
    await redis.zAdd(key, { score: now, value: `${now}:${Math.random()}` });

    // Set expiration on the key
    await redis.expire(key, window);

    const remaining = max - currentCount - 1;
    const resetTime = now + window * 1000;

    return {
      allowed: true,
      remaining: Math.max(0, remaining),
      limit: max,
      resetTime,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow request if Redis is unavailable
    return {
      allowed: true,
      remaining: max,
      limit: max,
      resetTime: Date.now() + window * 1000,
    };
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;

  // Check for forwarded headers first
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // Get first IP in the chain
    const ips = forwarded.split(",").map((ip) => ip.trim());
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  const clientIp = headers.get("x-client-ip");
  if (clientIp) return clientIp;

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback to cf-connecting-ip for Cloudflare
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  return "unknown";
}

/**
 * Generate rate limit key identifier based on strategy
 */
export function generateIdentifier(
  request: Request,
  userId: string | null,
  strategy: "ip" | "user" | "combined"
): string {
  const ip = getClientIP(request);

  switch (strategy) {
    case "ip":
      return `ip_${ip}`;
    case "user":
      return userId ? `user_${userId}` : `ip_${ip}`;
    case "combined":
      return userId ? `user_${userId}:ip_${ip}` : `ip_${ip}`;
    default:
      return `ip_${ip}`;
  }
}
