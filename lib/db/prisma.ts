import { PrismaClient } from "@/packages/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const db = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === "production" ? ["error", "warn"] : ["query", "error", "warn"],
  // Configure connection pool via connection_limit in DATABASE_URL
  // Example: postgresql://user:pass@host:port/db?connection_limit=20
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

export default db
