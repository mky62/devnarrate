import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import db from "@/lib/prisma"

const parseEnvList = (value?: string) =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? []

const normalizeUrl = (value?: string) => {
  if (!value) return undefined

  const cleaned = value.split("#")[0]?.trim()
  if (!cleaned) return undefined

  return cleaned.startsWith("http://") || cleaned.startsWith("https://")
    ? cleaned
    : `https://${cleaned}`
}

const toHost = (value?: string) => {
  const normalized = normalizeUrl(value)
  if (!normalized) return undefined

  try {
    return new URL(normalized).host
  } catch {
    return undefined
  }
}

const normalizedBetterAuthUrl = normalizeUrl(process.env.BETTER_AUTH_URL)
const vercelDeploymentUrl =
  normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeUrl(process.env.VERCEL_URL) ??
  "https://devnarrate.vercel.app"

const normalizedBaseUrl =
  process.env.NODE_ENV === "production"
    ? vercelDeploymentUrl ?? normalizedBetterAuthUrl
    : normalizedBetterAuthUrl ?? vercelDeploymentUrl

const defaultAllowedHosts = [
  "devnarrate.vercel.app",
]

const allowedHosts = Array.from(
  new Set(
    [
      ...defaultAllowedHosts,
      ...parseEnvList(process.env.BETTER_AUTH_ALLOWED_HOSTS),
      toHost(normalizedBetterAuthUrl),
      toHost(process.env.NEXT_PUBLIC_AUTH_URL),
      toHost(process.env.VERCEL_PROJECT_PRODUCTION_URL),
      toHost(process.env.VERCEL_URL),
    ].filter(Boolean) as string[]
  )
)

const trustedOrigins = Array.from(
  new Set([
    ...parseEnvList(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
    ...allowedHosts.flatMap((host) =>
      host.includes("://")
        ? [host]
        : [
            `https://${host}`,
            ...(host.includes("localhost") || host.includes("127.0.0.1") ? [`http://${host}`] : []),
          ]
    ),
    ...(normalizedBaseUrl ? [new URL(normalizedBaseUrl).origin] : []),
  ])
)

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
  },

  account: {
    encryptOAuthTokens: true,
  },

  trustedOrigins,

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          name: `@${profile.login}`,
        };
      },
    },
  },

  baseURL: {
    fallback: normalizedBaseUrl,
    allowedHosts,
  },

  // Optional: Configure session settings
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  plugins: [nextCookies()],

});

export type Session = typeof auth.$Infer.Session;
