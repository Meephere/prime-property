export interface Property {
  id: string;
  nama_property: string;
  group: string | null;
  lebar: number;
  panjang: number;
  hadap: string[];
  tipe: "Ruko" | "Villa" | string;
  tingkat: number;
  price: number;
  carport: boolean;
  status: "in_stock" | "sold_out" | string;
  siap: "siap_huni" | "siap_kosong" | "siap_huni_renovasi" | string;
  kawasan: string[];
  unit: string | null;
  maps_link: string | null;
  images?: string[];
  created_at: string;
}
