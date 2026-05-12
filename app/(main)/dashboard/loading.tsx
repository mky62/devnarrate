import { Particles } from "@/components/ui/particles"

function ProfileSkeleton() {
  return (
    <div className="h-full rounded-2xl flex flex-col overflow-hidden border-white/10 border-2 bg-white/10 backdrop-blur-xl">
      <div className="relative w-full h-24 animate-pulse bg-white/5" />
      <div className="flex-1 p-4 space-y-3">
        <div className="h-5 bg-white/10 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
        <div className="h-2 bg-white/10 rounded animate-pulse w-2/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-6 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-6 w-6 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-6 w-6 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function PostSkeleton() {
  return (
    <div className="h-full rounded-2xl flex flex-col overflow-hidden border-white/10 border-2 bg-white/10 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-16 bg-white/10 rounded-lg animate-pulse" />
      </div>
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-5 h-5 bg-white/10 rounded-lg" />
                <div className="flex-1">
                  <div className="h-3 bg-white/10 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-white/10 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded w-full mb-1" />
              <div className="h-2 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RepoSkeleton() {
  return (
    <div className="h-full rounded-2xl flex flex-col overflow-hidden border-white/10 border-2 bg-white/10 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-10 bg-white/10 rounded-full animate-pulse" />
      </div>
      <div className="flex-1 p-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-3 py-2 flex items-center justify-between bg-white/5 rounded-lg mx-1 mb-2">
            <div className="flex-1">
              <div className="h-3 bg-white/10 rounded w-3/4 mb-1" />
              <div className="h-2 bg-white/10 rounded w-1/3" />
            </div>
            <div className="h-3 w-10 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function KnowledgeBaseSkeleton() {
  return (
    <div className="h-full rounded-2xl flex flex-col overflow-hidden border-white/10 border-2 bg-white/10 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-10 bg-white/10 rounded-lg animate-pulse" />
      </div>
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-10 h-10 bg-white/10 rounded-xl animate-pulse mb-3" />
          <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function TrendingStoriesSkeleton() {
  return (
    <div className="h-full rounded-2xl flex flex-col overflow-hidden border-white/10 border-2 bg-white/10 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="flex-1 p-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2.5 bg-white/5 rounded-lg animate-pulse">
            <div className="h-3 bg-white/10 rounded w-3/4 mb-1.5" />
            <div className="h-2 bg-white/10 rounded w-1/2 mb-1.5" />
            <div className="flex gap-3">
              <div className="h-2 w-10 bg-white/10 rounded" />
              <div className="h-2 w-10 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="h-full w-full flex min-h-screen bg-gradient-to-br from-[#1946BD] via-[#2B5AC0] to-[#D5824A] relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30 -z-20" />
      <Particles className="absolute inset-0 -z-10" />

      <div className="relative flex gap-3 min-h-screen w-full p-2 z-10">
        {/* Left Sidebar - Profile */}
        <div className="w-1/4 h-full flex flex-col">
          <ProfileSkeleton />
        </div>

        {/* Center Column - Posts + Knowledge Base */}
        <div className="w-2/4 h-full flex flex-col gap-2">
          <div className="flex-1">
            <PostSkeleton />
          </div>
          <div className="h-1/3">
            <KnowledgeBaseSkeleton />
          </div>
        </div>

        {/* Right Column - Repos + Trending Stories */}
        <div className="w-1/4 h-full flex flex-col gap-2">
          <div className="flex-1">
            <RepoSkeleton />
          </div>
          <div className="h-1/3">
            <TrendingStoriesSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
