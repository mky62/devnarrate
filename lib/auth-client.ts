import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  fetchOptions: {
    cache: "force-cache",
  },
});

export const { signIn, signOut, useSession } = authClient

// auth-client.ts
export type Session = typeof authClient.$Infer.Session;