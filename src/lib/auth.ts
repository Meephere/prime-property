import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "prime_property_secret_key_gold_luxury_2026";
const COOKIE_NAME = "auth_token";

import db from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export interface JWTPayload {
  id: string;
  email: string;
  nama: string;
  role: "ADMIN" | "SUPERADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getAuthToken(req: NextRequest): string | null {
  // Get from cookies
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  // Fallback to Authorization header
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  // 1. Coba token JWT kustom lama terlebih dahulu (backward compatibility)
  const token = getAuthToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) return payload;
  }

  // 2. Coba autentikasi via Clerk
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    // Cari user di database berdasarkan email
    const dbUser = await db.user.findUnique({
      where: { email },
    });

    if (!dbUser || dbUser.status !== "ACTIVE") {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      nama: dbUser.nama,
      role: dbUser.role as "ADMIN" | "SUPERADMIN",
    };
  } catch (error) {
    console.error("Kesalahan Clerk Auth di getUserFromRequest:", error);
    return null;
  }
}

export function setAuthCookie(token: string): string {
  // Create cookie header options: httpOnly, SameSite=Lax, Secure (if prod), path=/, max-age 30 days
  const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}; ${secure}`;
}

export function getLogoutCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; ${secure}`;
}
