import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { serializePostSummaries } from "@/lib/posts";
import { db } from "@/lib/prisma";
import { getGitStatsForUser } from "@/lib/github-stats";
import { serializeGithubRepoId } from "@/lib/github-repo-id";
import { getRepoStatus } from "@/lib/repo-status";
import ProfileSection from "./components/ProfileSection";
import RepoList from "./components/RepoList";
import DeleteProfile from "./components/DeleteProfile";
import PostSection from "./components/PostSection";
import KnowledgeBase from "./components/KnowledgeBase";
import TrendingStories from "./components/TrendingStories";
import { Particles } from "@/components/ui/particles";
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
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

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
      username: session.user.name?.replace("@", "") || "",
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
    <div className="h-full w-full flex min-h-screen bg-gradient-to-br from-[#1946BD] via-[#2B5AC0] to-[#D5824A] relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30 -z-20" />
      <Particles className="absolute inset-0 -z-10" />

      <div className="relative flex gap-3 min-h-screen w-full p-2 z-10">
        {/* Left Sidebar - Profile */}
        <div className="w-1/4 h-full flex flex-col overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <ProfileSection user={user as UserData} initialGitStats={initialGitStats} />
            <DeleteProfile />
          </div>
        </div>

        {/* Center Column - Posts + Knowledge Base */}
        <div className="w-2/4 h-full flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <PostSection initialPosts={initialPosts} />
          </div>
          <div className="h-1/3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <KnowledgeBase />
          </div>
        </div>

        {/* Right Column - Repos + Trending Stories */}
        <div className="w-1/4 h-full flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <RepoList
              initialSavedRepos={repos.map((repo) => ({
                githubRepoId: serializeGithubRepoId(repo.githubRepoId),
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
          <div className="h-1/3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <TrendingStories />
          </div>
        </div>
      </div>
    </div>
  );
}
