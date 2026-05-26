export interface MockProperty {
  id: string;
  nama_property: string;
  group: string | null;
  lebar: number;
  panjang: number;
  hadap: string[];
  tipe: "Ruko" | "Villa";
  tingkat: number;
  price: number;
  carport: boolean;
  status: "in_stock" | "sold_out";
  siap: "siap_huni" | "siap_kosong" | "siap_huni_renovasi";
  maps_link: string | null;
  kawasan: string[];
  unit: string | null;
}

export const mockProperties: MockProperty[] = [
  {
    id: "mock-1",
    nama_property: "Aston Villas Gold Executive",
    group: "Royal Residence",
    lebar: 10.5,
    panjang: 20.0,
    hadap: ["Utara", "Timur"],
    tipe: "Villa",
    tingkat: 3,
    price: 8500000000,
    carport: true,
    status: "in_stock",
    siap: "siap_huni",
    maps_link: "https://google.com/maps",
    kawasan: ["Cemara Asri"],
    unit: "Ready Siap huni",
  },
  {
    id: "mock-2",
    nama_property: "Ruko Pancing Signature Kav. 3",
    group: "Project Ville",
    lebar: 6.0,
    panjang: 18.0,
    hadap: ["Selatan"],
    tipe: "Ruko",
    tingkat: 3.5,
    price: 2450000000,
    carport: true,
    status: "in_stock",
    siap: "siap_kosong",
    maps_link: "https://google.com/maps",
    kawasan: ["Pancing"],
    unit: "Gate siap",
  },
  {
    id: "mock-3",
    nama_property: "Banyan Heights Blok B-12",
    group: "Golden Hill",
    lebar: 8.0,
    panjang: 15.0,
    hadap: ["Utara"],
    tipe: "Villa",
    tingkat: 2,
    price: 3600000000,
    carport: true,
    status: "in_stock",
    siap: "siap_huni_renovasi",
    maps_link: null,
    kawasan: ["Krakatau"],
    unit: null,
  },
  {
    id: "mock-4",
    nama_property: "Ruko Setiabudi Central Townhouse",
    group: "Mentari",
    lebar: 5.5,
    panjang: 16.5,
    hadap: ["Timur"],
    tipe: "Ruko",
    tingkat: 3,
    price: 1850000000,
    carport: false,
    status: "in_stock",
    siap: "siap_huni",
    maps_link: "https://google.com/maps",
    kawasan: ["Setiabudi"],
    unit: "Ready Siap huni",
  },
  {
    id: "mock-5",
    nama_property: "Emerald Luxury Palace A-1",
    group: "Royal Residence",
    lebar: 12.0,
    panjang: 25.0,
    hadap: ["Selatan", "Barat"],
    tipe: "Villa",
    tingkat: 3,
    price: 12500000000,
    carport: true,
    status: "in_stock",
    siap: "siap_huni",
    maps_link: "https://google.com/maps",
    kawasan: ["Cemara Asri"],
    unit: "Ready Siap huni",
  },
  {
    id: "mock-6",
    nama_property: "Villa Helvetia Grand Boulevard",
    group: "Permai 123",
    lebar: 9.0,
    panjang: 18.0,
    hadap: ["Utara"],
    tipe: "Villa",
    tingkat: 2.5,
    price: 4200000000,
    carport: true,
    status: "in_stock",
    siap: "siap_kosong",
    maps_link: null,
    kawasan: ["Helvetia"],
    unit: null,
  },
];
