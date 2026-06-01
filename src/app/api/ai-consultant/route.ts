import { NextRequest, NextResponse } from "next/server";
import { MultiAgentSystem } from "@/lib/agent-system";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Pesan wajib diisi." },
        { status: 400 }
      );
    }

    const result = await MultiAgentSystem.processUserQuery(message, history || []);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Kesalahan API AI Consultant:", error);
    return NextResponse.json(
      { error: "Kesalahan server internal" },
      { status: 500 }
    );
  }
}
