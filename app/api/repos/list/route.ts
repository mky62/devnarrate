import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { serializeGithubRepoId } from "@/lib/github-repo-id";
import { getRepoStatus } from "@/lib/repo-status";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user's repos
    const repos = await db.repo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        githubRepoId: true,
        name: true,
        description: true,
        language: true,
        stars: true,
        forks: true,
        accountId: true,
        indexStatus: true,
        indexNamespace: true,
        latestCommitSha: true,
        indexedCommitSha: true,
      },
    });

    const reposWithStatus = repos.map((repo) => ({
      ...repo,
      indexNamespace: undefined,
      githubRepoId: serializeGithubRepoId(repo.githubRepoId),
      stargazers_count: repo.stars,
      forks_count: repo.forks,
      status: getRepoStatus(repo),
    }));

    return NextResponse.json({ repos: reposWithStatus });
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
