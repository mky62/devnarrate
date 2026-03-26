import Image from "next/image";
import DashBg from "@/public/dashbg.jpg";
import PublicProfileSection from "./components/PublicProfileSection";
import PublicPostSection from "./components/PublicPostSection";
import PublicRepoList from "./components/PublicRepoList";

interface PublicDashboardPageProps {
  params: Promise<{ stageName: string }>;
}

export default async function PublicDashboardPage({
  params,
}: PublicDashboardPageProps) {
  const { stageName } = await params;

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
            <PublicProfileSection stageName={stageName} />
          </div>
        </div>

        {/* Posts */}
        <div className="w-2/4 h-full flex flex-col">
          <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <PublicPostSection stageName={stageName} />
          </div>
        </div>

        {/* Repositories */}
        <div className="w-1/4 h-full flex flex-col">
          <div className="flex-1 bg-white/80 backdrop-blur-sm border border-blue-500 rounded-2xl p-2 shadow-sm flex flex-col gap-3 overflow-hidden">
            <PublicRepoList stageName={stageName} />
          </div>
        </div>
      </div>
    </div>
  );
}
