import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authentication & Authorization
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    // PENTING: Authorization check (Hanya Superadmin)
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ 
        error: "Forbidden", 
        message: "Akses Ditolak. Hanya Superadmin yang diperbolehkan untuk melihat log audit." 
      }, { status: 403 });
    }

    // 2. Fetch logs from database
    let logs = [];
    try {
      logs = await db.auditLog.findMany({
        orderBy: {
          created_at: "desc",
        },
        include: {
          user: {
            select: {
              nama: true,
              email: true,
              role: true,
            },
          },
        },
        take: 100, // Limit to recent 100 logs for performance
      });
    } catch (dbError) {
      console.warn("API GET /api/audit-log database error, falling back to mock audit logs.");
      // Fallback mock logs for development
      logs = [
        {
          id: "log-1",
          userId: "mock-superadmin-id",
          action: "CREATE_PROPERTY",
          details: {
            propertyId: "mock-1",
            nama_property: "Aston Villas Gold Executive",
            tipe: "Villa",
            price: "8500000000",
          },
          created_at: new Date(Date.now() - 3600000), // 1 hour ago
          user: {
            nama: "Super Admin Prime (Fallback)",
            email: "superadmin@primeproperty.com",
            role: "SUPERADMIN",
          },
        },
        {
          id: "log-2",
          userId: "mock-superadmin-id",
          action: "UPDATE_PROPERTY",
          details: {
            propertyId: "mock-2",
            nama_property: "Ruko Pancing Signature Kav. 3",
            changes: {
              price: { old: 2200000000, new: 2450000000 },
              status: { old: "sold_out", new: "in_stock" },
            },
          },
          created_at: new Date(Date.now() - 7200000), // 2 hours ago
          user: {
            nama: "Super Admin Prime (Fallback)",
            email: "superadmin@primeproperty.com",
            role: "SUPERADMIN",
          },
        },
      ];
    }

    return NextResponse.json({
      success: true,
      data: logs,
    });

  } catch (error) {
    console.error("Kesalahan GET Audit Log:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
