export interface RateLimitTier {
  name: string;
  window: number; // seconds
  max: number;
  strategy: "ip" | "user" | "combined";
}

// Rate limit tiers
export const RATE_LIMIT_TIERS = {
  CRITICAL: {
    name: "critical",
    window: 60,
    max: 10,
    strategy: "combined" as const,
  },
  AI: {
    name: "ai",
    window: 60,
    max: 5,
    strategy: "user" as const,
  },
  UPLOAD: {
    name: "upload",
    window: 60,
    max: 10,
    strategy: "user" as const,
  },
  WRITE: {
    name: "write",
    window: 60,
    max: 30,
    strategy: "user" as const,
  },
  READ: {
    name: "read",
    window: 60,
    max: 100,
    strategy: "ip" as const,
  },
  PUBLIC: {
    name: "public",
    window: 60,
    max: 50,
    strategy: "ip" as const,
  },
  WEBHOOK: {
    name: "webhook",
    window: 60,
    max: 100,
    strategy: "ip" as const,
  },
} as const;

// Path patterns to tier mapping
const PATH_PATTERNS: { pattern: RegExp; tier: RateLimitTier; methods?: string[] }[] = [
  // Critical - auth and destructive operations
  { pattern: /^\/api\/auth/, tier: RATE_LIMIT_TIERS.CRITICAL },
  { pattern: /^\/api\/user\/delete/, tier: RATE_LIMIT_TIERS.CRITICAL, methods: ["DELETE"] },

  // AI generation
  { pattern: /^\/api\/ai\/generate/, tier: RATE_LIMIT_TIERS.AI, methods: ["POST"] },

  // Upload
  { pattern: /^\/api\/upload/, tier: RATE_LIMIT_TIERS.UPLOAD, methods: ["POST"] },

  // Webhooks - skip rate limiting in middleware (handled by signature verification)
  { pattern: /^\/api\/github\/webhook/, tier: RATE_LIMIT_TIERS.WEBHOOK, methods: ["POST"] },

  // Public endpoints
  { pattern: /\/public\//, tier: RATE_LIMIT_TIERS.PUBLIC },

  // Write operations (POST, PUT, PATCH, DELETE)
  { pattern: /^\/api\//, tier: RATE_LIMIT_TIERS.WRITE, methods: ["POST", "PUT", "PATCH", "DELETE"] },

  // Read operations (GET) - catch-all
  { pattern: /^\/api\//, tier: RATE_LIMIT_TIERS.READ, methods: ["GET"] },
];

/**
 * Get rate limit configuration for a request path and method
 */
export function getRateLimitConfig(
  pathname: string,
  method: string
): RateLimitTier | null {
  // Check each pattern in order (first match wins)
  for (const { pattern, tier, methods } of PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      // If methods are specified, check if current method matches
      if (methods && !methods.includes(method)) {
        continue;
      }
      return tier;
    }
  }

  return null;
}

/**
 * Check if path should skip rate limiting (webhooks use signature verification)
 */
export function shouldSkipRateLimit(pathname: string): boolean {
  // Webhooks are verified via signatures, not rate limited
  if (pathname === "/api/github/webhook") {
    return true;
  }

  // Auth endpoints are handled by Better Auth's internal rate limiting
  if (pathname.startsWith("/api/auth/")) {
    return true;
  }

  return false;
}
