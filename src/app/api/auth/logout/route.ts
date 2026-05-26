import { NextRequest, NextResponse } from "next/server";
import { getLogoutCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });
  
  response.headers.set("Set-Cookie", getLogoutCookie());
  return response;
}
