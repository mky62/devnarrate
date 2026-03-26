import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Find user by stageName
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

    // Fetch repos for this user
    const repos = await db.repo.findMany({
      where: {
        userId: user.id,
      },
      select: {
        githubRepoId: true,
        name: true,
        language: true,
        stars: true,
        forks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedRepos = repos.map((repo) => ({
      githubRepoId: repo.githubRepoId,
      name: repo.name,
      language: repo.language,
      stargazers_count: repo.stars,
      forks_count: repo.forks,
      description: null,
    }));

    return NextResponse.json({ repos: formattedRepos });
  } catch (error) {
    console.error("Error fetching public repos:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
