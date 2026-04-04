import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { users: [] },
        { status: 400 }
      );
    }

    const searchQuery = query.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10))
    );
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { stageName: { contains: searchQuery, mode: "insensitive" as const } },
        { name: { contains: searchQuery, mode: "insensitive" as const } },
        { email: { contains: searchQuery, mode: "insensitive" as const } },
      ],
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          stageName: true,
          name: true,
          image: true,
          description: true,
          _count: {
            select: {
              repo: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => ({
      stageName: user.stageName,
      name: user.name,
      avatarUrl: user.image,
      description: user.description,
      _count: { repos: user._count.repo },
    }));

    return NextResponse.json({
      users: formattedUsers,
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
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
