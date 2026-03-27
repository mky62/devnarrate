import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import DashBg from '@/public/dashbg.jpg'
import Image from 'next/image'
import ProfileSection from "./components/ProfileSection";
import RepoList from "./components/RepoList";
import DeleteProfile from "./components/DeleteProfile";
import PostSection from "./components/PostSection";

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

function parseSocialLinks(value: unknown): SocialLinks | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const result: SocialLinks = {};
  if (typeof obj.github === "string") result.github = obj.github;
  if (typeof obj.twitter === "string") result.twitter = obj.twitter;
  if (typeof obj.linkedin === "string") result.linkedin = obj.linkedin;
  if (typeof obj.website === "string") result.website = obj.website;
  return Object.keys(result).length > 0 ? result : null;
}

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        redirect("/sign-up");
    }

    const [savedReposFromDb, userData] = await Promise.all([
        db.repo.findMany({
            where: { userId: session.user.id },
            select: {
                githubRepoId: true,
                name: true,
                language: true,
                stars: true,
                forks: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        db.user.findUnique({
            where: { id: session.user.id },
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
    ]);

    const user: UserData | null = userData ? {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
        createdAt: userData.createdAt,
        stageName: userData.stageName,
        description: userData.description,
        socialLinks: parseSocialLinks(userData.socialLinks),
    } : null;

    const initialSavedRepos = savedReposFromDb.map(repo => ({
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

            <div className="relative flex gap-2 min-h-screen w-full p-4">
                {/* Profile */}
                <div className="w-1/4 h-full flex flex-col">
                    <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
                        <ProfileSection user={user} />
                        <DeleteProfile />
                    </div>
                </div>

                {/* Posts */}
                <div className="w-2/4 h-full flex flex-col">
                    <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
                        <PostSection />
                    </div>
                </div>

                {/* Repositories */}
                <div className="w-1/4 h-full flex flex-col">
                    <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
                        <RepoList initialSavedRepos={initialSavedRepos} />
                    </div>
                </div>
            </div>
        </div>
    );
}
