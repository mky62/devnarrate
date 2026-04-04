"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import DashBg from '@/public/dashbg.jpg'
import Image from 'next/image'
import { Loader } from 'lucide-react'
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

interface Repo {
  githubRepoId: number;
  name: string | null;
  language: string | null;
  stars: number;
  forks: number;
}

async function fetchUserData(): Promise<{ user: UserData | null; repos: Repo[] }> {
  const [userRes, reposRes] = await Promise.all([
    fetch("/api/user/me"),
    fetch("/api/repos"),
  ]);

  if (!userRes.ok) throw new Error("Failed to fetch user");
  if (!reposRes.ok) throw new Error("Failed to fetch repos");

  const user = await userRes.json();
  const reposData = await reposRes.json();

  return {
    user,
    repos: reposData.repos?.map((repo: { githubRepoId: string | number; name: string | null; language: string | null; stars: number; forks: number }) => ({
      githubRepoId: typeof repo.githubRepoId === 'string' ? parseInt(repo.githubRepoId, 10) : repo.githubRepoId,
      name: repo.name,
      language: repo.language,
      stargazers_count: repo.stars,
      forks_count: repo.forks,
      description: null,
    })) ?? [],
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const { data, isPending: dataPending } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchUserData,
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (!sessionPending && !session?.user?.id) {
      router.push("/sign-up");
    }
  }, [session, sessionPending, router]);

  if (sessionPending || dataPending || !data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <Image
          src={DashBg}
          alt="dashboard-bg"
          className="absolute inset-0 z-[-1] w-full h-full object-cover"
        />
        <Loader className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  const { user, repos } = data;

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
                        <RepoList initialSavedRepos={repos} />
                    </div>
                </div>
            </div>
        </div>
    );
}
