import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { repoSchema } from "@/lib/validation";
import { serializeGithubRepoId } from "@/lib/github-repo-id";
import { getRepoDetailsFromGithub, type RepoDetails } from "@/lib/github";

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

        let githubRepo: RepoDetails;
        try {
            githubRepo = await getRepoDetailsFromGithub({
                repoId: String(githubRepoId),
                accessToken: tokenResponse.accessToken,
            });
        } catch {
            return NextResponse.json(
                { error: "Repository is not accessible with the connected GitHub account" },
                { status: 403 }
            );
        }

        // Prevent duplicates
        const existingRepo = await db.repo.findFirst({
            where: { githubRepoId, userId },
        });

        if (existingRepo) {
            return NextResponse.json({ error: "Repository already saved" }, { status: 409 });
        }

        // Create the repo
        const repo = await db.repo.create({
            data: {
                githubRepoId: BigInt(githubRepo.id),
                name: githubRepo.name,
                description: githubRepo.description,
                language: githubRepo.language,
                stars: githubRepo.stars,
                forks: githubRepo.forks,
                userId,
                accountId: account.id,
            },
        });

        return NextResponse.json({
            repo: {
                ...repo,
                githubRepoId: serializeGithubRepoId(repo.githubRepoId),
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Add repo error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
