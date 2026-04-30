import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { parseGithubRepoId } from "@/lib/github-repo-id";



export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized"}, {status: 401})
        }

        let body: { repoId?: string | number; repoName?: string; accountId?: string | number };
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { repoId, repoName, accountId } = body;

        if (!repoId || typeof repoId !== 'string' && typeof repoId !== 'number') {
            return NextResponse.json({ error: "Missing or invalid repoId" }, { status: 400 });
        }

        if (!repoName || typeof repoName !== 'string' || repoName.trim().length === 0) {
            return NextResponse.json({ error: "Missing or invalid repoName" }, { status: 400 });
        }

        if (!accountId || (typeof accountId !== 'string' && typeof accountId !== 'number')) {
            return NextResponse.json({ error: "Missing or invalid accountId" }, { status: 400 });
        }

        const parsedRepoId = parseGithubRepoId(repoId);
        if (!parsedRepoId) {
            return NextResponse.json({ error: "Invalid repoId" }, { status: 400 });
        }

        const repo = await db.repo.findFirst({
            where: {
                githubRepoId: parsedRepoId,
                userId: session.user.id,
                accountId: String(accountId),
            },
            select: {
                id: true,
            },
        });

        if (!repo) {
            return NextResponse.json({ error: "Repository is not tracked" }, { status: 404 });
        }

        const job = await db.repoIndexJob.create({
            data: {
                repoId: String(repoId),
                userId: session.user.id,
                status: 'PENDING',
            },
        });

        await db.repo.updateMany({
            where: {
                githubRepoId: parsedRepoId,
                userId: session.user.id,
            },
            data: {
                indexStatus: "PENDING",
            },
        });

        await inngest.send({
            name: "repos/index",
            data: {
                jobId: job.id,
                repoId: String(repoId),
                userId: session.user.id,
                repoName: repoName,
                accountId: String(accountId),
            },
        });

        return NextResponse.json({
            success: true,
            jobId: job.id,
        })
    } catch (error) {
        console.error("Failed to start repo indexing:", error);
        return NextResponse.json(
            { error: "Failed to start indexing" },
            { status: 500 }
        );
    }
}
