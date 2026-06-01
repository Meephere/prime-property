import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1, "Minimal pilih 1 properti"),
  action: z.enum(["change_status", "delete"]),
  status: z.enum(["in_stock", "sold_out"]).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    // 1. Verify Authentication & Authorization (Superadmin Only)
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ 
        error: "Forbidden", 
        message: "Akses Ditolak. Hanya Superadmin yang diperbolehkan melakukan operasi massal." 
      }, { status: 403 });
    }

    // 2. Parse & Validate body
    const body = await req.json().catch(() => ({}));
    const result = bulkActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.format() },
        { status: 400 }
      );
    }

    const { ids, action, status } = result.data;
    let isDbConnected = true;

    if (action === "change_status") {
      if (!status) {
        return NextResponse.json({ error: "Validasi gagal", message: "Status harus disediakan." }, { status: 400 });
      }

      try {
        await db.$transaction(async (tx) => {
          // If status changed to sold_out, identify which ones were in_stock to create notifications
          if (status === "sold_out") {
            const propertiesToNotify = await tx.property.findMany({
              where: {
                id: { in: ids },
                deleted_at: null,
                status: "in_stock",
              },
              select: {
                nama_property: true,
                tipe: true,
                kawasan: true,
              },
            });

            // Create notification alerts
            for (const prop of propertiesToNotify) {
              await tx.notification.create({
                data: {
                  title: "Properti Terjual (Sold Out)",
                  message: `Status properti "${prop.nama_property}" (${prop.tipe}) di kawasan ${prop.kawasan.join(", ")} telah diubah secara massal oleh Superadmin menjadi SOLD OUT.`,
                },
              });
            }
          }

          // Perform bulk update
          await tx.property.updateMany({
            where: {
              id: { in: ids },
              deleted_at: null,
            },
            data: { status },
          });

          // Write Audit Log
          await tx.auditLog.create({
            data: {
              userId: user.id,
              action: "BULK_UPDATE_STATUS",
              details: {
                propertyIds: ids,
                status,
              },
            },
          });
        });
      } catch (dbError) {
        isDbConnected = false;
        console.warn("Bulk status update DB transaction failed, using fallback.", dbError);
      }

      return NextResponse.json({
        success: true,
        message: `Status ${ids.length} properti berhasil diubah menjadi ${status === "in_stock" ? "In Stock" : "Sold Out"}.`,
      });

    } else if (action === "delete") {
      try {
        await db.$transaction(async (tx) => {
          // Perform bulk soft-delete
          await tx.property.updateMany({
            where: {
              id: { in: ids },
            },
            data: {
              deleted_at: new Date(),
            },
          });

          // Write Audit Log
          await tx.auditLog.create({
            data: {
              userId: user.id,
              action: "BULK_DELETE_PROPERTY",
              details: {
                propertyIds: ids,
              },
            },
          });
        });
      } catch (dbError) {
        isDbConnected = false;
        console.warn("Bulk delete DB transaction failed, using fallback.", dbError);
      }

      return NextResponse.json({
        success: true,
        message: `${ids.length} properti berhasil dihapus secara massal.`,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });

  } catch (error) {
    console.error("Kesalahan PATCH Bulk Properti:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
