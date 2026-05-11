import { getRedisClient } from "./db/redis";

interface RateLimitOptions {
  key: string;
  limit: number;
  window: number; // in seconds
}

export async function checkRateLimit({
  key,
  limit,
  window,
}: RateLimitOptions): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = await getRedisClient();
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  const remaining = Math.max(0, limit - current);
  const allowed = current <= limit;
  
  // Calculate when the rate limit will reset
  const ttl = await redis.ttl(key);
  const resetAt = ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + window * 1000;
  
  return { allowed, remaining, resetAt };
}

export function getRateLimitKey(userId: string, endpoint: string): string {
  return `ratelimit:${userId}:${endpoint}`;
}
