import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashBg from "@/public/dashbg.jpg";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { serializePostSummaries } from "@/lib/posts";
import { serializeInboxMessages } from "@/lib/inbox";
import { db } from "@/lib/prisma";
import { getGitStatsForUser } from "@/lib/github-stats";
import ProfileSection from "./components/ProfileSection";
import RepoList from "./components/RepoList";
import DeleteProfile from "./components/DeleteProfile";
import PostSection from "./components/PostSection";
import type { Post } from "@/lib/userdata";
import type { InboxMessage } from "@/lib/userdata";
import InboxPanel from "./components/InboxPanel";

interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
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

  const [user, repos, rawPosts, inboxMessages, initialGitStats] = await Promise.all([
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
        reviewStatus: true,
        visibility: true,
        deletionScheduledFor: true,
        latestFlaggedContent: true,
        latestReviewSummary: true,
        latestWritingFeedback: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      take: 20,
    }),
    db.inboxMessage.findMany({
      where: { userId },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
      take: 10,
      select: {
        id: true,
        postId: true,
        type: true,
        title: true,
        body: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
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
  const initialInboxMessages: InboxMessage[] = serializeInboxMessages(inboxMessages);

  return (
    <div className="h-full w-full flex">
      <Image
        src={DashBg}
        alt="dashboard-bg"
        className="absolute inset-0 z-[-1] w-full h-full object-cover"
      />

      <div className="relative flex gap-2 min-h-screen w-full p-4">
        <div className="w-1/4 h-full flex flex-col gap-2">
          <div className="flex-1 min-h-0 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <ProfileSection user={user as UserData} initialGitStats={initialGitStats} />
          </div>
          <InboxPanel initialMessages={initialInboxMessages} />
          <DeleteProfile />
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
                githubRepoId: repo.githubRepoId,
                name: repo.name,
                language: repo.language,
                stargazers_count: repo.stars,
                forks_count: repo.forks,
                description: repo.description,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
