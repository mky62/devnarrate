import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";

const CACHE_KEY = "platform:stats";
const CACHE_TTL_SECONDS = 7200; // 2 hours

export async function GET() {
  try {
    const redis = await getRedisClient();
    
    // Try to get cached stats
    const cachedStats = await redis.get(CACHE_KEY);
    if (cachedStats) {
      return NextResponse.json(JSON.parse(cachedStats));
    }

    // Fetch real stats from database
    const [developersCount, articlesCount, reposCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.repo.count(),
    ]);

    const stats = {
      developers: developersCount,
      articles: articlesCount,
      repos: reposCount,
    };

    // Cache the stats for 2 hours
    await redis.setEx(CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(stats));

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    
    // Return fallback values on error
    return NextResponse.json(
      { developers: 0, articles: 0, repos: 0 },
      { status: 500 }
    );
  }
}
