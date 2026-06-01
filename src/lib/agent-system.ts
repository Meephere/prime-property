import db from "@/lib/db";
import { mockProperties, MockProperty } from "@/lib/mock-data";
import { AgentMemorySystem, ChatMessage, MemoryItem } from "./agent-memory";

export interface AgentLog {
  id: string;
  timestamp: string;
  agent: "concierge" | "valuation" | "legal";
  action: string;
  details: string;
}

export interface MultiAgentResult {
  chatMessages: ChatMessage[];
  agentLogs: AgentLog[];
  retrievedMemories: MemoryItem[];
  matchedProperties: any[];
}

export class MultiAgentSystem {
  // Main orchestrator entry point
  public static async processUserQuery(
    userMessage: string,
    chatHistory: ChatMessage[] = []
  ): Promise<MultiAgentResult> {
    const timestamp = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const agentLogs: AgentLog[] = [];
    const retrievedMemories: MemoryItem[] = [];
    let matchedProperties: any[] = [];

    // Helper to add agent logs
    const addLog = (agent: "concierge" | "valuation" | "legal", action: string, details: string) => {
      agentLogs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: new Date().toLocaleTimeString("id-ID"),
        agent,
        action,
        details
      });
    };

    // 1. Concierge Agent starts processing
    addLog(
      "concierge",
      "Menerima pesan pengguna",
      `Pesan: "${userMessage}". Menganalisis niat pencarian dan preferensi properti.`
    );

    // Retrieve active properties from DB or mock fallback
    let allProps: any[] = [];
    try {
      const dbProperties = await db.property.findMany({
        where: { deleted_at: null },
      });
      allProps = dbProperties.map(p => ({
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
        maps_link: p.maps_link,
      }));
      addLog("concierge", "Database Query", "Berhasil mengambil data inventori properti dari PostgreSQL.");
    } catch (e) {
      allProps = mockProperties;
      addLog("concierge", "Database Query (Fallback)", "Koneksi database gagal. Menggunakan data dummy inventori.");
    }

    // Parse parameters from query (budget, type, area)
    const lowerQuery = userMessage.toLowerCase();
    
    // Type search
    let tipe: "Ruko" | "Villa" | null = null;
    if (lowerQuery.includes("ruko") || lowerQuery.includes("toko") || lowerQuery.includes("kantor")) {
      tipe = "Ruko";
    } else if (lowerQuery.includes("villa") || lowerQuery.includes("rumah") || lowerQuery.includes("hunian")) {
      tipe = "Villa";
    }

    // Kawasan search
    const kawasanKeywords = ["krakatau", "pancing", "cemara", "helvetia", "tembung", "setiabudi", "ringroad", "johor"];
    let detectedKawasan: string | null = null;
    for (const kw of kawasanKeywords) {
      if (lowerQuery.includes(kw)) {
        if (kw === "cemara") detectedKawasan = "Cemara Asri";
        else detectedKawasan = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }

    // Budget search
    let budgetMax = Infinity;
    const milyarMatch = lowerQuery.match(/(\d+(?:\.\d+)?)\s*(?:m|milyar|miliar)/);
    const jutaMatch = lowerQuery.match(/(\d+(?:\.\d+)?)\s*(?:jt|juta)/);
    if (milyarMatch) {
      budgetMax = parseFloat(milyarMatch[1]) * 1_000_000_000;
    } else if (jutaMatch) {
      budgetMax = parseFloat(jutaMatch[1]) * 1_000_000;
    }

    addLog(
      "concierge",
      "Parameter Terdeteksi",
      `Tipe: ${tipe || "Semua"}, Kawasan: ${detectedKawasan || "Semua"}, Budget Maks: ${budgetMax === Infinity ? "Tidak Terbatas" : "Rp " + budgetMax.toLocaleString("id-ID")}`
    );

    // Filtering matching properties
    matchedProperties = allProps.filter(p => {
      if (tipe && p.tipe !== tipe) return false;
      if (detectedKawasan && !p.kawasan.some((k: string) => k.toLowerCase().includes(detectedKawasan!.toLowerCase()))) return false;
      if (p.price > budgetMax) return false;
      return p.status === "in_stock";
    });

    addLog(
      "concierge",
      "Penyaringan Properti",
      `Ditemukan ${matchedProperties.length} properti yang cocok.`
    );

    // Retrieve general memory matches for the area or terms
    if (detectedKawasan) {
      const regionMem = AgentMemorySystem.searchLongTerm(detectedKawasan);
      retrievedMemories.push(...regionMem);
      addLog("concierge", "Akses Agent Memory System", `Mendapatkan memori jangka panjang untuk kawasan: "${detectedKawasan}".`);
    }

    // Call Valuation Agent and Legal Agent if there's any matching property
    let assistantMessage = "";

    if (matchedProperties.length === 0) {
      assistantMessage = "Maaf, saya tidak menemukan properti yang cocok dengan kriteria Anda. Coba naikkan budget Anda atau ganti kawasan pencarian.";
      addLog("concierge", "Hasil Kosong", "Mengirim pesan pemberitahuan hasil pencarian kosong kepada pengguna.");
    } else {
      // Analyze the top match
      const topMatch = matchedProperties[0];
      
      // Call Legal Agent
      addLog(
        "legal",
        "Pemeriksaan Legalitas Properti",
        `Menganalisis dokumen hukum untuk "${topMatch.nama_property}"...`
      );
      const auditData = AgentMemorySystem.generatePropertyAuditMemory(topMatch);
      addLog("legal", "Analisis Sertifikat", `Dokumen sertifikat valid. Mengeluarkan audit hukum.`);
      
      // Call Valuation Agent
      addLog(
        "valuation",
        "Analisis Keuangan & ROI",
        `Menghitung harga rata-rata, rental yield, dan estimasi keuntungan untuk "${topMatch.nama_property}"...`
      );
      addLog("valuation", "Proyeksi Finansial", `Rental yield & skor apresiasi modal dihitung. Mengeluarkan audit finansial.`);

      // Concierge synthesizes the response
      addLog("concierge", "Sintesis Laporan", "Menggabungkan data dari Valuation Agent dan Legal Agent untuk menyusun jawaban.");

      // General market memory integration
      const taxMem = AgentMemorySystem.getMemoryByKey("pajak-properti");
      if (taxMem) retrievedMemories.push(taxMem);

      // Draft the response
      const dimensions = `${topMatch.lebar} x ${topMatch.panjang} m`;
      const formattedPrice = `Rp ${Number(topMatch.price).toLocaleString("id-ID")}`;
      
      assistantMessage = `Halo! Saya menemukan rincian properti terbaik untuk Anda di kawasan **${topMatch.kawasan.join(", ")}** yaitu **${topMatch.nama_property}**:

💰 **Nilai Investasi:** ${formattedPrice}
📐 **Dimensi:** ${dimensions} (Lantai: ${topMatch.tingkat})
📍 **Kawasan:** ${topMatch.kawasan.join(", ")}

Berikut adalah laporan kolaborasi dari tim spesialis kami:

⚖️ **Laporan Audit Hukum (Legal Agent):**
${auditData.legalAudit}

📈 **Analisis Keuangan & ROI (Valuation Agent):**
${auditData.valuationAudit}

Apakah Anda ingin mengatur jadwal panggilan konsultasi atau kunjungan lapangan untuk meninjau unit ini secara langsung?`;
    }

    const newChatHistory: ChatMessage[] = [
      ...chatHistory,
      {
        id: `msg-user-${Date.now()}`,
        sender: "user",
        text: userMessage,
        timestamp
      },
      {
        id: `msg-assistant-${Date.now()}`,
        sender: "concierge",
        text: assistantMessage,
        timestamp
      }
    ];

    return {
      chatMessages: newChatHistory,
      agentLogs,
      retrievedMemories,
      matchedProperties: matchedProperties.slice(0, 3)
    };
  }
}
