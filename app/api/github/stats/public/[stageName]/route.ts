import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getGitStatsForUser } from "@/lib/github-stats";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ stageName: string }> }
) {
  try {
    const { stageName } = await params;

    const user = await db.user.findFirst({
      where: { stageName },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const username = user.name?.replace("@", "") || "";
    if (!username) {
      return NextResponse.json({ error: "GitHub username not found" }, { status: 400 });
    }

    const stats = await getGitStatsForUser({
      userId: user.id,
      username,
      cacheKey: `github:stats:public:${stageName}`,
    });

    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof Error && error.message.includes("GitHub")) {
      console.error("GitHub public stats error:", error);
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
