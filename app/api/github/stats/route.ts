import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getGitStatsForUser } from "@/lib/github-stats";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = session.user.name?.replace("@", "") || "";
    if (!username) {
      return NextResponse.json({ error: "GitHub username not found" }, { status: 400 });
    }

    const stats = await getGitStatsForUser({
      userId,
      username,
      cacheKey: `github:stats:${userId}`,
      requestHeaders: await headers(),
    });

    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof Error && error.message.includes("GitHub")) {
      console.error("GitHub stats error:", error);
      return NextResponse.json(
        { error: "GitHub API error", details: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
