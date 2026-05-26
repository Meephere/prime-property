"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { formatRupiah, formatDimensions } from "@/lib/utils";
import { ArrowUpDown, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

import { Property } from "@/types/property";

interface TableProps {
  properties: Property[];
  pagination: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onRowClick: (property: Property) => void;
  highlightedId?: string | null;
}

export default function PropertyTable({ properties, pagination, onRowClick, highlightedId }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSortBy = params.get("sortBy") || "created_at";
    const currentSortOrder = params.get("sortOrder") || "desc";

    if (currentSortBy === field) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "asc");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());
    params.set("page", "1"); // Reset to page 1
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getSiapBadge = (siap: string) => {
    switch (siap) {
      case "siap_huni":
        return (
          <span className="px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-bold border border-[#C9A961]/40 bg-[#C9A961]/10 text-[#C9A961] shadow-[0_0_8px_rgba(201,169,97,0.12)] rounded-none whitespace-nowrap">
            Siap Huni
          </span>
        );
      case "siap_kosong":
        return (
          <span className="px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-bold border border-purple-800 bg-purple-950/45 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.12)] rounded-none whitespace-nowrap">
            Siap Kosong
          </span>
        );
      case "siap_huni_renovasi":
        return (
          <span className="px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-bold border border-amber-800 bg-amber-950/45 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.12)] rounded-none whitespace-nowrap">
            Siap Huni Renovasi
          </span>
        );
      default:
        return <span className="text-[10px] uppercase font-semibold text-zinc-400 whitespace-nowrap">{siap}</span>;
    }
  };

  const getSortIcon = (field: string) => {
    const currentSortBy = searchParams.get("sortBy") || "created_at";
    if (currentSortBy === field) {
      const currentSortOrder = searchParams.get("sortOrder") || "desc";
      return (
        <span className={`ml-1 text-[#C9A961] inline-block transition-transform duration-200 ${currentSortOrder === "asc" ? "rotate-180" : ""}`}>
          ▼
        </span>
      );
    }
    return <ArrowUpDown className="h-3 w-3 ml-1 text-zinc-500 inline-block" />;
  };

  return (
    <div className="bg-[#161616] border border-zinc-900 flex flex-col justify-between overflow-hidden shadow-2xl relative">
      {/* Table responsive viewport */}
      <div className="overflow-x-auto dashboard-scroll">
        <table className="w-full min-w-[1200px] text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 bg-[#1F1F1F] text-[10px] uppercase font-bold text-zinc-400 tracking-wider select-none">
              <th onClick={() => handleSort("nama")} className="px-6 py-4 cursor-pointer hover:bg-[#252525] hover:text-white transition-colors">
                Nama {getSortIcon("nama")}
              </th>
              <th className="px-6 py-4">Group</th>
              <th className="px-6 py-4">Lebar × Panjang</th>
              <th className="px-6 py-4">Hadap</th>
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4">Tingkat</th>
              <th onClick={() => handleSort("harga")} className="px-6 py-4 cursor-pointer hover:bg-[#252525] hover:text-white transition-colors">
                Harga {getSortIcon("harga")}
              </th>
              <th className="px-6 py-4 text-center">Carport</th>
              <th onClick={() => handleSort("status")} className="px-6 py-4 cursor-pointer hover:bg-[#252525] hover:text-white transition-colors">
                Status {getSortIcon("status")}
              </th>
              <th className="px-6 py-4">Siap</th>
              <th className="px-6 py-4">Kawasan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-xs">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-zinc-500 bg-[#161616]">
                  Tidak ada properti yang cocok dengan filter aktif.
                </td>
              </tr>
            ) : (
              properties.map((property) => {
                const isHighlighted = property.id === highlightedId;
                return (
                  <tr
                    key={property.id}
                    onClick={() => onRowClick(property)}
                    className={`hover:bg-zinc-900/80 cursor-pointer transition-all duration-200 border-l-2 ${
                      isHighlighted 
                        ? "bg-[#C9A961]/5 border-l-[#C9A961] shadow-[inset_4px_0_0_rgba(201,169,97,0.1)]" 
                        : "border-l-transparent hover:border-l-zinc-700"
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">
                      {property.nama_property}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 truncate max-w-[120px]">
                      {property.group || "-"}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium">
                      {formatDimensions(property.lebar, property.panjang)}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 max-w-[100px] truncate">
                      {property.hadap.join(", ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#C9A961] font-semibold">{property.tipe}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{property.tingkat} Lantai</td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatRupiah(property.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex justify-center">
                        {property.carport ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-bold border rounded-none whitespace-nowrap ${
                          property.status === "in_stock"
                            ? "bg-green-950/40 border-green-800 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                            : "bg-red-950/40 border-red-900/60 text-[#B33A3A] shadow-[0_0_10px_rgba(179,58,58,0.15)]"
                        }`}
                      >
                        {property.status === "in_stock" ? "In Stock" : "Sold Out"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getSiapBadge(property.siap)}</td>
                    <td className="px-6 py-4 text-zinc-400 truncate max-w-[120px]">
                      {property.kawasan.join(", ")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 0 && (
        <div className="bg-[#161616] border-t border-zinc-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          {/* Rows Per Page selector */}
          <div className="flex items-center space-x-2">
            <span>Tampilkan baris:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="bg-[#111111] border border-zinc-800 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961] text-zinc-200 rounded-none cursor-pointer"
            >
              {[25, 50, 100].map((limit) => (
                <option key={limit} value={limit}>
                  {limit}
                </option>
              ))}
            </select>
            <span className="hidden sm:inline">
              dari total <span className="font-bold text-zinc-200">{pagination.totalItems}</span> properti
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-4">
            <span className="text-[11px]">
              Halaman <span className="font-bold text-zinc-200">{pagination.page}</span> dari{" "}
              <span className="font-bold text-zinc-200">{pagination.totalPages}</span>
            </span>
            <div className="flex border border-zinc-800 bg-[#111111]">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 border-l border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
