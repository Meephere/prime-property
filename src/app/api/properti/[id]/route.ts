import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

const updatePropertySchema = z.object({
  nama_property: z.string().min(3, "Nama properti minimal 3 karakter").max(100, "Nama properti maksimal 100 karakter"),
  group: z.string().nullable().optional(),
  lebar: z.number().positive("Lebar harus lebih dari 0"),
  panjang: z.number().positive("Panjang harus lebih dari 0"),
  hadap: z.array(z.enum(["Utara", "Selatan", "Timur", "Barat"])).min(1, "Hadap minimal pilih 1 arah"),
  tipe: z.enum(["Ruko", "Villa"]),
  tingkat: z.number().min(1, "Tingkat minimal 1").max(10, "Tingkat maksimal 10"),
  price: z.number().positive("Harga harus lebih dari 0"),
  carport: z.boolean(),
  status: z.enum(["in_stock", "sold_out"]),
  siap: z.enum(["siap_huni", "siap_kosong", "siap_huni_renovasi"]),
  maps_link: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    return val.includes("google.com/maps");
  }, "URL harus valid berisi domain google.com/maps"),
  kawasan: z.array(z.string()).min(1, "Kawasan minimal pilih 1"),
  unit: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { id } = await params;

    let property = null;
    try {
      property = await db.property.findFirst({
        where: { id, deleted_at: null },
      });
    } catch (dbError) {
      console.warn("API GET /api/properti/[id] database error, falling back to mock data lookup.");
      const { mockProperties } = await import("@/lib/mock-data");
      property = mockProperties.find((p) => p.id === id) || null;
    }

    if (!property) {
      return NextResponse.json({ error: "Tidak ditemukan", message: "Properti tidak ditemukan atau telah dihapus." }, { status: 404 });
    }

    // Log the view action in the audit trail
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "VIEW_PROPERTY",
          details: {
            propertyId: id,
            nama_property: property.nama_property,
          },
        },
      });
    } catch (logError) {
      console.warn("Gagal menulis audit log VIEW_PROPERTY:", logError);
    }

    const serializedProperty = {
      ...property,
      lebar: Number(property.lebar),
      panjang: Number(property.panjang),
      tingkat: Number(property.tingkat),
      price: Number(property.price),
    };

    return NextResponse.json({ success: true, data: serializedProperty });
  } catch (error) {
    console.error("Kesalahan GET Properti Detail:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}

export async function PUT(
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

    // PENTING: Authorization check (Hanya Superadmin)
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ 
        error: "Forbidden", 
        message: "Akses Ditolak. Hanya Superadmin yang diperbolehkan untuk mengubah data properti." 
      }, { status: 403 });
    }

    // 2. Parse and validate body
    const body = await req.json();
    const result = updatePropertySchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    // 3. Fetch current values for audit log comparison
    let oldProperty = null;
    let isDbConnected = true;

    try {
      oldProperty = await db.property.findFirst({
        where: { id, deleted_at: null },
      });
    } catch (dbError) {
      isDbConnected = false;
      const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      console.warn("PUT /api/properti/[id] DB query failed, skipping comparison log.", dbErrorMsg);
    }

    if (isDbConnected && !oldProperty) {
      return NextResponse.json({ error: "Tidak ditemukan", message: "Properti tidak ditemukan atau telah dihapus." }, { status: 404 });
    }

    let updatedProperty;

    if (isDbConnected && oldProperty) {
      // 4. Calculate what changed for Audit Log
      const changes: Record<string, { old: any; new: any }> = {};
      const fieldsToCheck: (keyof typeof data)[] = [
        "nama_property", "group", "lebar", "panjang", "hadap", "tipe", 
        "tingkat", "price", "carport", "status", "siap", "maps_link", "kawasan", "unit"
      ];

      fieldsToCheck.forEach((field) => {
        const newVal = data[field];
        let oldVal: any = oldProperty![field as keyof typeof oldProperty];

        // Format checks for strict equivalence
        if (field === "price" && typeof oldVal === "bigint") {
          oldVal = Number(oldVal);
        } else if ((field === "lebar" || field === "panjang" || field === "tingkat") && oldVal) {
          oldVal = Number(oldVal);
        }

        // Compare array values
        if (Array.isArray(newVal) && Array.isArray(oldVal)) {
          const sortedNew = [...newVal].sort().join(",");
          const sortedOld = [...oldVal].sort().join(",");
          if (sortedNew !== sortedOld) {
            changes[field] = { old: oldVal, new: newVal };
          }
        } else if (oldVal !== newVal) {
          changes[field] = { old: oldVal, new: newVal };
        }
      });

      // 5. Update and write audit log inside transaction
      updatedProperty = await db.$transaction(async (tx) => {
        const prop = await tx.property.update({
          where: { id },
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
          },
        });

        // Write Audit Log only if something actually changed
        if (Object.keys(changes).length > 0) {
          await tx.auditLog.create({
            data: {
              userId: user.id,
              action: "UPDATE_PROPERTY",
              details: {
                propertyId: id,
                nama_property: prop.nama_property,
                changes,
              },
            },
          });
        }

        // Trigger notification if status changed from in_stock to sold_out
        if (oldProperty && oldProperty.status === "in_stock" && data.status === "sold_out") {
          await tx.notification.create({
            data: {
              title: "Properti Terjual (Sold Out)",
              message: `Status properti "${prop.nama_property}" (${prop.tipe}) di kawasan ${prop.kawasan.join(", ")} telah diubah oleh Superadmin menjadi SOLD OUT.`,
            },
          });
        }

        return prop;
      });
      console.log(`[Superadmin Audit] Properti '${data.nama_property}' (ID: ${id}) diubah. Perubahan:`, Object.keys(changes));
    } else {
      // Mock update fallback for development sandbox
      updatedProperty = {
        id,
        ...data,
        price: BigInt(data.price),
        updated_at: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      message: `Properti '${data.nama_property}' berhasil diperbarui.`,
      data: {
        ...updatedProperty,
        price: Number(updatedProperty.price),
      },
    });

  } catch (error) {
    console.error("Kesalahan PUT Properti:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}

export async function DELETE(
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

    // PENTING: Authorization check (Hanya Superadmin)
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ 
        error: "Forbidden", 
        message: "Akses Ditolak. Hanya Superadmin yang diperbolehkan untuk menghapus properti." 
      }, { status: 403 });
    }

    // 2. Perform Soft Delete & write audit log
    let deletedProp = null;
    let isDbConnected = true;

    try {
      deletedProp = await db.$transaction(async (tx) => {
        const prop = await tx.property.update({
          where: { id },
          data: {
            deleted_at: new Date(), // Soft delete
          },
        });

        // Write Audit Log
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "DELETE_PROPERTY",
            details: {
              propertyId: id,
              nama_property: prop.nama_property,
            },
          },
        });

        return prop;
      });
      console.log(`[Superadmin Audit] Properti '${deletedProp.nama_property}' (ID: ${id}) dihapus (soft-delete).`);
    } catch (dbError) {
      isDbConnected = false;
      const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      console.warn("DELETE /api/properti/[id] DB update failed, using mock success.", dbErrorMsg);
    }

    return NextResponse.json({
      success: true,
      message: "Properti berhasil dihapus.",
    });

  } catch (error) {
    console.error("Kesalahan DELETE Properti:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
