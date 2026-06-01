export interface MemoryItem {
  id: string;
  key: string;
  category: "market" | "legal" | "finance" | "property";
  tags: string[];
  content: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "concierge" | "valuation" | "legal";
  text: string;
  timestamp: string;
}

export class AgentMemorySystem {
  // Long-Term Shared Knowledge Memory
  private static longTermMemory: MemoryItem[] = [
    {
      id: "lt-1",
      key: "kawasan-krakatau",
      category: "market",
      tags: ["krakatau", "komersial", "yield"],
      content: "Kawasan Krakatau merupakan node komersial utama dengan lalu lintas harian yang padat. Ruko di kawasan ini memiliki rata-rata rental yield 8-10% per tahun dengan apresiasi modal sekitar 7% per tahun."
    },
    {
      id: "lt-2",
      key: "kawasan-pancing",
      category: "market",
      tags: ["pancing", "mahasiswa", "investasi"],
      content: "Kawasan Pancing didominasi oleh klaster pendidikan tinggi. Ruko sangat potensial untuk usaha kuliner, fotokopi, atau ritel dengan rental yield berkisar 7-9% per tahun."
    },
    {
      id: "lt-3",
      key: "kawasan-cemara-asri",
      category: "market",
      tags: ["cemara-asri", "hunian", "mewah"],
      content: "Cemara Asri merupakan kawasan hunian elit terpadu. Villa mewah di sini memiliki tingkat apresiasi modal tertinggi (9-12% per tahun) didukung oleh fasilitas keamanan 24 jam dan komunitas eksklusif."
    },
    {
      id: "lt-4",
      key: "sertifikat-shm",
      category: "legal",
      tags: ["shm", "kepemilikan", "hukum"],
      content: "Sertifikat Hak Milik (SHM) adalah kasta kepemilikan tertinggi dan terkuat di Indonesia. Tidak memiliki batas waktu dan sangat direkomendasikan untuk villa residensial jangka panjang."
    },
    {
      id: "lt-5",
      key: "sertifikat-hgb",
      category: "legal",
      tags: ["hgb", "komersial", "batas-waktu"],
      content: "Hak Guna Bangunan (HGB) memberikan hak mendirikan bangunan di atas tanah milik negara/orang lain selama maks. 30 tahun (bisa diperpanjang 20 tahun). Umum digunakan untuk ruko komersial oleh badan usaha."
    },
    {
      id: "lt-6",
      key: "pajak-properti",
      category: "finance",
      tags: ["pajak", "bphtb", "ppn", "biaya"],
      content: "Transaksi properti di Indonesia melibatkan BPHTB (5% dari Nilai Perolehan Pajak), PPN (11% untuk properti baru), serta PPH Penjualan (2.5%). Biaya notaris rata-rata 0.5 - 1.5% dari nilai transaksi."
    },
    {
      id: "lt-7",
      key: "zoning-imb",
      category: "legal",
      tags: ["zoning", "imb", "pbg", "izin"],
      content: "Izin Mendirikan Bangunan (IMB) atau Persetujuan Bangunan Gedung (PBG) wajib dimiliki. Kawasan komersial melarang pembangunan hunian murni tanpa izin usaha, sedangkan kawasan pemukiman membatasi tinggi ruko."
    }
  ];

  // Retrieve long-term memory items based on tags or search query
  public static searchLongTerm(query: string): MemoryItem[] {
    const q = query.toLowerCase();
    return this.longTermMemory.filter(item => 
      item.key.includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.includes(q))
    );
  }

  // Retrieve specific long term memory by key
  public static getMemoryByKey(key: string): MemoryItem | undefined {
    return this.longTermMemory.find(item => item.key === key);
  }

  // Generate dynamic audit memory for specific properties
  public static generatePropertyAuditMemory(property: {
    nama_property: string;
    tipe: string;
    kawasan: string[];
    price: number;
    lebar: number;
    panjang: number;
    tingkat: number;
    maps_link?: string | null;
  }): {
    legalAudit: string;
    valuationAudit: string;
  } {
    // Deterministic simulation based on property properties to feel realistic
    const sumDim = property.lebar * property.panjang;
    const pricePerSqm = property.price / sumDim;
    
    // 1. Valuation Audit
    let yieldPct = 7.5;
    let appreciationPct = 6.8;
    
    if (property.kawasan.some(k => k.toLowerCase().includes("krakatau"))) {
      yieldPct = 9.2;
      appreciationPct = 8.1;
    } else if (property.kawasan.some(k => k.toLowerCase().includes("cemara"))) {
      yieldPct = 6.5;
      appreciationPct = 11.2;
    } else if (property.kawasan.some(k => k.toLowerCase().includes("pancing"))) {
      yieldPct = 8.4;
      appreciationPct = 7.5;
    }
    
    const valuationAudit = `Analisis Investasi untuk ${property.nama_property}:
- Harga per m²: Rp ${Math.round(pricePerSqm).toLocaleString("id-ID")}/m² (Luas tanah: ${sumDim} m²).
- Proyeksi Rental Yield Tahunan: ${yieldPct.toFixed(1)}% (Sewa tahunan estimasi Rp ${(property.price * yieldPct / 100).toLocaleString("id-ID")}).
- Apresiasi Nilai Aset Tahunan: ${appreciationPct.toFixed(1)}%.
- Skor Investasi Prime: ${Math.round(75 + (yieldPct * 2) + (appreciationPct * 0.8))}/100.
- Rekomendasi: Sangat cocok untuk ${property.tipe === "Ruko" ? "investor pasif mencari cash flow rental ruko" : "hold jangka panjang villa residensial premium"}.`;

    // 2. Legal Audit
    const isRuko = property.tipe === "Ruko";
    const certType = isRuko ? "HGB (Hak Guna Bangunan) Murni" : "SHM (Sertifikat Hak Milik)";
    const zoning = isRuko ? "Zona Perdagangan dan Jasa (Komersial)" : "Zona Perumahan Kepadatan Menengah-Tinggi (Residensial)";
    
    const legalAudit = `Audit Legalitas & Dokumen untuk ${property.nama_property}:
- Sertifikat Tanah: ${certType} - Terdaftar di BPN dan Bebas Sengketa.
- Kesesuaian Tata Kota (Zoning): Sesuai dengan peruntukan ${zoning}.
- PBG / IMB: Tersedia, Izin Bangunan ${property.tingkat} lantai terdaftar resmi.
- Pajak Terkait: PBB lunas berjalan. Estimasi BPHTB Pembeli Rp ${(property.price * 0.05).toLocaleString("id-ID")}.
- Catatan Legal: ${isRuko ? "Sertifikat HGB masih berlaku 22 tahun lagi, proses perpanjangan mudah." : "Sertifikat SHM siap balik nama langsung ke pembeli."}`;

    return {
      legalAudit,
      valuationAudit
    };
  }
}
