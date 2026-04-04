import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { repoSchema } from "@/lib/validation";

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

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { githubRepoId, name, language, stargazers_count, forks_count } = validationResult.data;
        // Get user's GitHub account
        const account = await db.account.findFirst({
            where: { userId, providerId: "github" },
            select: { id: true },
        });

        if (!account) {
            return NextResponse.json({ error: "GitHub account not found" }, { status: 400 });
        }

        // Prevent duplicates
        const existingRepo = await db.repo.findUnique({
            where: { githubRepoId },
        });

        if (existingRepo) {
            return NextResponse.json({ error: "Repository already saved" }, { status: 409 });
        }

        // Create the repo
        const repo = await db.repo.create({
            data: {
                githubRepoId,
                name,
                language: language || null,
                stars: stargazers_count ?? 0,
                forks: forks_count ?? 0,
                userId,
                accountId: account.id,
            },
        });

        return NextResponse.json({ repo }, { status: 201 });
    } catch (error) {
        console.error("Add repo error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}