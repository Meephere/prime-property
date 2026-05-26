"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Landmark, Plus, CheckCircle, AlertCircle, Loader2, Download, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyFilters from "@/components/dashboard/property-filters";
import PropertyTable from "@/components/dashboard/property-table";
import PropertyDetailDrawer from "@/components/dashboard/property-detail-drawer";
import PropertyFormModal from "@/components/dashboard/property-form-modal";
import DeleteConfirmModal from "@/components/dashboard/delete-confirm-modal";
import CompareModal from "@/components/dashboard/compare-modal";
import { Property } from "@/types/property";

export default function DashboardPage() {
  const searchParams = useSearchParams();

  // Agent State
  const [agent, setAgent] = useState<{ nama: string; email: string; role: string } | null>(null);

  // Listing Data State
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  // Selected Item States
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Unified Property Selection States (for Compare and Bulk Actions)
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<{
    totalActive: number;
    totalSold: number;
    newAdded7Days: number;
    totalInventory: number;
    kawasanDistribution: Array<{ name: string; count: number }>;
    mostViewed: Array<{ id: string; name: string; count: number }>;
  } | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const body = await res.json();
        setAnalyticsData(body.data);
      }
    } catch (err) {
      console.warn("Gagal mengambil data analitik:", err);
    }
  };

  // Form Modal States (Create/Update)
  const [formOpen, setFormOpen] = useState(false);
  const [formProperty, setFormProperty] = useState<Property | null>(null); // null means Create

  // Delete Confirmation States
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProperty, setDeleteProperty] = useState<Property | null>(null);

  // Visual/Highlight States
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Fetch Agent Profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const body = await res.json();
          setAgent(body.user);
        } else {
          // Fallback if endpoint fails
          setAgent({ nama: "Agent", email: "", role: "ADMIN" });
        }
      } catch (err) {
        setAgent({ nama: "Agent", email: "", role: "ADMIN" });
      }
    };
    fetchProfile();
  }, []);

  // 2. Fetch properties list when searchParams change (debounced filter values reflected in URL)
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const queryStr = searchParams.toString();
        const res = await fetch(`/api/properti?${queryStr}`);
        if (res.ok) {
          const body = await res.json();
          setProperties(body.data);
          setPagination(body.pagination);
        }
      } catch (err) {
        console.error("Gagal memuat daftar properti:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Slight delay to avoid double fetch on initial mount
    const fetchTimer = setTimeout(() => {
      fetchProperties();
    }, 50);
    return () => clearTimeout(fetchTimer);
  }, [searchParams]);

  // Remove highlight after 5 seconds
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  useEffect(() => {
    if (agent?.role === "SUPERADMIN") {
      fetchAnalytics();
    }
  }, [agent, properties]);

  // Handle Form success callback
  const handleFormSuccess = (message: string, highlightId?: string) => {
    showToast("success", message);
    if (highlightId) {
      setHighlightedId(highlightId);
    }
    // Refetch properties by triggering URL refresh
    // router.replace will trigger searchParams update
    const url = new URL(window.location.href);
    url.searchParams.set("_refresh", Date.now().toString());
    window.history.replaceState(null, "", url.toString());
  };

  // Trigger Delete confirmation action
  const handleDeleteConfirm = async (propertyId: string) => {
    const response = await fetch(`/api/properti/${propertyId}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (response.ok) {
      showToast("success", result.message || "Properti berhasil dihapus.");
      setDrawerOpen(false);
      // Refresh URL params
      const url = new URL(window.location.href);
      url.searchParams.set("_refresh", Date.now().toString());
      window.history.replaceState(null, "", url.toString());
    } else {
      throw new Error(result.message || "Gagal menghapus properti.");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleRowClick = (prop: Property) => {
    setSelectedProperty(prop);
    setDrawerOpen(true);
    // Trigger log view on backend
    fetch(`/api/properti/${prop.id}`).catch((err) => {
      console.warn("Gagal merekam log akses detail properti:", err);
    });
  };

  const handleCompareToggle = (id: string) => {
    setSelectedProperties((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        return prev.filter((p) => p.id !== id);
      } else {
        const propToAdd = properties.find((p) => p.id === id);
        if (propToAdd) {
          return [...prev, propToAdd];
        }
        return prev;
      }
    });
  };

  const handleRemoveCompareProperty = (id: string) => {
    setSelectedProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleBulkAction = async (action: "change_status" | "delete", status?: "in_stock" | "sold_out") => {
    setLoading(true);
    try {
      const res = await fetch("/api/properti/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedProperties.map(p => p.id),
          action,
          status
        })
      });
      const body = await res.json();
      if (res.ok) {
        showToast("success", body.message || "Operasi massal berhasil.");
        setSelectedProperties([]);
        
        // Refresh properties list
        const url = new URL(window.location.href);
        url.searchParams.set("_refresh", Date.now().toString());
        window.history.replaceState(null, "", url.toString());
      } else {
        showToast("error", body.message || "Gagal melakukan operasi massal.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan saat memproses aksi massal.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (prop: Property) => {
    setFormProperty(prop);
    setFormOpen(true);
  };

  const handleDeleteClick = (prop: Property) => {
    setDeleteProperty(prop);
    setDeleteOpen(true);
  };

  const handleCreateClick = () => {
    setFormProperty(null);
    setFormOpen(true);
  };

  const handleExportCSV = () => {
    const queryStr = searchParams.toString();
    window.open(`/api/properti/export?${queryStr}`, "_blank");
  };

  const isSuperadmin = agent?.role === "SUPERADMIN";

  return (
    <div className="space-y-6 relative pb-12 text-zinc-300">
      {/* Toast Alert */}
      <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`p-4 shadow-xl border flex items-start space-x-3 rounded-none backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-green-950/80 border-green-800 text-green-400"
                  : "bg-red-950/80 border-red-900 text-red-400"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider">
                  {toast.type === "success" ? "Sukses" : "Pemberitahuan"}
                </p>
                <p className="text-xs mt-1 leading-relaxed">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-sm hover:text-white opacity-70">
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dashboard Top Title area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans uppercase">
            Kelola Inventory Properti
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Cari, filter, tambah, atau perbarui listing properti ruko dan villa eksklusif Prime Property.
          </p>
        </div>

        {/* Actions (Tambah Properti & Export) */}
        {isSuperadmin && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-xs tracking-wider uppercase font-bold text-zinc-300 hover:text-white border border-zinc-800 hover:border-[#C9A961]/40 bg-[#161616] hover:bg-[#C9A961]/5 transition-all duration-300 rounded-none cursor-pointer"
            >
              <Download className="h-4 w-4 mr-1.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handleCreateClick}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-xs tracking-wider uppercase font-bold text-[#161616] bg-[#C9A961] hover:bg-[#bca055] transition-all duration-300 shadow-lg shadow-[#C9A961]/10 hover:shadow-[#C9A961]/25 rounded-none"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Tambah Properti</span>
            </button>
          </div>
        )}
      </div>

      {/* Analytics Widgets (Superadmin Only) */}
      {isSuperadmin && analyticsData && (
        <div className="space-y-6 bg-[#161616] border border-zinc-900 p-6">
          <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
            <Landmark className="h-4.5 w-4.5 text-[#C9A961]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Analitik Inventori (Superadmin)</h3>
          </div>
          
          {/* KPIs Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1F1F1F]/40 border border-zinc-850 p-4 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Aktif (In Stock)</span>
              <p className="text-xl sm:text-2xl font-bold text-[#C9A961]">{analyticsData.totalActive}</p>
            </div>
            <div className="bg-[#1F1F1F]/40 border border-zinc-850 p-4 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Terjual (Sold Out)</span>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{analyticsData.totalSold}</p>
            </div>
            <div className="bg-[#1F1F1F]/40 border border-zinc-850 p-4 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Listing Baru (7 Hari)</span>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">{analyticsData.newAdded7Days}</p>
            </div>
            <div className="bg-[#1F1F1F]/40 border border-zinc-850 p-4 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Inventory</span>
              <p className="text-xl sm:text-2xl font-bold text-white">{analyticsData.totalInventory}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Kawasan Distribution */}
            <div className="space-y-4">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block border-b border-zinc-900 pb-2">Distribusi Per Kawasan</span>
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2 dashboard-scroll">
                {analyticsData.kawasanDistribution.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Tidak ada data kawasan.</p>
                ) : (
                  analyticsData.kawasanDistribution.map((kd) => {
                    const maxVal = Math.max(...analyticsData.kawasanDistribution.map(x => x.count), 1);
                    const percentage = (kd.count / maxVal) * 100;
                    return (
                      <div key={kd.name} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-300">{kd.name}</span>
                          <span className="text-[#C9A961] font-bold">{kd.count} Properti</span>
                        </div>
                        <div className="h-2 bg-[#111111] w-full border border-zinc-850 rounded-none overflow-hidden">
                          <div 
                            style={{ width: `${percentage}%` }}
                            className="h-full bg-[#C9A961] transition-all duration-1000"
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Most Viewed Listings */}
            <div className="space-y-4">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block border-b border-zinc-900 pb-2">Properti Paling Sering Dilihat</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 dashboard-scroll">
                {analyticsData.mostViewed.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Belum ada tayangan detail terekam.</p>
                ) : (
                  analyticsData.mostViewed.map((mv, index) => (
                    <div key={mv.id} className="flex items-center justify-between p-2.5 bg-[#1F1F1F]/40 border border-zinc-850 hover:border-zinc-800 transition-colors text-xs">
                      <div className="flex items-center space-x-3 truncate">
                        <span className="text-[10px] font-bold text-zinc-500 w-4">#{index + 1}</span>
                        <h4 className="font-bold text-white uppercase tracking-wider truncate">{mv.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 text-[#C9A961]">
                        <Eye className="h-3.5 w-3.5 opacity-80" />
                        <span className="font-bold">{mv.count} views</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter System Component */}
      <PropertyFilters onFiltersChange={() => {}} />

      {/* Table & Spinner wrapper */}
      <div className="relative">
        {loading ? (
          <div className="absolute inset-0 bg-[#111111]/70 backdrop-blur-[1px] z-10 flex items-center justify-center min-h-[300px] border border-zinc-900">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 text-[#C9A961] animate-spin" />
              <span className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Memuat data...</span>
            </div>
          </div>
        ) : null}

        {/* Property Table Component */}
        <PropertyTable
          properties={properties}
          pagination={pagination}
          onRowClick={handleRowClick}
          highlightedId={highlightedId}
          selectedCompareIds={selectedProperties.map((p) => p.id)}
          onCompareToggle={handleCompareToggle}
          onSelectAllToggle={(checked) => {
            if (checked) {
              setSelectedProperties((prev) => {
                const uniqueProps = [...prev];
                properties.forEach((p) => {
                  if (!uniqueProps.some((item) => item.id === p.id)) {
                    uniqueProps.push(p);
                  }
                });
                return uniqueProps;
              });
            } else {
              const currentPageIds = properties.map((p) => p.id);
              setSelectedProperties((prev) => prev.filter((p) => !currentPageIds.includes(p.id)));
            }
          }}
        />
      </div>

      {/* Detail Slide Drawer Component */}
      <PropertyDetailDrawer
        property={selectedProperty}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userRole={agent?.role || "ADMIN"}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Property Form Modal (Create/Edit) */}
      <PropertyFormModal
        property={formProperty}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        property={deleteProperty}
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Floating Compare & Bulk Action Bar */}
      <AnimatePresence>
        {selectedProperties.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#161616]/95 border border-[#C9A961]/40 backdrop-blur-md px-6 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[900] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl w-11/12 rounded-none"
          >
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300">
              <span className="h-2 w-2 bg-[#C9A961] animate-pulse"></span>
              <span>{selectedProperties.length} Properti Terpilih</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Compare Trigger */}
              <button
                onClick={() => setCompareModalOpen(true)}
                disabled={selectedProperties.length < 2 || selectedProperties.length > 3}
                className="px-3.5 py-2 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {selectedProperties.length === 1
                  ? "Pilih Min. 2"
                  : selectedProperties.length > 3
                  ? "Maks. 3 Banding"
                  : "Bandingkan"}
              </button>

              {/* Bulk Actions for Superadmin */}
              {isSuperadmin && (
                <>
                  <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block"></div>
                  
                  <button
                    onClick={() => handleBulkAction("change_status", "in_stock")}
                    className="px-3.5 py-2 bg-green-650 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Set In Stock
                  </button>

                  <button
                    onClick={() => handleBulkAction("change_status", "sold_out")}
                    className="px-3.5 py-2 bg-[#B33A3A] hover:bg-[#c94b4b] text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Set Sold Out
                  </button>

                  <button
                    onClick={() => {
                      const confirmDelete = window.confirm(`Yakin ingin menghapus ${selectedProperties.length} properti secara massal?`);
                      if (confirmDelete) handleBulkAction("delete");
                    }}
                    className="px-3.5 py-2 border border-red-950/40 hover:bg-red-950/20 text-[#B33A3A] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Hapus Massal
                  </button>
                </>
              )}

              <div className="h-4 w-[1px] bg-zinc-800"></div>

              <button
                onClick={() => setSelectedProperties([])}
                className="text-[10px] text-zinc-400 hover:text-white uppercase font-bold tracking-widest transition-colors cursor-pointer px-1"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <CompareModal
        properties={selectedProperties}
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onRemove={handleRemoveCompareProperty}
      />
    </div>
  );
}
