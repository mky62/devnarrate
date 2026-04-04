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
  emailVerified: boolean;
  image?: string | null;
  createdAt?: string;
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
