"use client";

import { useState, useEffect } from "react";
import { X, Check, Layers } from "lucide-react";
import { createPortal } from "react-dom";
import { formatRupiah, formatDimensions } from "@/lib/utils";
import { Property } from "@/types/property";

interface CompareModalProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export default function CompareModal({ properties, isOpen, onClose, onRemove }: CompareModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

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

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative bg-[#161616] border border-zinc-900 w-full max-w-5xl shadow-2xl z-[1000] text-zinc-300 rounded-none overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-[#1F1F1F]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C9A961] font-bold">
              Analisis Komparatif
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mt-1">
              Perbandingan Properti ({properties.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body (Scrollable Table) */}
        <div className="flex-grow overflow-auto p-6 dashboard-scroll">
          {properties.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-xs uppercase tracking-wider">
              Tidak ada properti terpilih untuk dibandingkan.
            </div>
          ) : (
            <div className="min-w-[700px]">
              <table className="w-full text-left border-collapse border border-zinc-900">
                <thead>
                  <tr className="border-b border-zinc-900 bg-[#1F1F1F]">
                    <th className="px-5 py-4 text-[10px] uppercase font-bold text-zinc-500 tracking-wider w-1/4 border-r border-zinc-900">
                      Spesifikasi
                    </th>
                    {properties.map((prop) => (
                      <th key={prop.id} className="px-5 py-4 w-1/4 border-r border-zinc-900 relative group">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[#C9A961] font-bold">
                              {prop.tipe}
                            </span>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-0.5 line-clamp-2">
                              {prop.nama_property}
                            </h4>
                          </div>
                          {properties.length > 1 && (
                            <button
                              onClick={() => onRemove(prop.id)}
                              className="text-[10px] text-red-500 hover:text-red-400 transition-colors uppercase font-bold tracking-wider cursor-pointer opacity-70 hover:opacity-100 mt-1"
                              title="Hapus dari perbandingan"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {/* Harga */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Nilai Investasi
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 font-extrabold text-white text-sm border-r border-zinc-900">
                        {formatRupiah(prop.price)}
                      </td>
                    ))}
                  </tr>

                  {/* Kawasan */}
                  <tr className="hover:bg-zinc-900/30 font-medium">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Kawasan
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 text-zinc-200 border-r border-zinc-900">
                        {prop.kawasan.join(", ")}
                      </td>
                    ))}
                  </tr>

                  {/* Tipe */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Tipe Properti
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 text-[#C9A961] font-semibold border-r border-zinc-900">
                        {prop.tipe}
                      </td>
                    ))}
                  </tr>

                  {/* Dimensi */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Dimensi (Lebar x Panjang)
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 text-zinc-200 border-r border-zinc-900 font-medium">
                        {formatDimensions(prop.lebar, prop.panjang)}
                      </td>
                    ))}
                  </tr>

                  {/* Luas Tanah */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Luas Tanah
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 text-zinc-200 border-r border-zinc-900 font-semibold">
                        {Number(prop.lebar) * Number(prop.panjang)} m²
                      </td>
                    ))}
                  </tr>

                  {/* Jumlah Tingkat */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Jumlah Tingkat
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 text-zinc-200 border-r border-zinc-900">
                        {prop.tingkat} Lantai
                      </td>
                    ))}
                  </tr>

                  {/* Arah Hadap */}
                  <tr className="hover:bg-zinc-900/30 font-medium">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Arah Hadap
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 text-zinc-200 border-r border-zinc-900">
                        {prop.hadap.join(", ")}
                      </td>
                    ))}
                  </tr>

                  {/* Carport / Fasilitas */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Fasilitas (Carport)
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 border-r border-zinc-900">
                        {prop.carport ? (
                          <span className="inline-flex items-center text-green-400 font-semibold">
                            <Check className="h-4 w-4 mr-1.5 text-green-500" />
                            Ada Carport
                          </span>
                        ) : (
                          <span className="text-red-400 font-medium">Tidak Ada</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Kesiapan */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Kesiapan Unit
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 border-r border-zinc-900">
                        {getSiapLabel(prop.siap)}
                      </td>
                    ))}
                  </tr>

                  {/* Group / Cluster */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Group / Cluster
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 text-zinc-200 border-r border-zinc-900 font-medium">
                        {prop.group || "-"}
                      </td>
                    ))}
                  </tr>

                  {/* Unit */}
                  <tr className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-zinc-400 border-r border-zinc-900">
                      Nomor Unit / Keterangan
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-5 py-3.5 text-zinc-200 border-r border-zinc-900">
                        {prop.unit || "-"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900 bg-[#1F1F1F] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-zinc-800 text-xs font-bold uppercase tracking-wider hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Tutup Analisis
          </button>
        </div>

      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
