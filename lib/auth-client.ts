import { createAuthClient } from "better-auth/react"

const getAuthBaseURL = () => {
  const baseURL = process.env.NEXT_PUBLIC_AUTH_URL;
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_AUTH_URL environment variable is not defined");
  }
  return baseURL;
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
});

export const { signIn, signOut, useSession } = authClient

// auth-client.ts
export type Session = typeof authClient.$Infer.Session;