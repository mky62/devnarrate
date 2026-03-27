import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function DELETE(request: Request) {
    try {
        const { githubRepoId } = await request.json();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!githubRepoId) {
            return NextResponse.json({ error: "githubRepoId is required" }, { status: 400 });
        }
        const repo = await db.repo.findFirst({
            where: {
                githubRepoId,
                userId: session.user.id,
            },
        });

        if (!repo) {
            return NextResponse.json({ error: "Repository not found" }, { status: 404 });
        }

        await db.repo.delete({
            where: { id: repo.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete repo error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}