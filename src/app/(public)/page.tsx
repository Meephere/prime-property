import Hero from "@/components/landing/hero";
import FeaturedProperties from "@/components/landing/featured-properties";
import WhyChooseUs from "@/components/landing/why-choose-us";
import db from "@/lib/db";
import { mockProperties } from "@/lib/mock-data";

export const revalidate = 0; // Dynamic rendering, fetch fresh data always

export default async function HomePage() {
  let properties = [];
  let stats = {
    unitsAvailable: 120, // Default luxury fallback
    kawasanCount: 8,
    unitsSold: 500,
  };

  try {
    // Attempt to fetch from real database
    const dbProperties = await db.property.findMany({
      where: {
        deleted_at: null,
      },
      take: 6,
      orderBy: {
        created_at: "desc",
      },
    });
    
    // Map Decimal to float/number and BigInt to Number for compatibility
    properties = dbProperties.map((p) => ({
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
      kawasan: p.kawasan,
      unit: p.unit,
    }));

    // Fetch dynamic statistics from real database
    const [availableCount, soldCount, allPropertiesForKawasan] = await Promise.all([
      db.property.count({
        where: {
          status: "in_stock",
          deleted_at: null,
        },
      }),
      db.property.count({
        where: {
          status: "sold_out",
          deleted_at: null,
        },
      }),
      db.property.findMany({
        where: {
          deleted_at: null,
        },
        select: {
          kawasan: true,
        },
      }),
    ]);

    const uniqueKawasan = new Set<string>();
    allPropertiesForKawasan.forEach((p) => {
      p.kawasan.forEach((k) => {
        if (k) uniqueKawasan.add(k.trim());
      });
    });

    if (availableCount > 0 || soldCount > 0) {
      stats = {
        unitsAvailable: availableCount,
        kawasanCount: uniqueKawasan.size || 1,
        unitsSold: soldCount,
      };
    } else {
      // Calculate from dummy data if db exists but has no records
      stats = {
        unitsAvailable: properties.filter((p) => p.status === "in_stock").length,
        kawasanCount: new Set(properties.flatMap((p) => p.kawasan)).size || 1,
        unitsSold: properties.filter((p) => p.status === "sold_out").length,
      };
    }
  } catch (error) {
    console.warn("Koneksi database gagal atau belum disetup, menggunakan data dummy untuk landing page.");
    properties = mockProperties;
    // Calculate stats from mock data
    stats = {
      unitsAvailable: mockProperties.filter((p) => p.status === "in_stock").length,
      kawasanCount: new Set(mockProperties.flatMap((p) => p.kawasan)).size || 1,
      unitsSold: mockProperties.filter((p) => p.status === "sold_out").length,
    };
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Hero stats={stats} />
      <FeaturedProperties properties={properties} />
      <WhyChooseUs />
    </div>
  );
}
