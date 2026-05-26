"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Landmark, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

import ElegantBackground from "@/components/elegant-bg";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AgentLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Successful login
        router.push("/agent/dashboard");
      } else {
        // Handle error messages from backend
        setErrorMessage(result.message || "Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.");
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan koneksi. Silakan periksa jaringan internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Aesthetic background elements */}
      <ElegantBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8 bg-[#F5F5F5] border border-zinc-200 p-8 sm:p-10 shadow-xl relative z-10"
      >
        {/* Logo and Headings */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full border border-[#C9A961]/20 bg-white shadow-sm">
            <Landmark className="h-8 w-8 text-[#C9A961]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-wider text-[#1A1A1A] uppercase font-sans">
              PRIME <span className="text-[#C9A961]">PROPERTY</span>
            </h2>
            <p className="text-xs text-zinc-550 uppercase tracking-widest font-semibold">
              Internal Agent Login
            </p>
          </div>
        </div>

        {/* Error Message Box */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 p-4 flex items-start space-x-3 text-red-800 text-xs sm:text-sm rounded-none"
            >
              <AlertCircle className="h-5 w-5 text-[#B33A3A] flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed flex-1">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-zinc-650 font-semibold" htmlFor="email">
              Email Agen
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="nama@primeproperty.com"
                {...register("email")}
                className={`w-full bg-white border pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A961] text-[#1A1A1A] rounded-none ${
                  errors.email ? "border-[#B33A3A]" : "border-zinc-250"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-[#B33A3A] mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-zinc-650 font-semibold" htmlFor="password">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full bg-white border pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A961] text-[#1A1A1A] rounded-none ${
                  errors.password ? "border-[#B33A3A]" : "border-zinc-250"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-black"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#B33A3A] mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-white bg-[#C9A961] hover:bg-[#E2C98A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <span>Masuk Ke Portal</span>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2">
          <a href="/" className="text-xs text-zinc-500 hover:text-[#C9A961] transition-colors">
            ← Kembali ke Beranda Utama
          </a>
        </div>
      </motion.div>
    </div>
  );
}
