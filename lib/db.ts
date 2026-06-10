import { PrismaClient } from "@prisma/client";

// Prisma client singleton (avoids exhausting connections during dev hot-reload).
// PRODUCTION: when moving to Postgres, consider connection pooling (pgBouncer /
// Prisma Accelerate) — no code changes needed here beyond DATABASE_URL.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
