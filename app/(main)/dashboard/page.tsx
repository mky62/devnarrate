import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { serializePostSummaries } from "@/lib/posts";
import { db } from "@/lib/prisma";
import { getGitStatsForUser } from "@/lib/github-stats";
import { serializeGithubRepoId } from "@/lib/github-repo-id";
import { getRepoStatus } from "@/lib/repo-status";
import ProfileSection from "./components/ProfileSection";
import RepoList from "./components/RepoList";
import DeleteProfile from "./components/DeleteProfile";
import PostSection from "./components/PostSection";
import TopStories from "./components/TopStories";
import ConnectNodes from "./components/ConnectNodes";
import type { Post } from "@/lib/userdata";

interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
}

interface UserData {
  id: string;
  name: string;
  email?: string | null;
  image?: string | null;
  createdAt: Date;
  stageName?: string | null;
  description?: string | null;
  socialLinks?: SocialLinks | null;
  contributionUrl?: string | null;
}

export default async function DashboardPage() {
  // TEMP: Skip auth - use first user from DB
  const requestHeaders = await headers();
  
  // Get first user from DB as dummy
  const dummyUser = await db.user.findFirst();
  const userId = dummyUser?.id || "cm5x1234567890abcdef";

  const [user, repos, rawPosts, initialGitStats] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        stageName: true,
        description: true,
        socialLinks: true,
        contributionUrl: true,
      },
    }),
    db.repo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        githubRepoId: true,
        name: true,
        language: true,
        stars: true,
        forks: true,
        description: true,
        accountId: true,
        indexStatus: true,
        indexNamespace: true,
        latestCommitSha: true,
        indexedCommitSha: true,
      },
      take: 20,
    }),
    db.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        title: true,
        projectLink: true,
        content: true,
        createdAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      take: 20,
    }),
    getGitStatsForUser({
      userId,
      username: "demo",
      cacheKey: `github:stats:${userId}`,
      requestHeaders,
    }),
  ]);

  if (!user) {
    redirect("/sign-in");
  }

  const initialPosts: Post[] = await serializePostSummaries(rawPosts, userId, {
    readOnly: true,
  });

  return (
    <main className="h-screen bg-gradient-to-br from-[#1946BD] via-[#2B5AC0] to-[#D5824A] overflow-hidden">
      <div className="h-full p-2 sm:p-3">
        <div className="max-w-[1600px] mx-auto h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 h-full">
            <div className="md:col-span-1 xl:col-span-1 h-full">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-lg shadow-[#1946BD]/20 h-full overflow-hidden">
                <ProfileSection user={user as UserData} initialGitStats={initialGitStats} />
              </div>
            </div>

            <div className="md:col-span-2 xl:col-span-2 h-full flex flex-col gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-lg shadow-[#1946BD]/20 flex-1 overflow-hidden">
                <PostSection initialPosts={initialPosts} />
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-lg shadow-[#1946BD]/20 flex-1 overflow-hidden">
                <ConnectNodes />
              </div>
            </div>

            <div className="md:col-span-1 xl:col-span-1 h-full flex flex-col gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-lg shadow-[#1946BD]/20 flex-1 overflow-hidden">
                <RepoList
                  initialSavedRepos={repos.map((repo) => ({
                    githubRepoId: repo.githubRepoId,
                    name: repo.name,
                    language: repo.language,
                    stars: repo.stars,
                    forks: repo.forks,
                    description: repo.description,
                    accountId: repo.accountId,
                    status: getRepoStatus(repo),
                    latestCommitSha: repo.latestCommitSha,
                    indexedCommitSha: repo.indexedCommitSha,
                  }))}
                />
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-lg shadow-[#1946BD]/20 flex-1 overflow-hidden">
                <TopStories />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
