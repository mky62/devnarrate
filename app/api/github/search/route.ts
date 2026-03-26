import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";


interface GitHubRepo {
    id: number;
    name: string;
    description?: string | null;
    language?: string | null;
    stargazers_count?: number;
    forks_count?: number;
}


const getAllRepos = async (token: string): Promise<GitHubRepo[]> => {
    const allRepos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "devnarrate-App",
        },
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${res.status} - ${error.message || "Unknown error"}`);
    }

    const repos: GitHubRepo[] = await res.json();

    if (repos.length === 0) break;

    allRepos.push(...repos);
    page++;

    // Safety limit
    if (page > 50) break;
    }

  return allRepos;


}

export async function GET(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const account = await db.account.findFirst({
        where: { userId, providerId: "github" },
        select: { accessToken: true },
    });

    const token = account?.accessToken;
    if (!token) {
        return NextResponse.json({ error: "GitHub account not connected" }, { status: 400 });
    }

    const cacheKey = `github:repos:${userId}`;

    try{
        let repos: GitHubRepo[] = [];
        
        const redis = await getRedisClient();

        const cachedRepos = await redis.get(cacheKey);
        
        if (cachedRepos) {
            // hit cache
            repos = JSON.parse(cachedRepos);
        }

        else {
            repos = await getAllRepos(token);
             
            await redis.set(cacheKey, JSON.stringify(repos), { EX: 1800}) // 30 minutes
        }

        const filtered = repos
            .filter((repo) => repo.name.toLowerCase().includes(query.toLowerCase()))
            .map((repo) => ({
                githubRepoId: repo.id,           //
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
            }));

        return NextResponse.json({ repos: filtered });

    }

    catch (error) {
    console.error("GitHub search error:", error);

    if (error instanceof Error && error.message.includes("GitHub API")) {
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