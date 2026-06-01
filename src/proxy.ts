import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
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

const isProtectedRoute = createRouteMatcher([
  "/agent/dashboard(.*)",
]);

// Clerk middleware instance
const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Try to protect using Clerk first
    try {
      await auth.protect();
    } catch (clerkError) {
      // If Clerk protection fails, fall back to check the legacy custom JWT token in cookies
      const token = req.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        const payload = decodeToken(token);
        const nowInSeconds = Math.floor(Date.now() / 1000);
        if (payload && payload.exp > nowInSeconds) {
          // Legacy token is valid, allow the request to proceed and pass headers
          const requestHeaders = new Headers(req.headers);
          requestHeaders.set("x-agent-id", payload.id);
          requestHeaders.set("x-agent-email", payload.email);
          requestHeaders.set("x-agent-nama", payload.nama);
          requestHeaders.set("x-agent-role", payload.role);
          
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
      }
      
      // If both fail, redirect to login
      const url = new URL("/agent/login", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export function proxy(request: NextRequest, event: any) {
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

  // 2. Redirect from /agent/login to /agent/dashboard if already logged in (for legacy cookie)
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

  // 3. Delegate to Clerk middleware
  return clerk(request, event);
}

// Config to specify which paths proxy should run on
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
