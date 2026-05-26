"use client";

import { motion } from "framer-motion";
import { formatRupiah, formatDimensions } from "@/lib/utils";
import { Compass, Eye, Landmark, Layers, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PublicPropertyDetailDrawer from "./public-property-detail-drawer";

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
  const searchParams = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const propertiParam = searchParams.get("properti");

  useEffect(() => {
    if (propertiParam) {
      const found = properties.find((p) => p.id === propertiParam);
      if (found) {
        setSelectedProperty(found);
        setDrawerOpen(true);
      }
    }
  }, [propertiParam, properties]);

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    // Remove query param from URL without page reload
    const params = new URLSearchParams(window.location.search);
    params.delete("properti");
    const newRelativePathQuery = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState(null, "", newRelativePathQuery);
  };

  const handleViewDetails = (property: PropertyItem) => {
    setSelectedProperty(property);
    setDrawerOpen(true);
    // Sync with URL query param
    const params = new URLSearchParams(window.location.search);
    params.set("properti", property.id);
    const newRelativePathQuery = window.location.pathname + `?${params.toString()}`;
    window.history.replaceState(null, "", newRelativePathQuery);
  };
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
              return (
                <motion.div
                  key={property.id}
                  variants={cardVariants}
                  onClick={() => handleViewDetails(property)}
                  className="bg-white border border-zinc-200 hover:border-[#C9A961]/40 transition-all duration-500 flex flex-col group relative overflow-hidden rounded-none h-full glow-gold-hover cursor-pointer"
                >
                  {/* Subtle top indicator line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A961] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20"></div>
                  
                  {/* Black Card Header */}
                  <div className="bg-[#1A1A1A] p-6 relative border-b border-zinc-800/50 flex flex-col justify-between h-[130px]">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#C9A961]">
                      {property.tipe}
                    </span>
                    
                    <h3 className="text-base font-bold text-white font-serif tracking-wide mt-1.5 pr-14 line-clamp-1 group-hover:text-[#C9A961] transition-colors duration-300">
                      {property.nama_property}
                    </h3>
                    
                    <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-[#C9A961] shrink-0" />
                      <span>{property.kawasan.join(", ")}</span>
                    </div>

                    <div className="absolute top-6 right-6">
                      <span
                        className={`px-2 py-0.5 text-[9px] tracking-wider uppercase font-bold border transition-all ${
                          property.status === "in_stock"
                            ? "bg-green-950/30 border-green-800/50 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.08)]"
                            : "bg-red-950/30 border-red-800/50 text-[#FF6B6B] shadow-[0_0_8px_rgba(179,58,58,0.08)]"
                        }`}
                      >
                        {property.status === "in_stock" ? "In Stock" : "Sold Out"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Light Card Body */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                    {/* Grid details (Architectural data look) */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] text-zinc-600">
                      <div className="space-y-0.5">
                        <p className="text-zinc-400 text-[9px] uppercase tracking-wider font-light">Dimensions</p>
                        <p className="font-semibold text-zinc-800">
                          {formatDimensions(property.lebar, property.panjang)}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-zinc-400 text-[9px] uppercase tracking-wider font-light">Floors</p>
                        <p className="font-semibold text-zinc-800">
                          {property.tingkat} Lantai
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-zinc-450 text-[9px] uppercase tracking-wider font-light">Facing</p>
                        <p className="font-semibold text-zinc-850 line-clamp-1">
                          {property.hadap.join(", ")}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-zinc-450 text-[9px] uppercase tracking-wider font-light">Group</p>
                        <p className="font-semibold text-zinc-850 line-clamp-1">
                          {property.group || "Non-Group"}
                        </p>
                      </div>
                    </div>

                    {/* Ready status tag */}
                    <div>
                      <span className="inline-block px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-bold bg-[#C9A961]/10 border border-[#C9A961]/25 text-[#C9A961] rounded-sm">
                        {getSiapLabel(property.siap)}
                      </span>
                    </div>

                    {/* Pricing with investment layout */}
                    <div className="border-t border-zinc-200/80 pt-4 space-y-0.5 text-left">
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-medium">Investment Value</p>
                      <p className="text-lg font-bold text-[#1A1A1A] tracking-tight group-hover:text-[#C9A961] transition-colors">
                        {formatRupiah(property.price)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Detail Link with Gold Underline */}
                  <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-650 transition-colors group-hover:bg-[#C9A961]/5 duration-300">
                    <span className="flex items-center text-[10px] tracking-wider uppercase font-semibold text-zinc-600">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#C9A961]" />
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

      <PublicPropertyDetailDrawer
        property={selectedProperty}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </section>
  );
}
