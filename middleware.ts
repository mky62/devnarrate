import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, generateIdentifier } from "@/lib/rate-limit";
import { getRateLimitConfig, shouldSkipRateLimit } from "@/lib/rate-limit-config";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Only apply rate limiting to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip rate limiting for certain paths
  if (shouldSkipRateLimit(pathname)) {
    return NextResponse.next();
  }

  // Get rate limit configuration
  const config = getRateLimitConfig(pathname, method);
  if (!config) {
    return NextResponse.next();
  }

  // Get user ID from session if available
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    userId = session?.user?.id || null;
  } catch {
    // No session available, continue with IP-based rate limiting
  }

  // Generate identifier based on strategy
  const identifier = generateIdentifier(request as unknown as Request, userId, config.strategy);

  // Check rate limit
  const result = await checkRateLimit(identifier, {
    window: config.window,
    max: config.max,
    keyPrefix: config.name,
  });

  // Create response
  const response = result.allowed
    ? NextResponse.next()
    : NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: result.retryAfter,
          limit: result.limit,
          window: config.window,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfter || config.window),
          },
        }
      );

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetTime / 1000)));

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
};
