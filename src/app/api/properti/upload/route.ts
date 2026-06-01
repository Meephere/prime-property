import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authentication & Authorization (Hanya Superadmin atau Admin)
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (user.role !== "SUPERADMIN" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden", message: "Akses ditolak." },
        { status: 403 }
      );
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Bad Request", message: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    // Validate file type (hanya gambar)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Bad Request", message: "File harus berupa gambar (JPEG, PNG, WEBP, dll)." },
        { status: 400 }
      );
    }

    // 3. Process File Upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split(".").pop() || "jpg";
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from("property-images")
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      console.error("Gagal mengunggah ke Supabase Storage:", error);
      return NextResponse.json(
        { error: "Internal Server Error", message: "Gagal menyimpan gambar di storage." },
        { status: 500 }
      );
    }

    // 4. Get Public URL
    const { data: urlData } = supabase.storage
      .from("property-images")
      .getPublicUrl(uniqueFileName);

    return NextResponse.json({
      success: true,
      message: "Gambar berhasil diunggah.",
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Kesalahan API Upload:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Kesalahan server internal." },
      { status: 500 }
    );
  }
}
