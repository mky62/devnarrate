import { Particles } from "@/components/ui/particles";
import PublicProfileSection from "./components/PublicProfileSection";
import PublicPostSection from "./components/PublicPostSection";
import PublicRepoList from "./components/PublicRepoList";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { serializePostSummaries } from "@/lib/posts";
import { serializeGithubRepoId } from "@/lib/github-repo-id";
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
    githubRepoId: serializeGithubRepoId(repo.githubRepoId),
    name: repo.name,
    language: repo.language,
    stargazers_count: repo.stars,
    forks_count: repo.forks,
    description: null,
  }));

  return (
    <div className="h-full w-full flex min-h-screen bg-gradient-to-br from-[#1946BD] via-[#2B5AC0] to-[#D5824A] relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30 -z-20" />
      <Particles className="absolute inset-0 -z-10" />

      <div className="relative flex gap-3 min-h-screen w-full p-2 z-10">
        {/* Profile */}
        <div className="w-1/4 h-full flex flex-col overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <PublicProfileSection stageName={stageName} user={initialUser} />
          </div>
        </div>

        {/* Posts */}
        <div className="w-2/4 h-full flex flex-col overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <PublicPostSection posts={initialPosts} />
          </div>
        </div>

        {/* Repositories */}
        <div className="w-1/4 h-full flex flex-col overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <PublicRepoList repos={initialRepos} />
          </div>
        </div>
      </div>
    </div>
  );
}
