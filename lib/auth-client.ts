import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signOut, useSession } = authClient

// auth-client.ts
export type Session = typeof authClient.$Infer.Session;