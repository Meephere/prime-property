import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import db from "@/lib/db";
import { z } from "zod";

// Zod validation schema
const contactSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  nomor_hp: z.string().min(10, "Nomor HP minimal 10 digit").max(20, "Nomor HP maksimal 20 digit"),
  pesan: z.string().min(5, "Pesan minimal 5 karakter").max(1000, "Pesan maksimal 1000 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Get client IP address for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";

    // 2. Perform rate limit check: max 3 submits per hour (3600000 ms)
    const rateLimit = checkRateLimit(ip, "contact", 3, 3600000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Batas pengiriman terlampaui",
          message: "Anda telah mencapai batas pengiriman pesan (maksimal 3 kali per jam). Silakan coba lagi nanti.",
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate body
    const body = await req.json();
    const result = contactSchema.safeParse(body);
    
    if (!result.success) {
      const formattedErrors = result.error.format();
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: formattedErrors,
        },
        { status: 400 }
      );
    }

    const { nama, email, nomor_hp, pesan } = result.data;

    // 4. Save to database if connected
    try {
      await db.contactSubmission.create({
        data: {
          nama,
          email,
          nomor_hp,
          pesan,
          ip_address: ip,
        },
      });
      console.log(`[ContactSubmission] Pesan baru dari ${nama} (${email}) disimpan ke database.`);
    } catch (dbError) {
      // Graceful fallback if database connection is not active yet (e.g. during initial review)
      console.warn("Gagal menyimpan pesan kontak ke database (kemungkinan DB belum terhubung/migrasi):", dbError);
      console.log(`[ContactSubmission FALLBACK] Pesan dari ${nama} (${email}): ${pesan}`);
    }

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: "Pesan terkirim, tim kami akan menghubungi Anda.",
    });

  } catch (error) {
    console.error("Kesalahan API Kontak:", error);
    return NextResponse.json(
      {
        error: "Kesalahan server internal",
        message: "Terjadi kesalahan saat memproses pesan Anda. Silakan coba kembali.",
      },
      { status: 500 }
    );
  }
}
