import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ stageName: string }> }
) {
  try {
    const { stageName } = await params;

    if (!stageName) {
      return NextResponse.json(
        { error: "Stage name is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { stageName },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10))
    );
    const skip = (page - 1) * limit;

    const [repos, total] = await Promise.all([
      db.repo.findMany({
        where: { userId: user.id },
        select: {
          githubRepoId: true,
          name: true,
          language: true,
          stars: true,
          forks: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.repo.count({ where: { userId: user.id } }),
    ]);

    const formattedRepos = repos.map((repo) => ({
      githubRepoId: repo.githubRepoId,
      name: repo.name,
      language: repo.language,
      stargazers_count: repo.stars,
      forks_count: repo.forks,
      description: null,
    }));

    return NextResponse.json({
      repos: formattedRepos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching public repos:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
