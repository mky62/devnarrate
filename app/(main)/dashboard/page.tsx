import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashBg from "@/public/dashbg.jpg";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { serializePostSummaries } from "@/lib/posts";
import { db } from "@/lib/prisma";
import { getGitStatsForUser } from "@/lib/github-stats";
import { serializeGithubRepoId } from "@/lib/github-repo-id";
import ProfileSection from "./components/ProfileSection";
import RepoList from "./components/RepoList";
import DeleteProfile from "./components/DeleteProfile";
import PostSection from "./components/PostSection";
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
    <div className="h-full w-full flex">
      <Image
        src={DashBg}
        alt="dashboard-bg"
        className="absolute inset-0 z-[-1] w-full h-full object-cover"
      />

      <div className="relative flex gap-2 min-h-screen w-full p-4">
        <div className="w-1/4 h-full flex flex-col">
          <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <ProfileSection user={user as UserData} initialGitStats={initialGitStats} />
            <DeleteProfile />
          </div>
        </div>

        <div className="w-2/4 h-full flex flex-col">
          <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <PostSection initialPosts={initialPosts} />
          </div>
        </div>

        <div className="w-1/4 h-full flex flex-col">
          <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <RepoList
              initialSavedRepos={repos.map((repo) => ({
                githubRepoId: serializeGithubRepoId(repo.githubRepoId),
                name: repo.name,
                language: repo.language,
                stars: repo.stars,
                forks: repo.forks,
                description: repo.description,
                accountId: repo.accountId,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
