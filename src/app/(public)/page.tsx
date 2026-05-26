import Hero from "@/components/landing/hero";
import FeaturedProperties from "@/components/landing/featured-properties";
import WhyChooseUs from "@/components/landing/why-choose-us";
import db from "@/lib/db";
import { mockProperties } from "@/lib/mock-data";

export const revalidate = 0; // Dynamic rendering, fetch fresh data always

export default async function HomePage() {
  let properties = [];

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
  } catch (error) {
    console.warn("Koneksi database gagal atau belum disetup, menggunakan data dummy untuk landing page.");
    properties = mockProperties;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeaturedProperties properties={properties} />
      <WhyChooseUs />
    </div>
  );
}
