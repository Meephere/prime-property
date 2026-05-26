import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return "";
  let str = "";
  if (Array.isArray(val)) {
    str = val.join(", ");
  } else {
    str = String(val);
  }
  
  // Replace double quotes with two double quotes
  const clean = str.replace(/"/g, '""');
  
  // Wrap in quotes if it contains commas, quotes, or newlines
  if (clean.includes(",") || clean.includes('"') || clean.includes("\n") || clean.includes("\r") || clean.trim() !== clean) {
    return `"${clean}"`;
  }
  return clean;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authentication & Authorization (Superadmin Only)
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ 
        error: "Forbidden", 
        message: "Akses Ditolak. Hanya Superadmin yang diperbolehkan untuk mengekspor data." 
      }, { status: 403 });
    }

    // 2. Parse URL query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const kawasan = searchParams.get("kawasan") ? searchParams.get("kawasan")!.split(",") : [];
    const hadap = searchParams.get("hadap") ? searchParams.get("hadap")!.split(",") : [];
    const siap = searchParams.get("siap") ? searchParams.get("siap")!.split(",") : [];
    
    const lebarMin = searchParams.get("lebarMin") ? parseFloat(searchParams.get("lebarMin")!) : null;
    const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : null;
    
    const tipe = searchParams.get("tipe") || ""; 
    const status = searchParams.get("status") || ""; 
    const carport = searchParams.get("carport") || ""; 

    // Sorting
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // 3. Build Prisma query filters
    const whereClause: any = {
      deleted_at: null,
    };

    if (search) {
      whereClause.OR = [
        { nama_property: { contains: search, mode: "insensitive" } },
        { group: { contains: search, mode: "insensitive" } },
        { kawasan: { hasSome: [search] } },
      ];
    }

    if (kawasan.length > 0) {
      whereClause.kawasan = { hasSome: kawasan };
    }

    if (hadap.length > 0) {
      whereClause.hadap = { hasSome: hadap };
    }

    if (siap.length > 0) {
      whereClause.siap = { in: siap };
    }

    if (lebarMin !== null && !isNaN(lebarMin)) {
      whereClause.lebar = { gte: lebarMin };
    }

    if (priceMax !== null && !isNaN(priceMax)) {
      whereClause.price = { lte: BigInt(priceMax) };
    }

    if (tipe && tipe !== "Semua") {
      whereClause.tipe = tipe;
    }

    if (status && status !== "Semua") {
      whereClause.status = status;
    }

    if (carport === "true") {
      whereClause.carport = true;
    } else if (carport === "false") {
      whereClause.carport = false;
    }

    let orderByField = "created_at";
    if (sortBy === "nama") orderByField = "nama_property";
    else if (sortBy === "harga") orderByField = "price";
    else if (sortBy === "status") orderByField = "status";
    else if (sortBy === "tanggal") orderByField = "created_at";

    const orderBy: any = {};
    orderBy[orderByField] = sortOrder;

    // 4. Fetch all matching properties
    let items = [];
    try {
      items = await db.property.findMany({
        where: whereClause,
        orderBy,
        take: 10000, // Export up to 10k rows
      });
    } catch (dbError) {
      console.warn("DB failed on export, falling back to mock filtered data.");
      const { mockProperties } = await import("@/lib/mock-data");
      let filtered = [...mockProperties];
      
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.nama_property.toLowerCase().includes(s) ||
            (p.group && p.group.toLowerCase().includes(s)) ||
            p.kawasan.some((k) => k.toLowerCase().includes(s))
        );
      }
      if (kawasan.length > 0) {
        filtered = filtered.filter((p) => p.kawasan.some((k) => kawasan.includes(k)));
      }
      if (hadap.length > 0) {
        filtered = filtered.filter((p) => p.hadap.some((h) => hadap.includes(h)));
      }
      if (siap.length > 0) {
        filtered = filtered.filter((p) => siap.includes(p.siap));
      }
      if (lebarMin !== null) {
        filtered = filtered.filter((p) => p.lebar >= lebarMin);
      }
      if (priceMax !== null) {
        filtered = filtered.filter((p) => p.price <= priceMax);
      }
      if (tipe && tipe !== "Semua") {
        filtered = filtered.filter((p) => p.tipe === tipe);
      }
      if (status && status !== "Semua") {
        filtered = filtered.filter((p) => p.status === status);
      }
      if (carport === "true") {
        filtered = filtered.filter((p) => p.carport === true);
      } else if (carport === "false") {
        filtered = filtered.filter((p) => p.carport === false);
      }
      
      filtered.sort((a, b) => {
        let valA = a[orderByField as keyof typeof a];
        let valB = b[orderByField as keyof typeof b];
        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        const numA = Number(valA || 0);
        const numB = Number(valB || 0);
        return sortOrder === "asc" ? numA - numB : numB - numA;
      });
      items = filtered;
    }

    // Helper to format readiness labels
    const getSiapLabel = (siap: string) => {
      switch (siap) {
        case "siap_huni":
          return "Siap Huni";
        case "siap_kosong":
          return "Siap Kosong";
        case "siap_huni_renovasi":
          return "Siap Huni Renovasi";
        default:
          return siap;
      }
    };

    // 5. Generate CSV Content
    const headers = [
      "ID",
      "Nama Properti",
      "Group/Cluster",
      "Tipe",
      "Lebar (m)",
      "Panjang (m)",
      "Luas Tanah (m2)",
      "Tingkat Lantai",
      "Harga (Rupiah)",
      "Arah Hadap",
      "Carport/Garasi",
      "Status Ketersediaan",
      "Kesiapan Unit",
      "Kawasan",
      "Nomor Unit",
      "Google Maps Link",
      "Tanggal Dibuat"
    ];

    const csvRows = [headers.join(",")];

    for (const p of items) {
      const row = [
        p.id,
        p.nama_property,
        p.group || "",
        p.tipe,
        Number(p.lebar).toString(),
        Number(p.panjang).toString(),
        (Number(p.lebar) * Number(p.panjang)).toString(),
        Number(p.tingkat).toString(),
        Number(p.price).toString(),
        p.hadap.join(", "),
        p.carport ? "Ada Carport" : "Tidak Ada",
        p.status === "in_stock" ? "In Stock" : "Sold Out",
        getSiapLabel(p.siap),
        p.kawasan.join(", "),
        p.unit || "",
        p.maps_link || "",
        (p as any).created_at ? new Date((p as any).created_at).toISOString() : ""
      ];

      csvRows.push(row.map(escapeCSVValue).join(","));
    }

    const csvContent = "\uFEFF" + csvRows.join("\n"); // Include BOM for proper Excel encoding

    // 6. Return response as download file attachment
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=prime-property-export.csv",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("Kesalahan Ekspor CSV:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
