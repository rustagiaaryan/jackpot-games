import { cookies } from "next/headers";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { secureToken } from "@/lib/random";
import type { User } from "@prisma/client";

const SESSION_COOKIE = "arcade_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function createAuthSession(userId: string): Promise<void> {
  const token = secureToken();
  await db.authSession.create({
    data: { token, userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function destroyAuthSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.authSession.deleteMany({ where: { token } });
    jar.delete(SESSION_COOKIE);
  }
}

/** Current logged-in user, or null. Banned users are treated as logged out for play. */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.authSession.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Please log in to continue.");
  if (user.banned) throw new AuthError("This account has been suspended.");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!user.isAdmin) throw new AuthError("Admin access required.");
  return user;
}

export class AuthError extends Error {}
