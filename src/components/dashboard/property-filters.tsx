"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw, X, ChevronDown, Check, SlidersHorizontal } from "lucide-react";

interface FiltersProps {
  onFiltersChange: (filters: any) => void;
}

const KAWASAN_OPTIONS = ["Krakatau", "Pancing", "Cemara Asri", "Helvetia", "Tembung", "Setiabudi", "Ringroad", "Johor"];
const HADAP_OPTIONS = ["Utara", "Selatan", "Timur", "Barat"];
const SIAP_OPTIONS = [
  { label: "Siap Huni", value: "siap_huni" },
  { label: "Siap Kosong", value: "siap_kosong" },
  { label: "Siap Huni Renovasi", value: "siap_huni_renovasi" },
];

export default function PropertyFilters({ onFiltersChange }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Core filter states (synced with URL)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [kawasan, setKawasan] = useState<string[]>(
    searchParams.get("kawasan") ? searchParams.get("kawasan")!.split(",") : []
  );
  const [hadap, setHadap] = useState<string[]>(
    searchParams.get("hadap") ? searchParams.get("hadap")!.split(",") : []
  );
  const [siap, setSiap] = useState<string[]>(
    searchParams.get("siap") ? searchParams.get("siap")!.split(",") : []
  );
  const [lebarMin, setLebarMin] = useState(searchParams.get("lebarMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [tipe, setTipe] = useState(searchParams.get("tipe") || "Semua");
  const [status, setStatus] = useState(searchParams.get("status") || "Semua");
  const [carport, setCarport] = useState(searchParams.get("carport") || "all"); // "all", "true", "false"

  // Dropdown open states
  const [kawasanOpen, setKawasanOpen] = useState(false);
  const [hadapOpen, setHadapOpen] = useState(false);
  const [siapOpen, setSiapOpen] = useState(false);

  // Debounced search state
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrlAndTrigger();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle immediate changes
  useEffect(() => {
    updateUrlAndTrigger();
  }, [kawasan, hadap, siap, tipe, status, carport, lebarMin, priceMax]);

  const updateUrlAndTrigger = () => {
    const params = new URLSearchParams();
    
    // Maintain pagination and sorting if present
    const page = searchParams.get("page");
    const limit = searchParams.get("limit") || "50";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    if (page) params.set("page", page);
    params.set("limit", limit);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    if (search) params.set("search", search);
    if (kawasan.length > 0) params.set("kawasan", kawasan.join(","));
    if (hadap.length > 0) params.set("hadap", hadap.join(","));
    if (siap.length > 0) params.set("siap", siap.join(","));
    if (lebarMin) params.set("lebarMin", lebarMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (tipe !== "Semua") params.set("tipe", tipe);
    if (status !== "Semua") params.set("status", status);
    if (carport !== "all") params.set("carport", carport);

    // Sync URL without page reload
    router.replace(`${pathname}?${params.toString()}`);

    // Trigger parent callback
    onFiltersChange({
      search,
      kawasan,
      hadap,
      siap,
      lebarMin: lebarMin ? parseFloat(lebarMin) : null,
      priceMax: priceMax ? parseFloat(priceMax) : null,
      tipe,
      status,
      carport,
    });
  };

  const handleKawasanToggle = (val: string) => {
    setKawasan(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleHadapToggle = (val: string) => {
    setHadap(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleSiapToggle = (val: string) => {
    setSiap(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setKawasan([]);
    setHadap([]);
    setSiap([]);
    setLebarMin("");
    setPriceMax("");
    setTipe("Semua");
    setStatus("Semua");
    setCarport("all");
  };

  const removeKawasanChip = (val: string) => {
    setKawasan(prev => prev.filter(x => x !== val));
  };

  const removeHadapChip = (val: string) => {
    setHadap(prev => prev.filter(x => x !== val));
  };

  const removeSiapChip = (val: string) => {
    setSiap(prev => prev.filter(x => x !== val));
  };

  const isFiltered =
    search ||
    kawasan.length > 0 ||
    hadap.length > 0 ||
    siap.length > 0 ||
    lebarMin ||
    priceMax ||
    tipe !== "Semua" ||
    status !== "Semua" ||
    carport !== "all";

  return (
    <div className="bg-[#161616] border border-zinc-900 p-4 sm:p-6 space-y-4 shadow-xl">
      {/* First row: Search & Basic Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Cari nama, group, kawasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-zinc-800 pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 text-white rounded-none placeholder-zinc-500 focus:bg-[#1a1a1a] transition-all duration-300"
          />
        </div>

        {/* Kawasan Multi-select */}
        <div className="relative">
          <button
            onClick={() => {
              setKawasanOpen(!kawasanOpen);
              setHadapOpen(false);
              setSiapOpen(false);
            }}
            className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs flex items-center justify-between text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-none cursor-pointer transition-colors duration-200"
          >
            <span className="truncate">
              {kawasan.length === 0 ? "Kawasan (Semua)" : `${kawasan.length} Kawasan terpilih`}
            </span>
            <ChevronDown className="h-3.5 w-3.5 ml-2 flex-shrink-0" />
          </button>
          
          {kawasanOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setKawasanOpen(false)}></div>
              <div className="absolute left-0 mt-1 w-full bg-[#161616] border border-zinc-800 shadow-2xl z-20 p-2 max-h-48 overflow-y-auto rounded-none">
                {KAWASAN_OPTIONS.map((item) => {
                  const isChecked = kawasan.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => handleKawasanToggle(item)}
                      className="w-full flex items-center px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/50 text-left cursor-pointer transition-colors duration-150"
                    >
                      <div className={`h-3.5 w-3.5 border border-zinc-800 mr-2 flex items-center justify-center bg-[#111111] ${isChecked ? "border-[#C9A961]" : ""}`}>
                        {isChecked && <Check className="h-2.5 w-2.5 text-[#C9A961]" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Hadap Multi-select */}
        <div className="relative">
          <button
            onClick={() => {
              setHadapOpen(!hadapOpen);
              setKawasanOpen(false);
              setSiapOpen(false);
            }}
            className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs flex items-center justify-between text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-none cursor-pointer transition-colors duration-200"
          >
            <span className="truncate">
              {hadap.length === 0 ? "Hadap (Semua)" : `${hadap.length} Arah terpilih`}
            </span>
            <ChevronDown className="h-3.5 w-3.5 ml-2 flex-shrink-0" />
          </button>
          
          {hadapOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setHadapOpen(false)}></div>
              <div className="absolute left-0 mt-1 w-full bg-[#161616] border border-zinc-800 shadow-2xl z-20 p-2 max-h-48 overflow-y-auto rounded-none">
                {HADAP_OPTIONS.map((item) => {
                  const isChecked = hadap.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => handleHadapToggle(item)}
                      className="w-full flex items-center px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/50 text-left cursor-pointer transition-colors duration-150"
                    >
                      <div className={`h-3.5 w-3.5 border border-zinc-800 mr-2 flex items-center justify-center bg-[#111111] ${isChecked ? "border-[#C9A961]" : ""}`}>
                        {isChecked && <Check className="h-2.5 w-2.5 text-[#C9A961]" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Siap Multi-select */}
        <div className="relative">
          <button
            onClick={() => {
              setSiapOpen(!siapOpen);
              setKawasanOpen(false);
              setHadapOpen(false);
            }}
            className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs flex items-center justify-between text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-none cursor-pointer transition-colors duration-200"
          >
            <span className="truncate">
              {siap.length === 0 ? "Kondisi Siap (Semua)" : `${siap.length} Kondisi terpilih`}
            </span>
            <ChevronDown className="h-3.5 w-3.5 ml-2 flex-shrink-0" />
          </button>
          
          {siapOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSiapOpen(false)}></div>
              <div className="absolute left-0 mt-1 w-full bg-[#161616] border border-zinc-800 shadow-2xl z-20 p-2 max-h-48 overflow-y-auto rounded-none">
                {SIAP_OPTIONS.map((item) => {
                  const isChecked = siap.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      onClick={() => handleSiapToggle(item.value)}
                      className="w-full flex items-center px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/50 text-left cursor-pointer transition-colors duration-150"
                    >
                      <div className={`h-3.5 w-3.5 border border-zinc-800 mr-2 flex items-center justify-center bg-[#111111] ${isChecked ? "border-[#C9A961]" : ""}`}>
                        {isChecked && <Check className="h-2.5 w-2.5 text-[#C9A961]" />}
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Second row: Numeric & Radio Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {/* Dimensions (Lebar Min) */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Lebar Min (meter)</label>
          <input
            type="number"
            placeholder="Min"
            value={lebarMin}
            onChange={(e) => setLebarMin(e.target.value)}
            className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 text-white rounded-none focus:bg-[#1a1a1a] transition-all duration-300"
          />
        </div>

        {/* Harga Max */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Harga Maksimum (Rupiah)</label>
          <input
            type="number"
            placeholder="Maks (Contoh: 5000000000)"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 text-white rounded-none focus:bg-[#1a1a1a] transition-all duration-300"
          />
        </div>

        {/* Tipe Radio */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Tipe Properti</label>
          <div className="flex space-x-4 pt-1">
            {["Semua", "Ruko", "Villa"].map((item) => (
              <label key={item} className="flex items-center text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors duration-150">
                <input
                  type="radio"
                  name="tipe"
                  checked={tipe === item}
                  onChange={() => setTipe(item)}
                  className="mr-1.5 accent-[#C9A961]"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Radio */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Status Stock</label>
          <div className="flex space-x-4 pt-1">
            {["Semua", "in_stock", "sold_out"].map((item) => (
              <label key={item} className="flex items-center text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors duration-150">
                <input
                  type="radio"
                  name="status"
                  checked={status === item}
                  onChange={() => setStatus(item)}
                  className="mr-1.5 accent-[#C9A961]"
                />
                <span>{item === "Semua" ? "Semua" : item === "in_stock" ? "In Stock" : "Sold Out"}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Third row: Toggle Carport & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-zinc-900 pt-4 gap-4">
        {/* Carport Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-2 font-semibold">Carport:</span>
          <div className="inline-flex border border-zinc-800 bg-[#111111]">
            <button
              onClick={() => setCarport("all")}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                carport === "all" ? "bg-[#C9A961] text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setCarport("true")}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                carport === "true" ? "bg-[#C9A961] text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
              }`}
            >
              Ada
            </button>
            <button
              onClick={() => setCarport("false")}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                carport === "false" ? "bg-[#C9A961] text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
              }`}
            >
              Tidak Ada
            </button>
          </div>
        </div>

        {/* Reset Actions */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-red-950/40 transition-all duration-300 rounded-none font-semibold tracking-wider uppercase cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 mr-1 font-semibold">Filter Aktif:</span>
          
          {search && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
              Cari: {search}
              <button onClick={() => setSearch("")} className="ml-1.5 hover:text-red-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {kawasan.map((item) => (
            <span key={item} className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
              Kawasan: {item}
              <button onClick={() => removeKawasanChip(item)} className="ml-1.5 hover:text-red-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {hadap.map((item) => (
            <span key={item} className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
              Hadap: {item}
              <button onClick={() => removeHadapChip(item)} className="ml-1.5 hover:text-red-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {siap.map((item) => {
            const label = SIAP_OPTIONS.find(o => o.value === item)?.label || item;
            return (
              <span key={item} className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
                Siap: {label}
                <button onClick={() => removeSiapChip(item)} className="ml-1.5 hover:text-red-400 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          {lebarMin && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
              Lebar ≥ {lebarMin}m
              <button onClick={() => setLebarMin("")} className="ml-1.5 hover:text-red-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {priceMax && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
              Harga ≤ Rp {parseInt(priceMax).toLocaleString("id-ID")}
              <button onClick={() => setPriceMax("")} className="ml-1.5 hover:text-red-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {tipe !== "Semua" && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
              Tipe: {tipe}
              <button onClick={() => setTipe("Semua")} className="ml-1.5 hover:text-red-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {status !== "Semua" && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
              Status: {status === "in_stock" ? "In Stock" : "Sold Out"}
              <button onClick={() => setStatus("Semua")} className="ml-1.5 hover:text-red-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {carport !== "all" && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] bg-[#1F1F1F] border border-zinc-800 text-zinc-300">
              Carport: {carport === "true" ? "Ada" : "Tidak Ada"}
              <button onClick={() => setCarport("all")} className="ml-1.5 hover:text-red-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
