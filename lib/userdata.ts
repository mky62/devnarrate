// API layer for user operations

export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: string | Date;
  stageName?: string | null;
  description?: string | null;
  socialLinks?: SocialLinks | null;
}

export async function getCurrentUser(): Promise<User> {
  const res = await fetch("/api/user/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export interface UpdateProfilePayload {
  stageName?: string | null;
  description?: string | null;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<User> {
  const res = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile");

  return data.user;
}

// Post API
export interface Post {
  id: string;
  title: string;
  projectLink: string | null;
  content: string;
  createdAt: string;
  likeCount: number;
  likedByViewer: boolean;
  canLike: boolean;
  reviewStatus: string;
  visibility: string;
  deletionScheduledFor: string | null;
  latestFlaggedContent: string[];
  latestReviewSummary: string | null;
  latestWritingFeedback: {
    summary: string;
    suggestions: string[];
  } | null;
}

export async function getPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  const data = await res.json();
  return data.posts ?? [];
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete post");
  }
}

export interface UpdatePostPayload {
  title: string;
  link?: string;
  content: unknown;
}

export async function updatePost(id: string, payload: UpdatePostPayload): Promise<{ postId: string }> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Failed to update post");
  }

  return data;
}

export interface InboxMessage {
  id: string;
  postId: string | null;
  type: string;
  title: string;
  body: string;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export async function getInbox(): Promise<InboxMessage[]> {
  const res = await fetch("/api/inbox");
  if (!res.ok) throw new Error("Failed to fetch inbox");
  const data = await res.json();
  return data.messages ?? [];
}

export async function updateInboxMessage(
  id: string,
  payload: { status: string }
): Promise<InboxMessage> {
  const res = await fetch(`/api/inbox/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update inbox message");
  return data.message;
}

// Repo API
export interface Repo {
  githubRepoId: number;
  name: string | null;
  language: string | null;
  stars: number;
  forks: number;
  description: string | null;
}

export async function getRepos(): Promise<Repo[]> {
  const res = await fetch("/api/repos");
  if (!res.ok) throw new Error("Failed to fetch repos");
  const data = await res.json();
  return data.repos ?? [];
}

export interface AddRepoPayload {
  githubRepoId: number;
  name: string;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
}

export async function addRepo(payload: AddRepoPayload): Promise<{ repo: Repo }> {
  const res = await fetch("/api/repos/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add repo");
  return data;
}

export async function deleteRepo(githubRepoId: number): Promise<void> {
  const res = await fetch("/api/repos/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ githubRepoId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete repo");
  }
}
