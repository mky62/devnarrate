import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import db from "@/lib/prisma"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql", // or "mysql", "sqlite"
  }),

  rateLimit: {
		enabled: true,
		window: 60, // 60 seconds
		max: 5, // 5 requests per window
	},

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      // Explicitly set the redirect URI if needed
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
       mapProfileToUser: (profile) => {
         console.log("GitHub profile:", profile); // check what fields are available
        return {
         name: `@${profile.login}`,
        };
      },
    },
  },

  // Important: Set the base URL
  baseURL: process.env.BETTER_AUTH_URL as string,

  // Optional: Configure session settings
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  plugins: [nextCookies()],

});

export type Session = typeof auth.$Infer.Session;