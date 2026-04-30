import Image from "next/image";
import DashBg from "@/public/dashbg.jpg";
import PublicProfileSection from "./components/PublicProfileSection";
import PublicPostSection from "./components/PublicPostSection";
import PublicRepoList from "./components/PublicRepoList";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { serializePostSummaries } from "@/lib/posts";
import type { PublicUser } from "./components/PublicProfileSection";
import type { PublicRepo } from "./components/PublicRepoList";

interface PublicDashboardPageProps {
  params: Promise<{ stageName: string }>;
}

export default async function PublicDashboardPage({
  params,
}: PublicDashboardPageProps) {
  const { stageName } = await params;
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const viewerId = session?.user?.id;

  const user = await db.user.findUnique({
    where: { stageName },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      stageName: true,
      description: true,
      socialLinks: true,
      contributionUrl: true,
    },
  });

  const [rawPosts, repos] = user
    ? await Promise.all([
        db.post.findMany({
          where: { userId: user.id },
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
        db.repo.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: {
            githubRepoId: true,
            name: true,
            language: true,
            stars: true,
            forks: true,
          },
          take: 20,
        }),
      ])
    : [[], []];

  const initialUser: PublicUser | null = user
    ? {
        ...user,
        createdAt: user.createdAt.toISOString(),
        socialLinks: user.socialLinks as PublicUser["socialLinks"],
      }
    : null;
  const initialPosts = await serializePostSummaries(rawPosts, viewerId);
  const initialRepos: PublicRepo[] = repos.map((repo) => ({
    githubRepoId: repo.githubRepoId,
    name: repo.name,
    language: repo.language,
    stargazers_count: repo.stars,
    forks_count: repo.forks,
    description: null,
  }));

  return (
    <div className="h-full w-full flex">
      <Image
        src={DashBg}
        alt="dashboard-bg"
        className="absolute inset-0 z-[-1] w-full h-full object-cover"
      />

      <div className="relative flex gap-2 h-screen w-full p-4">
        {/* Profile */}
        <div className="w-1/4 h-full flex flex-col">
          <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <PublicProfileSection stageName={stageName} user={initialUser} />
          </div>
        </div>

        {/* Posts */}
        <div className="w-2/4 h-full flex flex-col">
          <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <PublicPostSection posts={initialPosts} />
          </div>
        </div>

        {/* Repositories */}
        <div className="w-1/4 h-full flex flex-col">
          <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <PublicRepoList repos={initialRepos} />
          </div>
        </div>
      </div>
    </div>
  );
}
