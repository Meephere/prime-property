import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";

const COOKIE_NAME = "auth_token";

interface DecodedToken {
  id: string;
  email: string;
  nama: string;
  role: "ADMIN" | "SUPERADMIN";
  exp: number;
}

function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64Url decode the payload (second part)
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payloadJson) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Global API Rate Limiting (100 req/minute/IP)
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimit = checkRateLimit(ip, "global", 100, 60000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Terlalu banyak permintaan",
          message: "Batas permintaan global terlampaui. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }
  }

  // 2. Protect internal agent routes
  if (pathname.startsWith("/agent/dashboard")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      // Redirect to login if token is missing
      const url = new URL("/agent/login", request.url);
      return NextResponse.redirect(url);
    }

    const payload = decodeToken(token);

    if (!payload) {
      // Redirect to login if token is invalid
      const response = NextResponse.redirect(new URL("/agent/login", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Check expiration (exp is in seconds)
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp < nowInSeconds) {
      // Redirect to login if token expired
      const response = NextResponse.redirect(new URL("/agent/login", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Pass role and email headers so downstream pages can know who is logged in
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-agent-id", payload.id);
    requestHeaders.set("x-agent-email", payload.email);
    requestHeaders.set("x-agent-role", payload.role);
    requestHeaders.set("x-agent-nama", payload.nama);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Redirect from /agent/login to /agent/dashboard if already logged in
  if (pathname === "/agent/login") {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = decodeToken(token);
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload && payload.exp > nowInSeconds) {
        return NextResponse.redirect(new URL("/agent/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Config to specify which paths middleware should run on
export const config = {
  matcher: ["/agent/dashboard/:path*", "/agent/login", "/api/:path*", "/__clerk/(.*)"],
};
