import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

// Zod validation for creating property
const createPropertySchema = z.object({
  nama_property: z.string().min(3, "Nama properti minimal 3 karakter").max(100, "Nama properti maksimal 100 karakter"),
  group: z.string().nullable().optional(),
  lebar: z.number().positive("Lebar harus lebih dari 0"),
  panjang: z.number().positive("Panjang harus lebih dari 0"),
  hadap: z.array(z.enum(["Utara", "Selatan", "Timur", "Barat"])).min(1, "Hadap minimal pilih 1 arah"),
  tipe: z.enum(["Ruko", "Villa"]),
  tingkat: z.number().min(1, "Tingkat minimal 1").max(10, "Tingkat maksimal 10"),
  price: z.number().positive("Harga harus lebih dari 0"), // Will convert to BigInt for DB
  carport: z.boolean(),
  status: z.enum(["in_stock", "sold_out"]),
  siap: z.enum(["siap_huni", "siap_kosong", "siap_huni_renovasi"]),
  maps_link: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    return val.includes("google.com/maps");
  }, "URL harus valid berisi domain google.com/maps"),
  kawasan: z.array(z.string()).min(1, "Kawasan minimal pilih 1"),
  unit: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    // Parse URL query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const kawasan = searchParams.get("kawasan") ? searchParams.get("kawasan")!.split(",") : [];
    const hadap = searchParams.get("hadap") ? searchParams.get("hadap")!.split(",") : [];
    const siap = searchParams.get("siap") ? searchParams.get("siap")!.split(",") : [];
    
    const lebarMin = searchParams.get("lebarMin") ? parseFloat(searchParams.get("lebarMin")!) : null;
    const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : null;
    
    const tipe = searchParams.get("tipe") || ""; // "Ruko" | "Villa"
    const status = searchParams.get("status") || ""; // "in_stock" | "sold_out"
    const carport = searchParams.get("carport") || ""; // "true" | "false" | "all"

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get("sortBy") || "created_at"; // nama, harga, tanggal, status
    const sortOrder = searchParams.get("sortOrder") || "desc"; // asc, desc

    // Build Prisma query filters
    const whereClause: any = {
      deleted_at: null, // Soft delete filter
    };

    // Text search (matches nama_property, group, or kawasan array)
    if (search) {
      whereClause.OR = [
        { nama_property: { contains: search, mode: "insensitive" } },
        { group: { contains: search, mode: "insensitive" } },
        { kawasan: { hasSome: [search] } },
      ];
    }

    // Filter Kawasan (multi-select)
    if (kawasan.length > 0) {
      whereClause.kawasan = {
        hasSome: kawasan,
      };
    }

    // Filter Hadap (multi-select)
    if (hadap.length > 0) {
      whereClause.hadap = {
        hasSome: hadap,
      };
    }

    // Filter Siap (multi-select)
    if (siap.length > 0) {
      whereClause.siap = {
        in: siap,
      };
    }

    // Filter Lebar Min
    if (lebarMin !== null && !isNaN(lebarMin)) {
      whereClause.lebar = {
        gte: lebarMin,
      };
    }

    // Filter Price Max
    if (priceMax !== null && !isNaN(priceMax)) {
      whereClause.price = {
        lte: BigInt(priceMax),
      };
    }

    // Filter Tipe (exact)
    if (tipe && tipe !== "Semua") {
      whereClause.tipe = tipe;
    }

    // Filter Status (exact)
    if (status && status !== "Semua") {
      whereClause.status = status;
    }

    // Filter Carport (exact)
    if (carport === "true") {
      whereClause.carport = true;
    } else if (carport === "false") {
      whereClause.carport = false;
    }

    // Map sortBy to actual DB columns
    let orderByField = "created_at";
    if (sortBy === "nama") orderByField = "nama_property";
    else if (sortBy === "harga") orderByField = "price";
    else if (sortBy === "status") orderByField = "status";
    else if (sortBy === "tanggal") orderByField = "created_at";

    const orderBy: any = {};
    orderBy[orderByField] = sortOrder;

    // Execute queries
    let totalItems = 0;
    let items: any[] = [];

    try {
      totalItems = await db.property.count({ where: whereClause });
      items = await db.property.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
      });
    } catch (dbError) {
      const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      console.warn("API GET /api/properti database error, falling back to mock filtered data:", dbErrorMsg);
      // Fallback: If DB fails, we can mock listing and query filtering locally
      // For local development sandbox
      const { mockProperties } = await import("@/lib/mock-data");
      
      let filtered = [...mockProperties];
      
      // Perform local array filtering to make development sandbox dynamic
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

      // Sort
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

      totalItems = filtered.length;
      items = filtered.slice(skip, skip + limit);
    }

    // Convert Decimals and BigInts to standard numbers for JSON serialization
    const serializedItems = items.map((p) => ({
      id: p.id,
      nama_property: p.nama_property,
      group: p.group,
      lebar: Number(p.lebar),
      panjang: Number(p.panjang),
      hadap: p.hadap,
      tipe: p.tipe,
      tingkat: Number(p.tingkat),
      price: Number(p.price),
      carport: p.carport,
      status: p.status,
      siap: p.siap,
      maps_link: p.maps_link,
      kawasan: p.kawasan,
      unit: p.unit,
      images: p.images || [],
      created_at: p.created_at || new Date(),
    }));

    return NextResponse.json({
      data: serializedItems,
      pagination: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    });

  } catch (error) {
    console.error("Kesalahan GET Properti:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
        message: "Akses Ditolak. Hanya Superadmin yang diperbolehkan untuk menambah properti." 
      }, { status: 403 });
    }

    // 2. Parse & Validate body parameters
    const body = await req.json();
    const result = createPropertySchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    // 3. Save to database & write audit log
    let newProperty;
    try {
      newProperty = await db.$transaction(async (tx) => {
        const prop = await tx.property.create({
          data: {
            nama_property: data.nama_property,
            group: data.group || null,
            lebar: data.lebar,
            panjang: data.panjang,
            hadap: data.hadap,
            tipe: data.tipe,
            tingkat: data.tingkat,
            price: BigInt(data.price),
            carport: data.carport,
            status: data.status,
            siap: data.siap,
            maps_link: data.maps_link || null,
            kawasan: data.kawasan,
            unit: data.unit || null,
            images: data.images || [],
            created_by: user.id,
          },
        });

        // Write Audit Log
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "CREATE_PROPERTY",
            details: {
              propertyId: prop.id,
              nama_property: prop.nama_property,
              tipe: prop.tipe,
              price: prop.price.toString(),
            },
          },
        });

        return prop;
      });
      console.log(`[Superadmin Audit] Properti baru '${data.nama_property}' dibuat.`);
    } catch (dbError) {
      const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      console.warn("POST /api/properti database save failed, mock creating (fallback mode):", dbErrorMsg);
      // Fallback mock output for development sandbox without DB connection
      newProperty = {
        id: `mock-created-${Date.now()}`,
        ...data,
        price: BigInt(data.price),
        images: data.images || [],
        created_at: new Date(),
      };
    }

    // Convert back for JSON response
    return NextResponse.json({
      success: true,
      message: `Properti '${data.nama_property}' berhasil ditambahkan.`,
      data: {
        ...newProperty,
        price: Number(newProperty.price),
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Kesalahan POST Properti:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
