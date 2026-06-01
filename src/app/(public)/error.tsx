"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public Route Level Error Caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh] bg-zinc-950/20 backdrop-blur-sm border border-zinc-800/40 m-6">
      <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-900/50 flex items-center justify-center text-red-500 mb-4 animate-bounce">
        <AlertCircle size={24} />
      </div>
      <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Terjadi Kesalahan Server</h2>
      <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
        Halaman tidak dapat ditampilkan karena gangguan pada koneksi data atau konfigurasi autentikasi. Silakan muat ulang atau periksa kembali pengaturan kredensial Anda.
      </p>
      <div className="bg-black/40 border border-zinc-900 p-4 font-mono text-[10px] text-red-400 text-left max-w-lg overflow-x-auto w-full mb-6 max-h-[100px]">
        {error.message || "Error: Failed to process public page request."}
      </div>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-[#C9A961] hover:bg-[#bca055] text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center"
      >
        <RefreshCw size={14} className="mr-2 animate-spin" style={{ animationDuration: '3s' }} />
        Muat Ulang Halaman
      </button>
    </div>
  );
}
