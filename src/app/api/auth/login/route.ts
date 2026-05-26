import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

// Mock users for fallback in case DB is not connected
const MOCK_USERS = [
  {
    id: "mock-superadmin-id",
    email: "superadmin@primeproperty.com",
    nama: "Super Admin Prime (Fallback)",
    passwordHash: "$2b$10$CF037y3xwCryd35R6kpvWOHTedCKjiTsY4D/n1hiHLpMPBfPnhdsK", // Superadmin123!
    role: "SUPERADMIN" as const,
  },
  {
    id: "mock-admin-id",
    email: "admin@primeproperty.com",
    nama: "Agent Admin (Fallback)",
    passwordHash: "$2b$10$oMynoNRfrx8QdUSa8AaLturV5vsJEchf0ym6YNyS/ge9oXAwyxhxW", // Admin123!
    role: "ADMIN" as const,
  },
];

// Simple in-memory lockout tracker for mock users fallback
const mockLockoutTracker = new Map<string, { attempts: number; lockedUntil: number; lastAttemptAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";

    // Rate limit check: max 10 requests per minute for auth
    const rateLimit = checkRateLimit(ip, "auth", 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Terlalu banyak permintaan",
          message: "Batas percobaan login terlampaui. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", message: "Email dan password wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    let user = null;
    let isDbConnected = true;

    try {
      // 1. Fetch user from DB
      user = await db.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      console.warn("Koneksi database gagal pada login API, menggunakan fallback mock users.", dbErrorMsg);
      isDbConnected = false;
      // Fallback check
      const mockMatch = MOCK_USERS.find((u) => u.email === email);
      if (mockMatch) {
        user = {
          id: mockMatch.id,
          email: mockMatch.email,
          nama: mockMatch.nama,
          password: mockMatch.passwordHash,
          role: mockMatch.role,
          status: "ACTIVE",
          failed_login_attempts: 0,
          lockout_until: null,
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Autentikasi gagal", message: "Email atau password salah." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Akun dinonaktifkan", message: "Akun Anda telah dinonaktifkan oleh Superadmin." },
        { status: 403 }
      );
    }

    // 2. Lockout Check
    const now = new Date();
    
    if (isDbConnected) {
      if (user.lockout_until && new Date(user.lockout_until) > now) {
        const diffMs = new Date(user.lockout_until).getTime() - now.getTime();
        const diffMins = Math.ceil(diffMs / 60000);
        return NextResponse.json(
          {
            error: "Akun terkunci",
            message: `Akun Anda terkunci karena 5x gagal login. Silakan coba kembali dalam ${diffMins} menit.`,
          },
          { status: 423 }
        );
      }
    } else {
      // In-memory lockout check for fallback
      const tracker = mockLockoutTracker.get(email);
      if (tracker && tracker.lockedUntil > Date.now()) {
        const diffMs = tracker.lockedUntil - Date.now();
        const diffMins = Math.ceil(diffMs / 60000);
        return NextResponse.json(
          {
            error: "Akun terkunci",
            message: `Akun Anda terkunci karena 5x gagal login. Silakan coba kembali dalam ${diffMins} menit (Fallback).`,
          },
          { status: 423 }
        );
      }
    }

    // 3. Verify Password
    const passwordMatch = isDbConnected 
      ? await comparePassword(password, user.password)
      : await comparePassword(password, user.password); // Both use bcrypt hashes

    if (!passwordMatch) {
      if (isDbConnected) {
        // Handle database lockout increment within 30-minute window
        const lastAttemptTime = new Date(user.updated_at || new Date()).getTime();
        const timeSinceLastAttempt = Date.now() - lastAttemptTime;
        
        let attempts = user.failed_login_attempts;
        if (attempts > 0 && timeSinceLastAttempt > 30 * 60 * 1000) {
          attempts = 1;
        } else {
          attempts += 1;
        }

        let lockout_until = null;
        let message = `Email atau password salah. Sisa percobaan: ${Math.max(0, 5 - attempts)}`;

        if (attempts >= 5) {
          lockout_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
          message = "Akun Anda terkunci selama 15 menit karena 5 kali berturut-turut gagal login.";
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            failed_login_attempts: attempts,
            lockout_until,
          },
        });

        return NextResponse.json({ error: "Autentikasi gagal", message }, { status: attempts >= 5 ? 423 : 401 });
      } else {
        // Handle in-memory lockout increment within 30-minute window
        const tracker = mockLockoutTracker.get(email) || { attempts: 0, lockedUntil: 0, lastAttemptAt: 0 };
        const nowMs = Date.now();
        const timeSinceLastAttempt = nowMs - tracker.lastAttemptAt;

        if (tracker.attempts > 0 && timeSinceLastAttempt > 30 * 60 * 1000) {
          tracker.attempts = 1;
        } else {
          tracker.attempts += 1;
        }
        tracker.lastAttemptAt = nowMs;

        let message = `Email atau password salah. Sisa percobaan: ${Math.max(0, 5 - tracker.attempts)}`;

        if (tracker.attempts >= 5) {
          tracker.lockedUntil = Date.now() + 15 * 60 * 1000;
          message = "Akun Anda terkunci selama 15 menit karena 5 kali berturut-turut gagal login.";
        }
        mockLockoutTracker.set(email, tracker);
        
        return NextResponse.json({ error: "Autentikasi gagal", message }, { status: tracker.attempts >= 5 ? 423 : 401 });
      }
    }

    // 4. Successful login
    if (isDbConnected) {
      await db.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: 0,
          lockout_until: null,
        },
      });
    } else {
      mockLockoutTracker.delete(email);
    }

    // 5. Generate token and return cookie response
    const token = signToken({
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role as "ADMIN" | "SUPERADMIN",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil, mengalihkan...",
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
      },
    });

    // Set token as HttpOnly cookie
    response.headers.set("Set-Cookie", setAuthCookie(token));

    return response;
  } catch (error) {
    console.error("Kesalahan API Login:", error);
    return NextResponse.json(
      { error: "Kesalahan server internal", message: "Terjadi kesalahan saat memproses login Anda." },
      { status: 500 }
    );
  }
}
