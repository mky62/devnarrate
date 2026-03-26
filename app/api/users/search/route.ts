import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const users = await db.user.findMany({
      where: {
        OR: [
          { stageName: { contains: searchQuery, mode: "insensitive" } },
          { name: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
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
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedUsers = users.map((user) => ({
      stageName: user.stageName,
      name: user.name,
      avatarUrl: user.image,
      description: user.description,
      _count: { repos: user._count.repo },
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
