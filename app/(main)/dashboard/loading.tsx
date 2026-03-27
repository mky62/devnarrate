import DashBg from '@/public/dashbg.jpg'
import Image from 'next/image'

function ProfileSkeleton() {
  return (
    <div className="h-full rounded-xl flex flex-col overflow-hidden border-blue-500 border-2 bg-white/80 backdrop-blur-sm">
      <div className="relative w-full h-28 animate-pulse bg-gray-200" />
      <div className="flex-1 p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function PostSkeleton() {
  return (
    <div className="h-full rounded-xl flex flex-col overflow-hidden border-blue-500 border-2 bg-white/80 backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-7 h-7 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RepoSkeleton() {
  return (
    <div className="h-full rounded-xl flex flex-col overflow-hidden border-blue-500 border-2 bg-white/80 backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="flex-1 p-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between bg-gray-50 rounded-xl mx-1 mb-2">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="h-full w-full flex">
      <Image
        src={DashBg}
        alt="dashboard-bg"
        className="absolute inset-0 z-[-1] w-full h-full object-cover"
      />
      <div className="relative flex gap-2 min-h-screen w-full p-4">
        <div className="w-1/4 h-full flex flex-col">
          <ProfileSkeleton />
        </div>
        <div className="w-2/4 h-full flex flex-col">
          <PostSkeleton />
        </div>
        <div className="w-1/4 h-full flex flex-col">
          <RepoSkeleton />
        </div>
      </div>
    </div>
  )
}
