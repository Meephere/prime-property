"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Landmark, Plus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyFilters from "@/components/dashboard/property-filters";
import PropertyTable from "@/components/dashboard/property-table";
import PropertyDetailDrawer from "@/components/dashboard/property-detail-drawer";
import PropertyFormModal from "@/components/dashboard/property-form-modal";
import DeleteConfirmModal from "@/components/dashboard/delete-confirm-modal";import { Property } from "@/types/property";

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

        {/* Add Property Button (Superadmin Only) */}
        {isSuperadmin && (
          <button
            onClick={handleCreateClick}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-xs tracking-wider uppercase font-bold text-[#161616] bg-[#C9A961] hover:bg-[#bca055] transition-all duration-300 shadow-lg shadow-[#C9A961]/10 hover:shadow-[#C9A961]/25 rounded-none"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Tambah Properti</span>
          </button>
        )}
      </div>

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
    </div>
  );
}
