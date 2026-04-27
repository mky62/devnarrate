import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { namespaceExists } from "@/lib/pinecone";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user's repos
    const repos = await db.repo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        githubRepoId: true,
        name: true,
        description: true,
        language: true,
        stars: true,
        forks: true,
        accountId: true,
      },
    });

    // Fetch index jobs for these repos
    const repoIds = repos.map(r => String(r.githubRepoId));
    const jobs = await db.repoIndexJob.findMany({
      where: {
        repoId: { in: repoIds },
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group jobs by repoId (get latest for each)
    const latestJobs = new Map<string, typeof jobs[0]>();
    for (const job of jobs) {
      if (!latestJobs.has(job.repoId)) {
        latestJobs.set(job.repoId, job);
      }
    }

    // Check Pinecone for indexed repos
    const reposWithStatus = await Promise.all(
      repos.map(async (repo) => {
        const repoId = String(repo.githubRepoId);
        const job = latestJobs.get(repoId);
        const hasVectors = await namespaceExists(`repo-${repoId}`);

        let status: 'not_indexed' | 'pending' | 'indexing' | 'completed' | 'failed';
        if (!job) {
          status = 'not_indexed';
        } else if (job.status === 'FAILED') {
          status = 'failed';
        } else if (hasVectors) {
          status = 'completed';
        } else if (job.status === 'INDEXING') {
          status = 'indexing';
        } else {
          status = 'pending';
        }

        return {
          ...repo,
          status,
          jobId: job?.id,
          lastIndexedAt: job?.updatedAt,
        };
      })
    );

    return NextResponse.json({ repos: reposWithStatus });
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
