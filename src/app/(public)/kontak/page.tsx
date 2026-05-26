"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, MapPin, Send, MessageSquare, AlertCircle, CheckCircle, Loader2, Sparkles } from "lucide-react";
import ElegantBackground from "@/components/elegant-bg";

// Schema validasi
const contactFormSchema = z.object({
  nama: z.string().min(3, "Nama wajib diisi & minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  nomor_hp: z.string().min(10, "Nomor HP minimal 10 digit").max(20, "Nomor HP maksimal 20 digit"),
  pesan: z.string().min(5, "Pesan minimal 5 karakter").max(1000, "Pesan maksimal 1000 karakter"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nama: "",
      email: "",
      nomor_hp: "",
      pesan: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    setToast(null);
    try {
      const response = await fetch("/api/kontak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setToast({
          type: "success",
          message: result.message || "Pesan terkirim, tim kami akan menghubungi Anda.",
        });
        reset();
      } else {
        setToast({
          type: "error",
          message: result.message || "Gagal mengirim pesan. Silakan coba kembali.",
        });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: "Terjadi kesalahan koneksi internet. Silakan periksa jaringan Anda.",
      });
    } finally {
      setLoading(false);
      // Auto dismiss toast after 6 seconds
      setTimeout(() => {
        setToast((prev) => (prev?.type === "success" ? null : prev));
      }, 6000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="bg-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-[#1A1A1A] relative overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background Ornaments */}
      <ElegantBackground />
      <div className="absolute top-1/4 left-10 inset-y-0 w-[1px] bg-zinc-200/50 pointer-events-none hidden xl:block"></div>
      <div className="absolute top-1/4 right-10 inset-y-0 w-[1px] bg-zinc-200/50 pointer-events-none hidden xl:block"></div>

      {/* Toast Alert */}
      <div className="fixed top-24 right-4 z-50 max-w-sm w-full">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`p-4 shadow-xl border flex items-start space-x-3 rounded-none backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-green-50/90 border-green-200 text-green-800"
                  : "bg-red-50/90 border-red-200 text-[#B33A3A]"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#B33A3A] mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider">
                  {toast.type === "success" ? "Sukses" : "Pemberitahuan"}
                </p>
                <p className="text-xs mt-1 leading-relaxed">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-sm hover:text-black opacity-70">
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-20 relative z-10 w-full"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A961] font-bold flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 mr-2 text-[#C9A961]" />
            GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1A1A] uppercase">
            HUBUNGI KAMI
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="h-[2px] bg-[#C9A961] mx-auto"
          />
          <p className="max-w-md mx-auto text-xs sm:text-sm text-zinc-650 font-light leading-relaxed">
            Tim kami siap membantu menjawab pertanyaan Anda seputar listing properti ruko dan villa premium.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Column 1: Info & Map */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8">
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F5F5F5] border border-zinc-200 p-6 flex flex-col items-center text-center space-y-2 rounded-none transition-all duration-300 hover:border-[#C9A961]/40 hover:shadow-md group">
                <Phone className="h-5 w-5 text-[#C9A961] group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-semibold">Telepon</span>
                <a href="tel:+6281234567890" className="text-[11px] font-bold text-zinc-800 hover:text-[#C9A961] transition-colors truncate w-full">
                  +62 812 3456 7890
                </a>
              </div>
              <div className="bg-[#F5F5F5] border border-zinc-200 p-6 flex flex-col items-center text-center space-y-2 rounded-none transition-all duration-300 hover:border-[#C9A961]/40 hover:shadow-md group">
                <Mail className="h-5 w-5 text-[#C9A961] group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-semibold">Email</span>
                <a href="mailto:info@primeproperty.com" className="text-[11px] font-bold text-zinc-800 hover:text-[#C9A961] transition-colors truncate w-full">
                  info@primeproperty.com
                </a>
              </div>
              <div className="bg-[#F5F5F5] border border-zinc-200 p-6 flex flex-col items-center text-center space-y-2 rounded-none transition-all duration-300 hover:border-[#C9A961]/40 hover:shadow-md group">
                <MessageSquare className="h-5 w-5 text-[#C9A961] group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-semibold">WhatsApp</span>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-zinc-800 hover:text-[#C9A961] transition-colors"
                >
                  Hubungi Agen
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="bg-[#F5F5F5] border border-zinc-200 p-6 flex items-start space-x-4 rounded-none transition-all duration-300 hover:border-[#C9A961]/35">
              <MapPin className="h-5 w-5 text-[#C9A961] flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Kantor Pusat</h4>
                <p className="text-xs sm:text-sm text-zinc-650 font-light mt-1 leading-relaxed">
                  Jl. Sudirman No. 88, Kav. 12-14, Jakarta Selatan, 12190, Indonesia
                </p>
              </div>
            </div>

            {/* Maps Embed with luxury feel */}
            <div className="bg-white border border-zinc-200 h-64 overflow-hidden relative group">
              <div className="absolute inset-0 border border-[#C9A961]/0 group-hover:border-[#C9A961]/30 transition-all duration-500 z-10 pointer-events-none"></div>
              <iframe
                title="Office Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.267207611681!2d106.8048259!3d-6.2284699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f14df834cc01%3A0x600f6b3e617d91e3!2sSCBD!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                className="w-full h-full grayscale opacity-85 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 border-none"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>

          {/* Column 2: Contact Form in Light Glass Panel */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-7 glass-panel-light p-8 sm:p-10 space-y-6 relative overflow-hidden rounded-none shadow-xl border border-zinc-200"
          >
            {/* Ambient gold glow in glass container */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#C9A961]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold tracking-wide text-[#1A1A1A] uppercase">Kirim Pesan</h3>
              <p className="text-xs text-zinc-550 mt-1 font-light">Silakan isi formulir di bawah ini untuk berdiskusi secara langsung dengan curator kami.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              {/* Nama */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.15em] text-zinc-550 font-bold" htmlFor="nama">Nama Lengkap</label>
                <input
                  id="nama"
                  type="text"
                  placeholder="Masukkan nama Anda"
                  {...register("nama")}
                  className={`w-full bg-white/70 backdrop-blur-sm border p-3.5 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:shadow-[0_0_15px_rgba(201,169,97,0.12)] text-[#1A1A1A] rounded-none transition-all duration-300 placeholder:text-zinc-400 ${
                    errors.nama ? "border-[#B33A3A] focus:ring-[#B33A3A]/45" : "border-zinc-200"
                  }`}
                />
                {errors.nama && (
                  <p className="text-[11px] text-[#B33A3A] mt-1.5 flex items-center font-medium">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.nama.message}
                  </p>
                )}
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-zinc-550 font-bold" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    {...register("email")}
                    className={`w-full bg-white/70 backdrop-blur-sm border p-3.5 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:shadow-[0_0_15px_rgba(201,169,97,0.12)] text-[#1A1A1A] rounded-none transition-all duration-300 placeholder:text-zinc-400 ${
                      errors.email ? "border-[#B33A3A] focus:ring-[#B33A3A]/45" : "border-zinc-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-[#B33A3A] mt-1.5 flex items-center font-medium">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Nomor HP */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-zinc-550 font-bold" htmlFor="nomor_hp">Nomor HP</label>
                  <input
                    id="nomor_hp"
                    type="tel"
                    placeholder="Minimal 10 digit"
                    {...register("nomor_hp")}
                    className={`w-full bg-white/70 backdrop-blur-sm border p-3.5 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:shadow-[0_0_15px_rgba(201,169,97,0.12)] text-[#1A1A1A] rounded-none transition-all duration-300 placeholder:text-zinc-400 ${
                      errors.nomor_hp ? "border-[#B33A3A] focus:ring-[#B33A3A]/45" : "border-zinc-200"
                    }`}
                  />
                  {errors.nomor_hp && (
                    <p className="text-[11px] text-[#B33A3A] mt-1.5 flex items-center font-medium">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.nomor_hp.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Pesan */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.15em] text-zinc-550 font-bold" htmlFor="pesan">Pesan Anda</label>
                <textarea
                  id="pesan"
                  rows={5}
                  placeholder="Detail properti yang ingin ditanyakan..."
                  {...register("pesan")}
                  className={`w-full bg-white/70 backdrop-blur-sm border p-3.5 text-xs focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:shadow-[0_0_15px_rgba(201,169,97,0.12)] text-[#1A1A1A] rounded-none transition-all duration-300 placeholder:text-zinc-400 resize-none ${
                    errors.pesan ? "border-[#B33A3A] focus:ring-[#B33A3A]/45" : "border-zinc-200"
                  }`}
                />
                {errors.pesan && (
                  <p className="text-[11px] text-[#B33A3A] mt-1.5 flex items-center font-medium">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.pesan.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-4 text-[10px] tracking-[0.2em] uppercase font-bold text-white bg-[#C9A961] hover:bg-[#Bca055] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C9A961]/10 hover:shadow-[#C9A961]/25 relative overflow-hidden group rounded-none"
              >
                {/* Subtle shine hover effect */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-20deg] -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out"></div>
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <span>Kirim Pesan</span>
                    <Send className="h-3 w-3 ml-2" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
