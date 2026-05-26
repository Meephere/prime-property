import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, hashPassword } from "@/lib/auth";
import { z } from "zod";

const createAdminSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter").max(50, "Nama maksimal 50 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Sandi minimal 8 karakter"),
});

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ 
        error: "Forbidden", 
        message: "Akses Ditolak. Hanya Superadmin yang diperbolehkan untuk mengelola admin." 
      }, { status: 403 });
    }

    const admins = await db.user.findMany({
      where: {
        role: "ADMIN",
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error("Kesalahan GET Admin:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ 
        error: "Forbidden", 
        message: "Akses Ditolak. Hanya Superadmin yang diperbolehkan untuk mengelola admin." 
      }, { status: 403 });
    }

    const body = await req.json();
    const result = createAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.format() },
        { status: 400 }
      );
    }

    const { nama, email, password } = result.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Conflict", message: "Email sudah terdaftar untuk pengguna lain." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Save user and write audit log in transaction
    const newAdmin = await db.$transaction(async (tx) => {
      const admin = await tx.user.create({
        data: {
          nama,
          email,
          password: passwordHash,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE_ADMIN",
          details: {
            adminId: admin.id,
            nama: admin.nama,
            email: admin.email,
          },
        },
      });

      return admin;
    });

    return NextResponse.json({
      success: true,
      message: `Akun admin '${newAdmin.nama}' berhasil dibuat.`,
      data: {
        id: newAdmin.id,
        nama: newAdmin.nama,
        email: newAdmin.email,
        role: newAdmin.role,
        status: newAdmin.status,
        created_at: newAdmin.created_at,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Kesalahan POST Admin:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
