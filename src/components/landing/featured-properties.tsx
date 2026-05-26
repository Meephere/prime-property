"use client";

import { motion } from "framer-motion";
import { formatRupiah, formatDimensions } from "@/lib/utils";
import { Compass, Eye, Landmark, Layers, Sparkles } from "lucide-react";
import Link from "next/link";

interface PropertyItem {
  id: string;
  nama_property: string;
  group: string | null;
  lebar: number | string | any;
  panjang: number | string | any;
  hadap: string[];
  tipe: "Ruko" | "Villa" | string;
  tingkat: number | string | any;
  price: number | bigint | string | any;
  carport: boolean;
  status: string;
  siap: string;
  kawasan: string[];
  unit: string | null;
}

export default function FeaturedProperties({ properties }: { properties: PropertyItem[] }) {
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

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } 
    },
  };

  return (
    <section id="featured-properties" className="py-28 bg-white px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-zinc-200">
      
      {/* Decorative architectural background lines */}
      <div className="absolute inset-y-0 left-10 w-[1px] bg-zinc-100 pointer-events-none hidden xl:block"></div>
      <div className="absolute inset-y-0 right-10 w-[1px] bg-zinc-100 pointer-events-none hidden xl:block"></div>

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C9A961] font-bold flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-[#C9A961]" />
              CURATED COLLECTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A] font-sans uppercase">
              PROPERTI UNGGULAN TERKINI
            </h2>
            <div className="h-[2px] w-24 bg-[#C9A961]"></div>
          </div>
          <div className="lg:col-span-4 text-left lg:text-right">
            <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed max-w-md ml-auto">
              Portofolio pilihan ruko komersial strategis dan villa residensial eksklusif. Dipilih ketat berdasarkan keandalan struktur, keabsahan hukum, dan nilai investasi di masa mendatang.
            </p>
          </div>
        </div>

        {/* Property Grid (Asymmetrical composited staggered layout) */}
        {properties.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 text-zinc-400 text-sm">
            Tidak ada properti unggulan saat ini.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {properties.slice(0, 6).map((property, index) => {
              // Create an asymmetrical layout feel by giving some cards different vertical shifts on desktop
              const isStaggered = index % 3 === 1; // Middle column shifted slightly down on desktop
              
              return (
                <motion.div
                  key={property.id}
                  variants={cardVariants}
                  className={`bg-[#F5F5F5] border border-zinc-200 hover:border-[#C9A961]/40 transition-all duration-500 flex flex-col group relative overflow-hidden rounded-none h-full glow-gold-hover ${
                    isStaggered ? "lg:translate-y-8" : ""
                  }`}
                >
                  {/* Subtle top indicator line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A961] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  
                  {/* Card Content Wrapper */}
                  <div className="p-7 flex-grow flex flex-col justify-between space-y-6">
                    
                    {/* Header: Category & Badges */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#C9A961]">
                        {property.tipe}
                      </span>
                      <div className="flex space-x-1.5">
                        <span
                          className={`px-2 py-0.5 text-[9px] tracking-wider uppercase font-bold border transition-all ${
                            property.status === "in_stock"
                              ? "bg-green-50 border-green-200 text-green-700 shadow-[0_0_8px_rgba(34,197,94,0.08)]"
                              : "bg-red-50 border-red-200 text-[#B33A3A] shadow-[0_0_8px_rgba(179,58,58,0.08)]"
                          }`}
                        >
                          {property.status === "in_stock" ? "In Stock" : "Sold Out"}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] tracking-wider uppercase font-bold border bg-[#C9A961]/5 border-[#C9A961]/35 text-[#C9A961]">
                          {getSiapLabel(property.siap)}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#C9A961] transition-colors duration-300 line-clamp-1">
                        {property.nama_property}
                      </h3>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center font-medium">
                        <Layers className="h-3 w-3 mr-1 text-zinc-400" />
                        <span>{property.group || "Non-Group"}</span>
                      </p>
                    </div>

                    {/* Pricing with investment layout */}
                    <div className="border-t border-zinc-200/60 pt-4 space-y-0.5 text-left">
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-medium">Investment Value</p>
                      <p className="text-xl font-bold text-[#1A1A1A] tracking-tight group-hover:text-[#C9A961] transition-colors">
                        {formatRupiah(property.price)}
                      </p>
                    </div>

                    {/* Grid details (Architectural data look) */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] border-t border-zinc-200/60 pt-4 text-zinc-650">
                      <div className="space-y-0.5">
                        <p className="text-zinc-450 text-[9px] uppercase tracking-wider font-light">Dimensions</p>
                        <p className="font-semibold text-zinc-800">
                          {formatDimensions(property.lebar, property.panjang)}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-zinc-450 text-[9px] uppercase tracking-wider font-light">Facing</p>
                        <p className="font-semibold text-zinc-800 line-clamp-1">
                          {property.hadap.join(", ")}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-zinc-450 text-[9px] uppercase tracking-wider font-light">Floors</p>
                        <p className="font-semibold text-zinc-800">
                          {property.tingkat} Lantai
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-zinc-450 text-[9px] uppercase tracking-wider font-light">Sector</p>
                        <p className="font-semibold text-zinc-800 line-clamp-1">
                          {property.kawasan.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Detail Link with Gold Underline */}
                  <div className="px-7 py-4 bg-zinc-100 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-600 transition-colors group-hover:bg-[#C9A961]/5 duration-300">
                    <span className="flex items-center text-[10px] tracking-wider uppercase font-semibold">
                      <Compass className="h-3.5 w-3.5 mr-1.5 text-[#C9A961]" />
                      <span>{property.kawasan[0]}</span>
                    </span>
                    <span className="inline-flex items-center text-[#C9A961] font-bold text-[10px] tracking-widest uppercase transition-transform group-hover:translate-x-1 duration-300">
                      <span>View Details</span>
                      <Eye className="h-3.5 w-3.5 ml-1.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
