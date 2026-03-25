import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

interface GitHubRepo {
    id: number;
    name: string;
    description?: string | null;
    language?: string | null;
    stargazers_count?: number;
    forks_count?: number;
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

    try {
        const res = await fetch("https://api.github.com/user/repos?per_page=100", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "devnarrate-App",
            },
        });

        if (!res.ok) {
            const error = await res.json();
            return NextResponse.json(
                { error: "GitHub API error", details: error },
                { status: res.status }
            );
        }

        const repos: GitHubRepo[] = await res.json();

        const filtered = repos
            .filter((repo) => repo.name.toLowerCase().includes(query.toLowerCase()))
            .map((repo) => ({
                githubRepoId: repo.id,           // ← THIS WAS THE BUG
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
            }));

        return NextResponse.json({ repos: filtered });
    } catch (error) {
        console.error("GitHub search error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}