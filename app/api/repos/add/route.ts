import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { repoSchema } from "@/lib/validation";
import { serializeGithubRepoId } from "@/lib/github-repo-id";
import { getRedisClient } from "@/lib/redis";
import { getRepoDetailsFromGithub } from "@/lib/github";

interface CachedGitHubRepo {
    id: number;
    name: string;
    description?: string | null;
    language?: string | null;
    stargazers_count?: number;
    forks_count?: number;
}

function isPrismaUniqueError(error: unknown) {
    return typeof error === "object"
        && error !== null
        && "code" in error
        && (error as { code?: string }).code === "P2002";
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validationResult = repoSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const requestHeaders = await headers();
        const session = await auth.api.getSession({
            headers: requestHeaders,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { githubRepoId } = validationResult.data;

        // Get user's GitHub account
        const account = await db.account.findFirst({
            where: { userId, providerId: "github" },
            select: { id: true },
        });

        if (!account) {
            return NextResponse.json({ error: "GitHub account not found" }, { status: 400 });
        }

        const tokenResponse = await auth.api.getAccessToken({
            headers: requestHeaders,
            body: {
                providerId: "github",
                userId,
            },
        });

        if (!tokenResponse?.accessToken) {
            return NextResponse.json(
                { error: "GitHub account not connected. Please reconnect GitHub and try again." },
                { status: 400 }
            );
        }

        const redis = await getRedisClient();
        
        const cachedRepos = await redis.get(`github:repos:${userId}`);

        if (!cachedRepos) {
            return NextResponse.json(
                { error: "Repository list expired. Open repository search again before adding." },
                { status: 400 }
            );
        }

        let githubRepos: CachedGitHubRepo[];
        try {
            githubRepos = JSON.parse(cachedRepos) as CachedGitHubRepo[];
        } catch {
            return NextResponse.json(
                { error: "Repository list expired. Open repository search again before adding." },
                { status: 400 }
            );
        }

        const githubRepo = githubRepos.find((repo) => BigInt(repo.id) === githubRepoId);

        if (!githubRepo) {
            return NextResponse.json(
                { error: "Repository list expired. Open repository search again before adding." },
                { status: 400 }
            );
        }

        // Prevent duplicates
        const existingRepo = await db.repo.findFirst({
            where: { githubRepoId, userId },
        });

        if (existingRepo) {
            return NextResponse.json({ error: "Repository already saved" }, { status: 409 });
        }

        const repoDetails = await getRepoDetailsFromGithub({
            repoId: serializeGithubRepoId(githubRepoId),
            accessToken: tokenResponse.accessToken,
        });

        // Create the repo
        const repo = await db.repo.create({
            data: {
                githubRepoId,
                name: repoDetails.name ?? githubRepo.name,
                description: repoDetails.description ?? githubRepo.description ?? null,
                language: repoDetails.language ?? githubRepo.language ?? null,
                stars: repoDetails.stars ?? githubRepo.stargazers_count ?? 0,
                forks: repoDetails.forks ?? githubRepo.forks_count ?? 0,
                latestCommitSha: repoDetails.latestCommitSha,
                userId,
                accountId: account.id,
            },
        });

        return NextResponse.json({
            repo: {
                id: repo.id,
                userId: repo.userId,
                accountId: repo.accountId,
                githubRepoId: serializeGithubRepoId(repo.githubRepoId),
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stars,
                forks: repo.forks,
                latestCommitSha: repo.latestCommitSha,
                indexedCommitSha: repo.indexedCommitSha,
                status: "not_indexed",
                createdAt: repo.createdAt,
                updatedAt: repo.updatedAt,
            },
        }, { status: 201 });
    } catch (error) {
        if (isPrismaUniqueError(error)) {
            return NextResponse.json({ error: "Repository already saved" }, { status: 409 });
        }

        console.error("Add repo error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
