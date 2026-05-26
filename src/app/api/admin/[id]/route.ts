import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, hashPassword } from "@/lib/auth";
import { z } from "zod";

const patchAdminSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  password: z.string().min(8, "Sandi minimal 8 karakter").optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify Authentication & Authorization
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

    // Check if target user exists and is an ADMIN
    const targetUser = await db.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Not Found", message: "Akun admin tidak ditemukan." }, { status: 404 });
    }

    if (targetUser.role !== "ADMIN") {
      return NextResponse.json({ error: "BadRequest", message: "Pengguna bukan berstatus Admin." }, { status: 400 });
    }

    // 2. Parse and validate body
    const body = await req.json();
    const result = patchAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.format() },
        { status: 400 }
      );
    }

    const { status, password } = result.data;

    if (!status && !password) {
      return NextResponse.json({ error: "BadRequest", message: "Parameter tidak lengkap." }, { status: 400 });
    }

    // 3. Update database & write audit log
    const updatedUser = await db.$transaction(async (tx) => {
      const updateData: any = {};
      let action = "";
      let details: any = { adminId: id, email: targetUser.email };

      if (status) {
        updateData.status = status;
        action = "TOGGLE_ADMIN_STATUS";
        details.status = status;
      }

      if (password) {
        updateData.password = await hashPassword(password);
        // Clear failed attempts and lockout when password is reset
        updateData.failed_login_attempts = 0;
        updateData.lockout_until = null;
        action = "RESET_ADMIN_PASSWORD";
      }

      const updated = await tx.user.update({
        where: { id },
        data: updateData,
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action,
          details,
        },
      });

      return updated;
    });

    let message = "";
    if (status) {
      message = `Status akun admin '${updatedUser.nama}' diubah menjadi ${status === "ACTIVE" ? "Aktif" : "Nonaktif"}.`;
    } else if (password) {
      message = `Kata sandi akun admin '${updatedUser.nama}' berhasil di-reset.`;
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        id: updatedUser.id,
        nama: updatedUser.nama,
        email: updatedUser.email,
        status: updatedUser.status,
      },
    });

  } catch (error) {
    console.error("Kesalahan PATCH Admin Detail:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
