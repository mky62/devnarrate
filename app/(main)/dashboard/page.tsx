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

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        redirect("/sign-up");
    }

    // Fetch saved repos from database
    const savedReposFromDb = await db.repo.findMany({
        where: { userId: session.user.id },
        select: {
            githubRepoId: true,
            name: true,
            language: true,
            stars: true,
            forks: true,
        },
        orderBy: { createdAt: "desc" },
    });

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

            <div className="relative flex gap-2 h-screen w-full p-4">
                {/* Profile */}
                <div className="w-1/4 h-full flex flex-col">
                    <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
                        <ProfileSection />
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