import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(
            MAX_PAGE_SIZE,
            Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10))
        );
        const skip = (page - 1) * limit;

        const [repos, total] = await Promise.all([
            db.repo.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
                select: {
                    githubRepoId: true,
                    name: true,
                    language: true,
                    stars: true,
                    forks: true,
                    description: true,
                },
                skip,
                take: limit,
            }),
            db.repo.count({ where: { userId: session.user.id } }),
        ]);

        return NextResponse.json({
            repos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Get repos error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
