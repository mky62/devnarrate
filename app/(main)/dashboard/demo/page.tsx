"use client";

import ProfileSection from "../components/ProfileSection";
import DeleteProfile from "../components/DeleteProfile";
import PostSection from "../components/PostSection";
import KnowledgeBase from "../components/KnowledgeBase";
import TrendingStories from "../components/TrendingStories";
import RepoList from "../components/RepoList";
import { Particles } from "@/components/ui/particles";

const demoUser = {
  id: "demo-user-id",
  name: "demodev",
  stageName: "demodev",
  email: "demo@devnarrate.com",
  image: null,
  description: "Demo Developer - Building awesome projects and sharing knowledge with the community.",
  socialLinks: {
    github: "https://github.com/demodev",
    twitter: "https://twitter.com/demodev",
    linkedin: "https://linkedin.com/in/demodev",
  },
  contributionUrl: null,
  createdAt: new Date("2024-01-15"),
  emailVerified: true,
};

const demoPosts = [
  {
    id: "1",
    title: "Getting Started with TypeScript",
    content: JSON.stringify({
      content: [
        { type: "text", text: "TypeScript is a powerful superset of JavaScript that adds static typing. This guide covers the basics..." }
      ]
    }),
    projectLink: "https://github.com/demodev/typescript-starter",
    createdAt: "2024-03-15T00:00:00.000Z",
    likeCount: 42,
    likedByViewer: false,
    canLike: true,
  },
  {
    id: "2",
    title: "Building Scalable APIs with Node.js",
    content: JSON.stringify({
      content: [
        { type: "text", text: "Learn how to build production-ready APIs using Node.js, Express, and best practices for scalability..." }
      ]
    }),
    projectLink: "https://github.com/demodev/api-starter",
    createdAt: "2024-03-10T00:00:00.000Z",
    likeCount: 28,
    likedByViewer: false,
    canLike: true,
  },
  {
    id: "3",
    title: "React Best Practices for 2024",
    content: JSON.stringify({
      content: [
        { type: "text", text: "Discover the latest React patterns, hooks, and architectural patterns for modern applications..." }
      ]
    }),
    projectLink: "https://github.com/demodev/react-boilerplate",
    createdAt: "2024-03-05T00:00:00.000Z",
    likeCount: 56,
    likedByViewer: false,
    canLike: true,
  },
];

const demoRepos = [
  {
    githubRepoId: 123456789,
    name: "awesome-project",
    description: "A comprehensive project template with best practices",
    language: "TypeScript",
    stars: 1234,
    forks: 234,
    accountId: "demo-account",
    status: "pending" as const,
    latestCommitSha: "abc123",
    indexedCommitSha: null,
  },
  {
    githubRepoId: 987654321,
    name: "cool-library",
    description: "A lightweight utility library for everyday tasks",
    language: "JavaScript",
    stars: 567,
    forks: 89,
    accountId: "demo-account",
    status: "pending" as const,
    latestCommitSha: "def456",
    indexedCommitSha: null,
  },
  {
    githubRepoId: 456789123,
    name: "react-components",
    description: "Reusable React component library",
    language: "TypeScript",
    stars: 89,
    forks: 12,
    accountId: "demo-account",
    status: "pending" as const,
    latestCommitSha: "ghi789",
    indexedCommitSha: null,
  },
];

export default function DemoDashboardPage() {
  return (
    <div className="h-full w-full flex min-h-screen bg-gradient-to-br from-[#1946BD] via-[#2B5AC0] to-[#D5824A] relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30 -z-20" />
      <Particles className="absolute inset-0 -z-10" />

      <div className="relative flex gap-3 min-h-screen w-full p-2 z-10">
        {/* Left Sidebar - Profile */}
        <div className="w-1/4 h-full flex flex-col overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <ProfileSection user={demoUser} initialGitStats={null} />
            <DeleteProfile />
          </div>
        </div>

        {/* Center Column - Posts + Knowledge Base */}
        <div className="w-2/4 h-full flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <PostSection initialPosts={demoPosts} />
          </div>
          <div className="h-1/3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <KnowledgeBase />
          </div>
        </div>

        {/* Right Column - Repos + Trending Stories */}
        <div className="w-1/4 h-full flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <RepoList initialSavedRepos={demoRepos} />
          </div>
          <div className="h-1/3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-lg flex flex-col gap-2 overflow-hidden min-h-0">
            <TrendingStories />
          </div>
        </div>
      </div>
    </div>
  );
}
