import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, Role, TipeProperty, StatusProperty, SiapProperty } from "@prisma/client";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up database...");
  await prisma.auditLog.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.contactSubmission.deleteMany();

  console.log("Seeding users...");
  const superadminPassword = await bcrypt.hash("Superadmin123!", 10);
  const adminPassword = await bcrypt.hash("Admin123!", 10);

  const superadmin = await prisma.user.create({
    data: {
      email: "superadmin@primeproperty.com",
      nama: "Super Admin Prime",
      password: superadminPassword,
      role: Role.SUPERADMIN,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@primeproperty.com",
      nama: "Agent Admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log("Users seeded successfully!");
  console.log(`- Superadmin: ${superadmin.email}`);
  console.log(`- Admin: ${admin.email}`);

  console.log("Seeding 50 properties...");

  const kawasanList = ["Krakatau", "Pancing", "Cemara Asri", "Helvetia", "Tembung", "Setiabudi", "Ringroad", "Johor"];
  const groupList = ["Mentari", "Permai 123", "Project Ville", "Royal Residence", "Golden Hill", null];
  const hadapList = [["Utara"], ["Selatan"], ["Timur"], ["Barat"], ["Utara", "Timur"], ["Selatan", "Barat"]];
  const statusList = [StatusProperty.in_stock, StatusProperty.sold_out];
  const siapList = [SiapProperty.siap_huni, SiapProperty.siap_kosong, SiapProperty.siap_huni_renovasi];

  // Helper arrays to generate names
  const adjectives = ["Premium", "Luxury", "Royal", "Grand", "Emerald", "Classic", "Modern", "Elite", "Signature", "Heritage"];
  const nouns = ["Villas", "Heights", "Mansion", "Residence", "Townhouse", "Palace", "Suite", "Garden", "Park", "Cottage"];

  const propertiesData = [];

  for (let i = 1; i <= 55; i++) {
    const isRuko = i % 3 === 0;
    const tipe = isRuko ? TipeProperty.Ruko : TipeProperty.Villa;
    
    // Generate realistic names
    const adj = adjectives[i % adjectives.length];
    const noun = nouns[(i + 3) % nouns.length];
    const bloc = String.fromCharCode(65 + (i % 6)); // A - F
    const num = (i % 12) + 1;
    const nama_property = isRuko 
      ? `Ruko ${adj} ${noun} ${bloc}-${num}` 
      : `${adj} ${noun} Blok ${bloc} No. ${num}`;

    const group = groupList[i % groupList.length];
    const kawasan = [kawasanList[i % kawasanList.length]];
    if (i % 7 === 0) {
      // Add another tag for multi-tag kawasan
      kawasan.push(kawasanList[(i + 2) % kawasanList.length]);
    }
    
    const lebar = 4.5 + (i % 6) * 1.5; // 4.5, 6, 7.5, 9, 10.5, 12
    const panjang = 12 + (i % 8) * 2;   // 12, 14, 16, 18, 20, 22, 24, 26
    const hadap = hadapList[i % hadapList.length];
    
    const tingkat = isRuko 
      ? 3 + (i % 2) * 0.5 // 3, 3.5
      : 1 + (i % 4) * 0.5; // 1, 1.5, 2, 2.5, 3

    // Prices between 800 million and 12 billion
    const multiplier = 800000000 + (i % 15) * 800000000;
    const price = BigInt(multiplier);

    const carport = i % 2 === 0;
    const status = i < 48 ? StatusProperty.in_stock : StatusProperty.sold_out; // mostly in stock
    const siap = siapList[i % siapList.length];
    const maps_link = i % 3 !== 0 ? `https://www.google.com/maps/place/Medan,+Kota+Medan,+Sumatera+Utara/@${-6.2088 + (i * 0.001)},${106.8456 + (i * 0.001)},15z` : null;
    
    const unit = i % 5 === 0 ? "Ready Siap huni" : i % 7 === 0 ? "Gate siap" : i % 9 === 0 ? "Lapangan" : null;

    propertiesData.push({
      nama_property,
      group,
      lebar,
      panjang,
      hadap,
      tipe,
      tingkat,
      price,
      carport,
      status,
      siap,
      maps_link,
      kawasan,
      unit,
      created_by: superadmin.id,
    });
  }

  // Create in loop to handle BigInt issues or db create
  for (const prop of propertiesData) {
    await prisma.property.create({
      data: prop,
    });
  }

  console.log(`Successfully seeded ${propertiesData.length} properties!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
