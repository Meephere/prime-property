"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";

import { Property } from "@/types/property";

interface DeleteModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (propertyId: string) => Promise<void>;
}

export default function DeleteConfirmModal({ property, isOpen, onClose, onConfirm }: DeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!property || !isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(property.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Gagal menghapus properti. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative bg-[#161616] border border-zinc-900 w-full max-w-md shadow-2xl z-10 text-zinc-300 rounded-none overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-[#1F1F1F]">
          <span className="text-[10px] uppercase tracking-wider text-[#B33A3A] font-bold flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1.5" />
            Konfirmasi Hapus
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-950/45 border border-red-900 p-3 text-xs text-red-400 rounded-none shadow-md">
              {error}
            </div>
          )}
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Yakin hapus properti <span className="font-bold text-white">&ldquo;{property.nama_property}&rdquo;</span>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-900 bg-[#1F1F1F] flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-zinc-800 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-[#B33A3A] hover:bg-[#c94b4b] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 inline-flex items-center cursor-pointer shadow-lg shadow-red-950/30"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Menghapus...
              </>
            ) : (
              <span>Hapus Properti</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
