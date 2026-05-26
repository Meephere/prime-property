"use client";

import { useEffect, useState } from "react";
import { Loader2, History, AlertTriangle, User, Calendar, Search, Users, Sparkles, ShoppingBag, Eye } from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/utils";

interface AuditLog {
  id: string;
  userId: string;
  action: "CREATE_PROPERTY" | "UPDATE_PROPERTY" | "DELETE_PROPERTY" | "VIEW_PROPERTY" | string;
  details: any;
  created_at: string;
  user: {
    nama: string;
    email: string;
    role: string;
  };
}

interface UserItem {
  id: string;
  nama: string;
  email: string;
  role: string;
}

interface SummaryStats {
  latestAdded: any[];
  latestSold: any[];
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({ latestAdded: [], latestSold: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [userIdFilter, setUserIdFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const fetchLogs = async (useFilters = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (useFilters) {
        if (userIdFilter) params.set("userId", userIdFilter);
        if (searchFilter) params.set("search", searchFilter);
        if (startDateFilter) params.set("startDate", startDateFilter);
        if (endDateFilter) params.set("endDate", endDateFilter);
      }

      const res = await fetch(`/api/audit-log?${params.toString()}`);
      const body = await res.json();
      
      if (res.ok) {
        setLogs(body.data || []);
        if (body.users) setUsers(body.users);
        if (body.summary) setSummary(body.summary);
      } else {
        setError(body.message || "Gagal memuat log audit.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi saat mengambil data log audit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(true);
  };

  const handleResetFilters = () => {
    setUserIdFilter("");
    setSearchFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    
    // Fetch logs immediately without filter parameters
    setLoading(true);
    fetch("/api/audit-log")
      .then((res) => res.json())
      .then((body) => {
        setLogs(body.data || []);
        if (body.users) setUsers(body.users);
        if (body.summary) setSummary(body.summary);
      })
      .catch(() => setError("Terjadi kesalahan koneksi saat me-reset filter."))
      .finally(() => setLoading(false));
  };

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
      case "VIEW_PROPERTY":
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-blue-900/60 bg-blue-950/40 text-blue-405 shadow-[0_0_8px_rgba(59,130,246,0.12)] rounded-none">
            Akses Detail
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
                      <span className="font-medium text-zinc-550 capitalize">{field.replace("_", " ")}</span>: &ldquo;
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

    if (log.action === "VIEW_PROPERTY") {
      return (
        <p className="text-zinc-400">
          Melihat detail properti <span className="font-semibold text-white">&ldquo;{details.nama_property}&rdquo;</span> (ID: {details.propertyId?.substring(0, 8)}...)
        </p>
      );
    }

    return <pre className="text-[10px] text-zinc-400 truncate bg-[#111111] p-2 border border-zinc-800">{JSON.stringify(details)}</pre>;
  };

  return (
    <div className="space-y-8 text-zinc-300 pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center uppercase">
          <History className="h-6 w-6 mr-2 text-[#C9A961]" />
          Log Audit Aktivitas & Analitik
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-light">
          Pantau riwayat penambahan, modifikasi, penghapusan, dan log akses detail properti oleh admin secara real-time.
        </p>
      </div>

      {/* 1. Dashboard Activity Summary Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Added Properties */}
        <div className="bg-[#161616] border border-zinc-900 p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-[#C9A961]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">5 Properti Terbaru Ditambahkan</h3>
          </div>
          
          <div className="space-y-3">
            {summary.latestAdded.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Tidak ada data penambahan.</p>
            ) : (
              summary.latestAdded.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-[#1F1F1F]/40 border border-zinc-850 hover:border-zinc-800 transition-all">
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider">{p.nama_property}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {p.tipe} • {p.kawasan.join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#C9A961]">{formatRupiah(p.price)}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">
                      {formatDate(p.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Sold Properties */}
        <div className="bg-[#161616] border border-zinc-900 p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
            <ShoppingBag className="h-4.5 w-4.5 text-green-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">5 Properti Terbaru Terjual (Sold Out)</h3>
          </div>
          
          <div className="space-y-3">
            {summary.latestSold.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Belum ada properti berstatus sold out.</p>
            ) : (
              summary.latestSold.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-[#1F1F1F]/40 border border-zinc-850 hover:border-zinc-800 transition-all">
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider line-through decoration-zinc-650">{p.nama_property}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {p.tipe} • {p.kawasan.join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{formatRupiah(p.price)}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">
                      Sold: {formatDate(p.updated_at || p.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 2. Advanced Filters Panel */}
      <form onSubmit={handleApplyFilters} className="bg-[#161616] border border-zinc-900 p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-900 pb-2">
          <Search className="h-4.5 w-4.5 text-[#C9A961]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Filter Log Audit Lanjutan</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center">
              <Users className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
              Pelaku Aktivitas (User)
            </label>
            <select
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961]"
            >
              <option value="">Semua Admin/User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Property search */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center">
              <Search className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
              Nama Properti / ID
            </label>
            <input
              type="text"
              placeholder="Cari nama properti..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961]"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
              Mulai Tanggal
            </label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full bg-[#111111] border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961]"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 border border-zinc-850 hover:bg-zinc-900 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-zinc-400 hover:text-white"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#C9A961] hover:bg-[#bca055] text-[#161616] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Terapkan Filter
          </button>
        </div>
      </form>

      {/* 3. Log Output List */}
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
          Tidak ada riwayat aktivitas properti yang cocok dengan kriteria filter.
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
                    <span className="text-[10px] text-zinc-500 font-mono">
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
                  <div className="flex items-center text-zinc-300 font-medium">
                    <User className="h-3.5 w-3.5 mr-1 text-[#C9A961]" />
                    <span className="font-semibold text-white">{log.user.nama}</span>
                    <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 ml-1.5 text-zinc-400 rounded-none">
                      {log.user.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-light">
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
