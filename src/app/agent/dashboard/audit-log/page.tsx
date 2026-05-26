"use client";

import { useEffect, useState } from "react";
import { Loader2, History, AlertTriangle, ShieldCheck, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  userId: string;
  action: "CREATE_PROPERTY" | "UPDATE_PROPERTY" | "DELETE_PROPERTY" | string;
  details: any;
  created_at: string;
  user: {
    nama: string;
    email: string;
    role: string;
  };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/audit-log");
        const body = await res.json();
        
        if (res.ok) {
          setLogs(body.data);
        } else {
          setError(body.message || "Gagal memuat log audit.");
        }
      } catch (err) {
        setError("Terjadi kesalahan koneksi saat mengambil data log audit.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE_PROPERTY":
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-green-800 bg-green-950/40 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.12)] rounded-none">
            Tambah Properti
          </span>
        );
      case "UPDATE_PROPERTY":
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-[#C9A961]/40 bg-[#C9A961]/10 text-[#C9A961] shadow-[0_0_8px_rgba(201,169,97,0.12)] rounded-none">
            Ubah Properti
          </span>
        );
      case "DELETE_PROPERTY":
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-red-900/60 bg-red-950/40 text-[#B33A3A] shadow-[0_0_8px_rgba(179,58,58,0.12)] rounded-none">
            Hapus Properti
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-zinc-800 bg-zinc-900 text-zinc-400 rounded-none">
            {action}
          </span>
        );
    }
  };

  const renderDetails = (log: AuditLog) => {
    const details = log.details;
    if (!details) return null;

    if (log.action === "CREATE_PROPERTY") {
      return (
        <p className="text-zinc-400">
          Menambahkan properti baru <span className="font-semibold text-white">&ldquo;{details.nama_property}&rdquo;</span> (Tipe: {details.tipe}, ID: {details.propertyId?.substring(0, 8)}...)
        </p>
      );
    }

    if (log.action === "UPDATE_PROPERTY") {
      const changes = details.changes || {};
      const changedFields = Object.keys(changes);
      
      return (
        <div className="space-y-1">
          <p className="text-zinc-400">
            Mengubah properti <span className="font-semibold text-white">&ldquo;{details.nama_property}&rdquo;</span> (ID: {details.propertyId?.substring(0, 8)}...)
          </p>
          {changedFields.length > 0 ? (
            <div className="pl-4 border-l border-zinc-800 space-y-1.5 text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-550 uppercase tracking-wider text-[9px]">Perubahan:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                {changedFields.map((field) => {
                  let oldVal = changes[field].old;
                  let newVal = changes[field].new;

                  if (typeof oldVal === "boolean") oldVal = oldVal ? "Ya" : "Tidak";
                  if (typeof newVal === "boolean") newVal = newVal ? "Ya" : "Tidak";
                  if (Array.isArray(oldVal)) oldVal = oldVal.join(", ");
                  if (Array.isArray(newVal)) newVal = newVal.join(", ");

                  return (
                    <li key={field}>
                      <span className="font-medium text-zinc-500 capitalize">{field.replace("_", " ")}</span>: &ldquo;
                      <span className="text-red-400 line-through bg-red-950/30 px-1 border border-red-900/30">{String(oldVal || "-")}</span>&rdquo; menjadi &ldquo;
                      <span className="text-green-400 font-medium bg-green-950/30 px-1 border border-green-900/30">{String(newVal || "-")}</span>&rdquo;
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500 italic pl-4">Tidak ada field data utama yang berubah.</p>
          )}
        </div>
      );
    }

    if (log.action === "DELETE_PROPERTY") {
      return (
        <p className="text-zinc-450">
          Menghapus properti <span className="font-semibold text-red-400 line-through bg-red-950/30 px-1 border border-red-900/30">&ldquo;{details.nama_property}&rdquo;</span> (ID: {details.propertyId?.substring(0, 8)}...)
        </p>
      );
    }

    return <pre className="text-[10px] text-zinc-400 truncate bg-[#111111] p-2 border border-zinc-800">{JSON.stringify(details)}</pre>;
  };

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center uppercase">
          <History className="h-6 w-6 mr-2 text-[#C9A961]" />
          Log Audit Aktivitas
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-light">
          Riwayat pencatatan perubahan data properti oleh superadmin secara kronologis (Maksimal 100 log terbaru).
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 border border-zinc-900 bg-[#161616] shadow-xl">
          <Loader2 className="h-8 w-8 text-[#C9A961] animate-spin" />
          <span className="text-xs text-zinc-400 font-bold tracking-widest uppercase mt-3">Memuat riwayat log...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/45 border border-red-900 p-6 flex flex-col items-center justify-center text-center space-y-3 rounded-none shadow-md">
          <AlertTriangle className="h-10 w-10 text-[#B33A3A]" />
          <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Akses Terhambat</h4>
          <p className="text-xs text-red-300 max-w-sm leading-relaxed">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="border border-zinc-900 p-12 text-center text-zinc-500 bg-[#161616] shadow-xl">
          Belum ada riwayat aktivitas properti yang tercatat.
        </div>
      ) : (
        <div className="bg-[#161616] border border-zinc-900 rounded-none overflow-hidden shadow-2xl">
          <div className="divide-y divide-zinc-900">
            {logs.map((log) => (
              <div key={log.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-zinc-900/60 transition-colors">
                
                {/* Left Block: Action, User, & Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    {getActionBadge(log.action)}
                    <span className="text-[10px] text-zinc-550 font-mono">
                      ID: {log.id.substring(0, 8)}...
                    </span>
                  </div>
                  
                  {/* Log description rendering */}
                  <div className="text-xs sm:text-sm">
                    {renderDetails(log)}
                  </div>
                </div>

                {/* Right Block: Who and When */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0 text-xs flex-shrink-0 text-zinc-500">
                  <div className="flex items-center text-zinc-350 font-medium">
                    <User className="h-3.5 w-3.5 mr-1 text-[#C9A961]" />
                    <span className="font-semibold text-white">{log.user.nama}</span>
                    <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 ml-1.5 text-zinc-400 rounded-none">
                      {log.user.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-550 font-light">
                    {formatDate(log.created_at)} pukul {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
