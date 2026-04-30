import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { parseGithubRepoId } from "@/lib/github-repo-id";
import { deletePineconeNamespace } from "@/lib/pinecone";
import { getRepoNamespace } from "@/lib/repo-indexing";

export async function DELETE(request: Request) {
    try {
        const { githubRepoId } = await request.json();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsedGithubRepoId = parseGithubRepoId(githubRepoId);

        if (!parsedGithubRepoId) {
            return NextResponse.json({ error: "githubRepoId is required" }, { status: 400 });
        }

        const repo = await db.repo.findFirst({
            where: {
                githubRepoId: parsedGithubRepoId,
                userId: session.user.id,
            },
        });

        if (!repo) {
            return NextResponse.json({ error: "Repository not found" }, { status: 404 });
        }

        const baseNamespace = getRepoNamespace({
            userId: session.user.id,
            repoId: repo.githubRepoId,
        });
        const namespacesToDelete = new Set([
            baseNamespace,
            repo.indexNamespace,
        ].filter((namespace): namespace is string => Boolean(namespace)));

        for (const namespace of namespacesToDelete) {
            await deletePineconeNamespace(namespace);
        }

        await db.$transaction([
            db.repoIndexJob.deleteMany({
                where: {
                    repoId: String(repo.githubRepoId),
                    userId: session.user.id,
                },
            }),
            db.repo.delete({
                where: { id: repo.id },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete repo error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
