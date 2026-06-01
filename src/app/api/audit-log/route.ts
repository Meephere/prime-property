import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authentication & Authorization
    const user = await getUserFromRequest(req);
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

    // 2. Parse URL query parameters for filtering
    const { searchParams } = new URL(req.url);
    const userIdFilter = searchParams.get("userId") || "";
    const searchFilter = searchParams.get("search") || "";
    const startDateFilter = searchParams.get("startDate") || "";
    const endDateFilter = searchParams.get("endDate") || "";

    // 3. Build where clause
    const whereClause: any = {};

    if (userIdFilter) {
      whereClause.userId = userIdFilter;
    }

    if (searchFilter) {
      whereClause.details = {
        path: ["nama_property"],
        string_contains: searchFilter,
      };
    }

    if (startDateFilter || endDateFilter) {
      whereClause.created_at = {};
      if (startDateFilter) {
        whereClause.created_at.gte = new Date(startDateFilter);
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        whereClause.created_at.lte = end;
      }
    }

    // 4. Fetch logs, users list, and summary cards
    let logs: any[] = [];
    let users: any[] = [];
    let summary = {
      latestAdded: [] as any[],
      latestSold: [] as any[]
    };

    try {
      // Fetch audit logs
      logs = await db.auditLog.findMany({
        where: whereClause,
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

      // Fetch users list for filter dropdown
      users = await db.user.findMany({
        select: {
          id: true,
          nama: true,
          email: true,
          role: true,
        },
        orderBy: {
          nama: "asc",
        }
      });

      // Fetch summary statistics: 5 latest added properties
      const dbLatestAdded = await db.property.findMany({
        where: { deleted_at: null },
        orderBy: { created_at: "desc" },
        take: 5,
      });
      summary.latestAdded = dbLatestAdded.map(p => ({
        id: p.id,
        nama_property: p.nama_property,
        tipe: p.tipe,
        price: Number(p.price),
        kawasan: p.kawasan,
        created_at: p.created_at
      }));

      // Fetch summary statistics: 5 latest sold properties
      const dbLatestSold = await db.property.findMany({
        where: { deleted_at: null, status: "sold_out" },
        orderBy: { updated_at: "desc" },
        take: 5,
      });
      summary.latestSold = dbLatestSold.map(p => ({
        id: p.id,
        nama_property: p.nama_property,
        tipe: p.tipe,
        price: Number(p.price),
        kawasan: p.kawasan,
        updated_at: p.updated_at
      }));

    } catch (dbError) {
      console.warn("API GET /api/audit-log database error, falling back to mock logs & stats.");
      
      // Fallback mock logs
      const mockLogs = [
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
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
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
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          user: {
            nama: "Super Admin Prime (Fallback)",
            email: "superadmin@primeproperty.com",
            role: "SUPERADMIN",
          },
        },
        {
          id: "log-3",
          userId: "mock-admin-id",
          action: "VIEW_PROPERTY",
          details: {
            propertyId: "mock-1",
            nama_property: "Aston Villas Gold Executive",
          },
          created_at: new Date(Date.now() - 1500000).toISOString(), // 25 mins ago
          user: {
            nama: "Admin Properti",
            email: "admin@primeproperty.com",
            role: "ADMIN",
          },
        }
      ];

      // Filter in memory for fallback mode
      let filteredLogs = [...mockLogs];
      if (userIdFilter) {
        filteredLogs = filteredLogs.filter(log => log.userId === userIdFilter);
      }
      if (searchFilter) {
        const s = searchFilter.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.details?.nama_property?.toLowerCase().includes(s) ||
          log.id.toLowerCase().includes(s)
        );
      }
      if (startDateFilter) {
        filteredLogs = filteredLogs.filter(log => new Date(log.created_at) >= new Date(startDateFilter));
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        filteredLogs = filteredLogs.filter(log => new Date(log.created_at) <= end);
      }
      logs = filteredLogs;

      // Mock users list
      users = [
        { id: "mock-superadmin-id", nama: "Super Admin Prime (Fallback)", email: "superadmin@primeproperty.com", role: "SUPERADMIN" },
        { id: "mock-admin-id", nama: "Admin Properti", email: "admin@primeproperty.com", role: "ADMIN" }
      ];

      // Mock summaries
      const { mockProperties } = await import("@/lib/mock-data");
      
      summary.latestAdded = mockProperties.slice(0, 5).map(p => ({
        id: p.id,
        nama_property: p.nama_property,
        tipe: p.tipe,
        price: p.price,
        kawasan: p.kawasan,
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }));

      summary.latestSold = mockProperties.filter(p => p.status === "sold_out").slice(0, 5).map(p => ({
        id: p.id,
        nama_property: p.nama_property,
        tipe: p.tipe,
        price: p.price,
        kawasan: p.kawasan,
        updated_at: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
      }));
    }

    return NextResponse.json({
      success: true,
      data: logs,
      users,
      summary
    });

  } catch (error) {
    console.error("Kesalahan GET Audit Log:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
