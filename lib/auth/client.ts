import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient

// auth-client.ts
export type Session = typeof authClient.$Infer.Session;