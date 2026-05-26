"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah, formatDimensions } from "@/lib/utils";
import { X, Edit3, Trash2, MapPin, Compass, ShieldAlert, Layers } from "lucide-react";

import { Property } from "@/types/property";

interface DrawerProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: "ADMIN" | "SUPERADMIN" | string;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

export default function PropertyDetailDrawer({
  property,
  isOpen,
  onClose,
  userRole,
  onEdit,
  onDelete,
}: DrawerProps) {
  if (!property) return null;

  const isSuperadmin = userRole === "SUPERADMIN";

  const getSiapLabel = (siap: string) => {
    switch (siap) {
      case "siap_huni":
        return "Siap Huni";
      case "siap_kosong":
        return "Siap Kosong";
      case "siap_huni_renovasi":
        return "Siap Huni Renovasi";
      default:
        return siap;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          ></motion.div>

          {/* Sliding Side Panel Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-md bg-[#161616] border-l border-zinc-900 z-50 overflow-y-auto flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-[#1F1F1F]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C9A961] font-bold">
                  Detail Properti
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mt-1 truncate max-w-[200px]">
                  {property.nama_property}
                </h3>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Actions for Superadmin */}
                {isSuperadmin && (
                  <div className="flex items-center space-x-1.5 mr-2">
                    <button
                      onClick={() => onEdit(property)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
                      title="Edit Properti"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(property)}
                      className="p-2 text-[#B33A3A] hover:bg-red-950/20 border border-red-950/40 transition-colors cursor-pointer"
                      title="Hapus Properti"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-grow space-y-8 text-xs sm:text-sm text-zinc-400">
              {/* Main Badge Area */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs tracking-wider uppercase font-bold bg-[#C9A961]/10 border border-[#C9A961]/40 text-[#C9A961] shadow-[0_0_8px_rgba(201,169,97,0.12)]">
                  {property.tipe}
                </span>
                <span
                  className={`px-2.5 py-1 text-xs tracking-wider uppercase font-bold border ${
                    property.status === "in_stock"
                      ? "bg-green-950/40 border-green-800 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.12)]"
                      : "bg-red-950/40 border-red-900/60 text-[#B33A3A] shadow-[0_0_8px_rgba(179,58,58,0.12)]"
                  }`}
                >
                  {property.status === "in_stock" ? "In Stock" : "Sold Out"}
                </span>
                <span className="px-2.5 py-1 text-xs tracking-wider uppercase font-bold border border-zinc-800 bg-[#1F1F1F] text-zinc-300">
                  {getSiapLabel(property.siap)}
                </span>
              </div>

              {/* Price Banner */}
              <div className="bg-[#1F1F1F] border border-zinc-850 p-5 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Nilai Investasi (Rupiah)</p>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {formatRupiah(property.price)}
                </p>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-2 gap-6 pt-2 border-t border-zinc-900">
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Nama Properti</p>
                  <p className="font-semibold text-white">{property.nama_property}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Group / Cluster</p>
                  <p className="font-semibold text-white flex items-center">
                    <Layers className="h-3.5 w-3.5 mr-1 text-[#C9A961] opacity-70" />
                    {property.group || "Non-Group"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Lebar × Panjang</p>
                  <p className="font-semibold text-white">
                    {formatDimensions(property.lebar, property.panjang)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Luas Tanah</p>
                  <p className="font-semibold text-white">
                    {Number(property.lebar) * Number(property.panjang)} m²
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Arah Hadap</p>
                  <p className="font-semibold text-white">{property.hadap.join(", ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Jumlah Tingkat</p>
                  <p className="font-semibold text-white">{property.tingkat} Lantai</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Carport</p>
                  <p className="font-semibold text-white">{property.carport ? "Ada Carport" : "Tidak Ada"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Kawasan</p>
                  <p className="font-semibold text-white">{property.kawasan.join(", ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Unit</p>
                  <p className="font-semibold text-white">{property.unit || "-"}</p>
                </div>
              </div>

              {/* Maps Link */}
              {property.maps_link && (
                <div className="border-t border-zinc-900 pt-6">
                  <a
                    href={property.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-[#C9A961]/35 hover:border-[#C9A961] text-[#C9A961] bg-[#111111] hover:bg-[#C9A961]/15 text-xs font-semibold uppercase tracking-wider transition-all duration-350 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Buka di Google Maps</span>
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar Disclaimer */}
            <div className="p-6 bg-[#1F1F1F] border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
              <span className="flex items-center uppercase font-semibold">
                <Compass className="h-3.5 w-3.5 mr-1 text-[#C9A961]" />
                <span>Prime Property</span>
              </span>
              <span>ID: {property.id.substring(0, 8)}...</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
