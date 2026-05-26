"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Users, UserPlus, Shield, ShieldAlert, Key, 
  ToggleLeft, ToggleRight, Loader2, AlertCircle, 
  CheckCircle2, X, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminUser {
  id: string;
  nama: string;
  email: string;
  role: string;
  status: "ACTIVE" | "DISABLED";
  created_at: string;
}

const createAdminSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter").max(50, "Nama maksimal 50 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Sandi minimal 8 karakter"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Sandi minimal 8 karakter"),
});

type CreateAdminForm = z.infer<typeof createAdminSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  // Form states
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreateForm,
    formState: { errors: createErrors },
  } = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    reset: resetPasswordForm,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const result = await res.json();
        setAdmins(result.data);
      } else {
        showToast("error", "Gagal memuat daftar admin.");
      }
    } catch (err) {
      showToast("error", "Gagal memuat data. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Handle Create Admin
  const onCreateSubmit = async (data: CreateAdminForm) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        showToast("success", result.message || "Admin baru berhasil dibuat.");
        setIsCreateOpen(false);
        resetCreateForm();
        fetchAdmins();
      } else {
        showToast("error", result.message || "Gagal membuat akun admin.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan sistem.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async () => {
    if (!selectedAdmin) return;
    setActionLoading(true);
    const newStatus = selectedAdmin.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/${selectedAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();

      if (res.ok) {
        showToast("success", result.message);
        setIsStatusOpen(false);
        setSelectedAdmin(null);
        fetchAdmins();
      } else {
        showToast("error", result.message || "Gagal mengubah status admin.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan sistem.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reset Password
  const onResetSubmit = async (data: ResetPasswordForm) => {
    if (!selectedAdmin) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/${selectedAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });
      const result = await res.json();

      if (res.ok) {
        showToast("success", result.message);
        setIsResetOpen(false);
        resetPasswordForm();
        setSelectedAdmin(null);
      } else {
        showToast("error", result.message || "Gagal mereset sandi.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan sistem.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative pb-12 text-zinc-300">
      {/* Toast Alert */}
      <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`p-4 shadow-xl border flex items-start space-x-3 rounded-none backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-green-950/80 border-green-800 text-green-400"
                  : "bg-red-950/80 border-red-900 text-red-400"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
              ) : (
                <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider">
                  {toast.type === "success" ? "Sukses" : "Pemberitahuan"}
                </p>
                <p className="text-xs mt-1 leading-relaxed">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-sm hover:text-white opacity-70">
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2 uppercase">
            <Shield className="h-6 w-6 text-[#C9A961]" />
            Kelola Akun Administrator
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Daftar, buat akun baru, aktifkan/nonaktifkan, serta reset kata sandi seluruh agent bertipe ADMIN.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-xs tracking-wider uppercase font-bold text-[#161616] bg-[#C9A961] hover:bg-[#bca055] transition-all duration-300 shadow-lg shadow-[#C9A961]/10 hover:shadow-[#C9A961]/25 rounded-none"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          <span>Tambah Admin Baru</span>
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="bg-[#161616] border border-zinc-900 relative overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#111111]/70 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 text-[#C9A961] animate-spin" />
            <span className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Memuat data...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-[#161616]">
            <Users className="h-12 w-12 text-zinc-650" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-400">Belum ada akun admin terdaftar</p>
              <p className="text-xs text-zinc-500">Gunakan tombol "Tambah Admin Baru" di atas untuk membuat akun pertama.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#161616]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-[#1F1F1F]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nama</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tanggal Dibuat</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs">
                {admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-white uppercase">{adm.nama}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-zinc-400">{adm.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-none border ${
                        adm.status === "ACTIVE"
                          ? "bg-green-950/40 border-green-800 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                          : "bg-red-950/40 border-red-900/60 text-[#B33A3A] shadow-[0_0_10px_rgba(179,58,58,0.15)]"
                      }`}>
                        {adm.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] text-zinc-400">
                        {new Date(adm.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center space-x-2">
                        {/* Status Toggle Button */}
                        <button
                          onClick={() => {
                            setSelectedAdmin(adm);
                            setIsStatusOpen(true);
                          }}
                          title={adm.status === "ACTIVE" ? "Nonaktifkan akun" : "Aktifkan akun"}
                          className={`p-1.5 border border-zinc-800 hover:border-zinc-700 bg-[#111111] transition-all cursor-pointer ${
                            adm.status === "ACTIVE" 
                              ? "text-green-500 hover:text-green-400"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {adm.status === "ACTIVE" ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
 
                        {/* Reset Password Button */}
                        <button
                          onClick={() => {
                            setSelectedAdmin(adm);
                            setIsResetOpen(true);
                          }}
                          title="Reset Kata Sandi"
                          className="p-1.5 border border-zinc-800 hover:border-zinc-700 text-[#C9A961] hover:text-[#e2c98a] bg-[#111111] transition-all cursor-pointer"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ADMIN MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3 }}
              className="bg-[#161616] border border-zinc-900 w-full max-w-md p-6 relative z-10 shadow-2xl space-y-6 text-zinc-300 rounded-none"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4 text-[#C9A961]" />
                  Tambah Akun Admin
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-zinc-450 hover:text-white cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
                {/* Nama */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider" htmlFor="nama">
                    Nama Lengkap
                  </label>
                  <input
                    id="nama"
                    type="text"
                    placeholder="Nama Lengkap Agen"
                    {...registerCreate("nama")}
                    className={`w-full bg-[#111111] border px-3 py-2.5 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 text-white rounded-none placeholder-zinc-500 transition-all duration-300 ${
                      createErrors.nama ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                    }`}
                  />
                  {createErrors.nama && (
                    <p className="text-[10px] text-[#B33A3A] mt-1.5 flex items-center font-medium">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {createErrors.nama.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="agen@primeproperty.com"
                    {...registerCreate("email")}
                    className={`w-full bg-[#111111] border px-3 py-2.5 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 text-white rounded-none placeholder-zinc-500 transition-all duration-300 ${
                      createErrors.email ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                    }`}
                  />
                  {createErrors.email && (
                    <p className="text-[10px] text-[#B33A3A] mt-1.5 flex items-center font-medium">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {createErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider" htmlFor="password">
                    Kata Sandi (Min. 8 Karakter)
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerCreate("password")}
                      className={`w-full bg-[#111111] border pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 text-white rounded-none placeholder-zinc-500 transition-all duration-300 ${
                        createErrors.password ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {createErrors.password && (
                    <p className="text-[10px] text-[#B33A3A] mt-1.5 flex items-center font-medium">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {createErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="w-1/2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-none cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-1/2 bg-[#C9A961] hover:bg-[#bca055] disabled:opacity-50 text-[#161616] font-bold px-4 py-2.5 text-xs uppercase tracking-wider rounded-none inline-flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg shadow-[#C9A961]/10"
                  >
                    {actionLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                    Simpan Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESET PASSWORD MODAL */}
      <AnimatePresence>
        {isResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#161616] border border-zinc-900 w-full max-w-sm p-6 relative z-10 shadow-2xl space-y-6 text-zinc-300 rounded-none"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-[#C9A961]" />
                  Reset Kata Sandi
                </h3>
                <button onClick={() => setIsResetOpen(false)} className="text-zinc-450 hover:text-white cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-zinc-500">
                  Masukkan kata sandi baru untuk administrator:
                </p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">{selectedAdmin?.nama}</p>
              </div>

              <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider" htmlFor="new_password">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerReset("password")}
                      className={`w-full bg-[#111111] border pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 text-white rounded-none placeholder-zinc-500 transition-all duration-300 ${
                        resetErrors.password ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {resetErrors.password && (
                    <p className="text-[10px] text-[#B33A3A] mt-1.5 flex items-center font-medium">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {resetErrors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="w-1/2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-none cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-1/2 bg-[#C9A961] hover:bg-[#bca055] disabled:opacity-50 text-[#161616] font-bold px-4 py-2.5 text-xs uppercase tracking-wider rounded-none inline-flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg shadow-[#C9A961]/10"
                  >
                    {actionLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                    Reset Sandi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOGGLE STATUS CONFIRMATION MODAL */}
      <AnimatePresence>
        {isStatusOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStatusOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#161616] border border-zinc-900 w-full max-w-sm p-6 relative z-10 shadow-2xl space-y-6 text-zinc-300 rounded-none"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-[#C9A961]" />
                  Konfirmasi Status Akun
                </h3>
                <button onClick={() => setIsStatusOpen(false)} className="text-zinc-450 hover:text-white cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Apakah Anda yakin ingin {selectedAdmin?.status === "ACTIVE" ? "menonaktifkan (disable)" : "mengaktifkan kembali (enable)"} akun admin berikut?
                </p>
                <div className="bg-[#1F1F1F] p-3 border border-zinc-800">
                  <p className="text-xs font-bold text-white uppercase tracking-wider leading-none">{selectedAdmin?.nama}</p>
                  <p className="text-[10px] text-zinc-500 mt-1.5 leading-none">{selectedAdmin?.email}</p>
                </div>
                {selectedAdmin?.status === "ACTIVE" && (
                  <p className="text-[10px] text-[#B33A3A] leading-normal flex items-start">
                    <AlertCircle className="h-3.5 w-3.5 mr-1 text-[#B33A3A] flex-shrink-0 mt-0.5" />
                    <span>Akun yang dinonaktifkan tidak akan dapat masuk ke dalam Portal Agent sampai diaktifkan kembali.</span>
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusOpen(false)}
                  className="w-1/2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-none cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  className={`w-1/2 text-white font-bold px-4 py-2.5 text-xs uppercase tracking-wider rounded-none inline-flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    selectedAdmin?.status === "ACTIVE"
                      ? "bg-[#B33A3A] hover:bg-[#c94b4b] shadow-lg shadow-red-950/20"
                      : "bg-[#C9A961] hover:bg-[#bca055] text-[#161616] shadow-lg shadow-[#C9A961]/10"
                  }`}
                >
                  {actionLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                  Ya, Ubah Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
