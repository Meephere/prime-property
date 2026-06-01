"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah, formatDimensions } from "@/lib/utils";
import { X, Edit3, Trash2, MapPin, Compass, ShieldAlert, Layers, Landmark, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// WhatsApp Icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4.5 w-4.5 mr-2"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966C16.273 1.974 13.805 1.05 11.2 1.05 5.86 1.05 1.5 5.421 1.496 10.85c-.001 1.745.47 3.447 1.363 4.965l-1.045 3.824 3.92-1.026c1.5.82 3.123 1.25 4.823 1.25zm11.758-7.854c-.3-.15-1.777-.878-2.052-.978-.276-.099-.476-.15-.676.15-.2.3-.777.978-.95 1.178-.173.199-.347.224-.646.074-.3-.15-1.265-.467-2.41-1.487-.89-.794-1.49-1.773-1.665-2.072-.174-.3-.018-.462.13-.61.135-.133.3-.349.45-.523.15-.174.2-.3.3-.499.1-.2.05-.374-.025-.524-.075-.15-.676-1.63-.926-2.228-.244-.588-.492-.507-.676-.516-.174-.008-.373-.01-.573-.01-.2 0-.525.075-.8.374-.275.3-1.05 1.025-1.05 2.5 0 1.475 1.075 2.898 1.225 3.097.15.2 2.115 3.227 5.125 4.527.715.31 1.273.495 1.71.635.717.228 1.37.195 1.885.118.574-.085 1.777-.726 2.027-1.427.25-.7.25-1.3.175-1.428-.075-.125-.275-.199-.575-.349z" />
  </svg>
);

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
  const [mounted, setMounted] = useState(false);

  // KPR Calculator States
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [tenor, setTenor] = useState<number>(15); // years
  const [interestRate, setInterestRate] = useState<number>(6.5); // % annual
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset calculator and gallery when property changes
  useEffect(() => {
    if (property) {
      setDpPercent(20);
      setTenor(15);
      setInterestRate(6.5);
      setActiveImageIndex(0);
    }
  }, [property]);

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

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[999] backdrop-blur-sm"
          ></motion.div>

          {/* Sliding Side Panel Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-md bg-[#161616] border-l border-zinc-900 z-[1000] overflow-y-auto flex flex-col justify-between"
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
              {/* Gambar Properti Gallery */}
              {property.images && property.images.length > 0 && (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full bg-zinc-950 border border-zinc-900 overflow-hidden">
                    <img
                      src={property.images[activeImageIndex]}
                      alt={`${property.nama_property} ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-800">
                      {activeImageIndex + 1} / {property.images.length}
                    </div>
                  </div>
                  
                  {property.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 dashboard-scroll">
                      {property.images.map((url, index) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`relative h-12 w-20 flex-shrink-0 bg-zinc-950 border transition-all duration-150 cursor-pointer overflow-hidden ${
                            index === activeImageIndex
                              ? "border-[#C9A961] opacity-100"
                              : "border-zinc-900 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                  <p className="font-semibold text-white">
                    {property.status === "sold_out" ? "Terjual (Sold Out)" : (property.unit || "-")}
                  </p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp Share & Google Maps */}
              <div className="space-y-2.5 pt-6 border-t border-zinc-900">
                <button
                  onClick={() => {
                    const propertyUrl = `${window.location.origin}/?properti=${property.id}`;
                    const message = `*PRIME PROPERTY - EXCLUSIVE LISTING*

Properti: *${property.nama_property}*
Kategori/Tipe: *${property.tipe}*
Kawasan: *${property.kawasan.join(", ")}*
Dimensi: *${formatDimensions(property.lebar, property.panjang)}* (Luas: *${property.lebar * property.panjang} m²*)
Lantai: *${property.tingkat} Lantai*
Hadap: *${property.hadap.join(", ")}*
Carport: *${property.carport ? "Ada" : "Tidak Ada"}*
Kesiapan: *${getSiapLabel(property.siap)}*

*Nilai Investasi:*
*${formatRupiah(property.price)}*

*Buka tautan berikut untuk detail selengkapnya:*
${propertyUrl}`;

                    const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                    window.open(waLink, "_blank");
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-green-950/30 cursor-pointer"
                >
                  <WhatsAppIcon />
                  <span>Bagikan via WA</span>
                </button>

                {property.maps_link && (
                  <a
                    href={property.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-[#C9A961]/35 hover:border-[#C9A961] text-[#C9A961] bg-[#111111] hover:bg-[#C9A961]/15 text-xs font-semibold uppercase tracking-wider transition-all duration-350 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Buka di Google Maps</span>
                  </a>
                )}
              </div>

              {/* KPR Calculator Widget (Dark mode style) */}
              {(() => {
                const price = property.price;
                const dpNominal = price * (dpPercent / 100);
                const loanAmount = price - dpNominal;
                const monthlyInterest = interestRate / 12 / 100;
                const totalMonths = tenor * 12;
                
                let monthlyInstallment = 0;
                if (loanAmount > 0) {
                  if (interestRate === 0) {
                    monthlyInstallment = loanAmount / totalMonths;
                  } else {
                    monthlyInstallment =
                      (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) /
                      (Math.pow(1 + monthlyInterest, totalMonths) - 1);
                  }
                }

                return (
                  <div className="border-t border-zinc-900 pt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Landmark className="h-4.5 w-4.5 text-[#C9A961]" />
                      <h4 className="text-xs uppercase font-bold tracking-wider text-white">Simulasi KPR / Cicilan</h4>
                    </div>

                    <div className="bg-[#1F1F1F] border border-zinc-850 p-4 space-y-4">
                      {/* Down Payment Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400 font-medium">Uang Muka (DP)</span>
                          <span className="font-bold text-white">
                            {dpPercent}% ({formatRupiah(dpNominal)})
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="90"
                          step="5"
                          value={dpPercent}
                          onChange={(e) => setDpPercent(Number(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#C9A961]"
                        />
                      </div>

                      {/* Tenor & Interest */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-zinc-400 font-medium block">Tenor (Waktu)</label>
                          <select
                            value={tenor}
                            onChange={(e) => setTenor(Number(e.target.value))}
                            className="w-full bg-[#111111] border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961]"
                          >
                            {[5, 10, 15, 20, 25, 30].map((years) => (
                              <option key={years} value={years}>
                                {years} Tahun
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-zinc-400 font-medium block">Suku Bunga (% p.a.)</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="25"
                              value={interestRate}
                              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                              className="w-full bg-[#111111] border border-zinc-800 pl-3 pr-8 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961]"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-xs">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Calculator Results */}
                      <div className="pt-3 border-t border-[#111111] flex items-center justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Pokok Pinjaman</p>
                          <p className="text-xs font-semibold text-zinc-200">{formatRupiah(loanAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Angsuran / Bulan</p>
                          <p className="text-base font-bold text-[#C9A961]">{formatRupiah(monthlyInstallment)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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

  return mounted ? createPortal(drawerContent, document.body) : null;
}
