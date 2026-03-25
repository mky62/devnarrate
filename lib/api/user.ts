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
