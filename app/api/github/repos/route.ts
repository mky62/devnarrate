import { auth } from "@/lib/auth";
import { getRedisClient } from "@/lib/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface GitHubRepo {
    id: number;
    name: string;
    description?: string | null;
    language?: string | null;
    stargazers_count?: number;
    forks_count?: number;
}

const CACHE_TTL_SECONDS = 1800;

const isGitHubAuthError = (status: number, message?: string): boolean => {
    if (status === 401) {
        return true;
    }

    return Boolean(message && /bad credentials|requires authentication|unauthorized/i.test(message));
};

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
            const message = error.message || "Unknown error";
            const authError = isGitHubAuthError(res.status, message);

            throw new Error(
                authError
                    ? `GitHub auth error: ${res.status} - ${message}`
                    : `GitHub API error: ${res.status} - ${message}`
            );
        }

        const repos: GitHubRepo[] = await res.json();

        if (repos.length === 0) break;

        allRepos.push(...repos);
        page++;

        if (page > 50) break;
    }

    return allRepos;
};

const serializeRepo = (repo: GitHubRepo) => ({
    githubRepoId: repo.id,
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
});

export async function GET() {
    try {
        const requestHeaders = await headers();
        const session = await auth.api.getSession({
            headers: requestHeaders,
        });

        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const cacheKey = `github:repos:${userId}`;
        const redis = await getRedisClient();
        const cachedRepos = await redis.get(cacheKey);

        if (cachedRepos) {
            const repos = JSON.parse(cachedRepos) as GitHubRepo[];
            return NextResponse.json({ repos: repos.map(serializeRepo) });
        }

        const tokenResponse = await auth.api.getAccessToken({
            headers: requestHeaders,
            body: {
                providerId: "github",
                userId,
            },
        });

        const token = tokenResponse?.accessToken;
        if (!token) {
            return NextResponse.json(
                { error: "GitHub account not connected. Please reconnect GitHub and try again." },
                { status: 400 }
            );
        }

        const repos = await getAllRepos(token);
        await redis.set(cacheKey, JSON.stringify(repos), { EX: CACHE_TTL_SECONDS });

        return NextResponse.json({ repos: repos.map(serializeRepo) });
    } catch (error) {
        if (error instanceof Error && error.message.includes("GitHub auth error")) {
            return NextResponse.json(
                { error: "GitHub authentication expired. Please reconnect GitHub and try again.", repos: [] },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message.includes("GitHub API")) {
            console.error("GitHub repos error:", error);
            return NextResponse.json(
                { error: "GitHub API error", details: error.message },
                { status: 502 }
            );
        }

        console.error("GitHub repos error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
