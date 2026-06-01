"use client";

import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, AlertCircle, Save, PlusCircle, Check } from "lucide-react";
import { createPortal } from "react-dom";

import { Property } from "@/types/property";

interface FormModalProps {
  property: Property | null; // null for Create, actual object for Update
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string, highlightId?: string) => void;
}

const KAWASAN_OPTIONS = ["Krakatau", "Pancing", "Cemara Asri", "Helvetia", "Tembung", "Setiabudi", "Ringroad", "Johor"];
const HADAP_OPTIONS = ["Utara", "Selatan", "Timur", "Barat"];

// Zod Schema
const propertyFormSchema = z.object({
  nama_property: z.string().min(3, "Nama properti minimal 3 karakter").max(100, "Nama properti maksimal 100 karakter"),
  group: z.string().nullable().optional(),
  lebar: z.number({ message: "Lebar harus berupa angka" }).positive("Lebar harus lebih besar dari 0"),
  panjang: z.number({ message: "Panjang harus berupa angka" }).positive("Panjang harus lebih besar dari 0"),
  hadap: z.array(z.enum(["Utara", "Selatan", "Timur", "Barat"])).min(1, "Pilih minimal 1 arah hadap"),
  tipe: z.enum(["Ruko", "Villa"]),
  tingkat: z.number({ message: "Tingkat harus berupa angka" }).min(1, "Tingkat minimal 1").max(10, "Tingkat maksimal 10"),
  price: z.number({ message: "Harga harus berupa angka" }).int("Harga harus berupa bilangan bulat").positive("Harga harus lebih besar dari 0"),
  carport: z.boolean(),
  status: z.enum(["in_stock", "sold_out"]),
  siap: z.enum(["siap_huni", "siap_kosong", "siap_huni_renovasi"]),
  maps_link: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    return val.includes("google.com/maps");
  }, "URL harus valid berisi domain google.com/maps"),
  kawasan: z.array(z.string()).min(1, "Pilih minimal 1 kawasan"),
  unit: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof propertyFormSchema>;

export default function PropertyFormModal({ property, isOpen, onClose, onSuccess }: FormModalProps) {
  const isEdit = !!property;
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Custom tag states for kawasan
  const [customKawasan, setCustomKawasan] = useState("");
  const [availableKawasan, setAvailableKawasan] = useState(KAWASAN_OPTIONS);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      nama_property: "",
      group: "",
      lebar: 0,
      panjang: 0,
      hadap: [],
      tipe: "Villa",
      tingkat: 1,
      price: 0,
      carport: false,
      status: "in_stock",
      siap: "siap_huni",
      maps_link: "",
      kawasan: [],
      unit: "",
      images: [],
    },
  });

  const watchedHadap = watch("hadap") || [];
  const watchedKawasan = watch("kawasan") || [];
  const watchedImages = watch("images") || [];

  // Prefill form when editing
  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      if (isEdit && property) {
        // Collect custom kawasan tags if any
        const allKawasan = [...KAWASAN_OPTIONS];
        property.kawasan.forEach(k => {
          if (!allKawasan.includes(k)) allKawasan.push(k);
        });
        setAvailableKawasan(allKawasan);

        reset({
          nama_property: property.nama_property,
          group: property.group || "",
          lebar: property.lebar,
          panjang: property.panjang,
          hadap: property.hadap as any,
          tipe: property.tipe as any,
          tingkat: property.tingkat,
          price: property.price,
          carport: property.carport,
          status: property.status as any,
          siap: property.siap as any,
          maps_link: property.maps_link || "",
          kawasan: property.kawasan,
          unit: property.unit || "",
          images: property.images || [],
        });
      } else {
        setAvailableKawasan(KAWASAN_OPTIONS);
        reset({
          nama_property: "",
          group: "",
          lebar: "" as any,
          panjang: "" as any,
          hadap: [],
          tipe: "Villa",
          tingkat: 1,
          price: "" as any,
          carport: false,
          status: "in_stock",
          siap: "siap_huni",
          maps_link: "",
          kawasan: [],
          unit: "",
          images: [],
        });
      }
    }
  }, [isOpen, property, reset]);

  const handleHadapCheckboxChange = (direction: string) => {
    const current = [...watchedHadap];
    if (current.includes(direction as any)) {
      setValue("hadap", current.filter(x => x !== direction) as any, { shouldDirty: true });
    } else {
      setValue("hadap", [...current, direction] as any, { shouldDirty: true });
    }
  };

  const handleKawasanCheckboxChange = (kws: string) => {
    const current = [...watchedKawasan];
    if (current.includes(kws)) {
      setValue("kawasan", current.filter(x => x !== kws), { shouldDirty: true });
    } else {
      setValue("kawasan", [...current, kws], { shouldDirty: true });
    }
  };

  const addCustomKawasan = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!customKawasan.trim()) return;
    const tag = customKawasan.trim();
    if (!availableKawasan.includes(tag)) {
      setAvailableKawasan([...availableKawasan, tag]);
    }
    if (!watchedKawasan.includes(tag)) {
      setValue("kawasan", [...watchedKawasan, tag], { shouldDirty: true });
    }
    setCustomKawasan("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    setSubmitError(null);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/properti/upload", {
          method: "POST",
          body: formData,
        });
        
        const result = await res.json();
        if (res.ok) {
          const currentImages = watch("images") || [];
          setValue("images", [...currentImages, result.url], { shouldDirty: true });
        } else {
          setSubmitError(result.message || "Gagal mengunggah foto.");
        }
      }
    } catch (err) {
      setSubmitError("Terjadi kesalahan jaringan saat mengunggah.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    const currentImages = watch("images") || [];
    setValue("images", currentImages.filter(url => url !== imgUrl), { shouldDirty: true });
  };

  const handleFormSubmit = async (values: FormValues, submitAndAddMore = false) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const url = isEdit ? `/api/properti/${property!.id}` : "/api/properti";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess(result.message, result.data?.id);
        if (submitAndAddMore && !isEdit) {
          // Clear and reset form for next quick entry
          reset({
            nama_property: "",
            group: "",
            lebar: "" as any,
            panjang: "" as any,
            hadap: [],
            tipe: "Villa",
            tingkat: 1,
            price: "" as any,
            carport: false,
            status: "in_stock",
            siap: "siap_huni",
            maps_link: "",
            kawasan: [],
            unit: "",
            images: [],
          });
        } else {
          onClose();
        }
      } else {
        setSubmitError(result.message || "Terjadi kesalahan saat menyimpan data properti.");
      }
    } catch (err) {
      setSubmitError("Terjadi kesalahan koneksi jaringan. Gagal menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative bg-[#161616] border border-zinc-900 w-full max-w-2xl max-h-[90vh] flex flex-col justify-between shadow-2xl z-[1000] text-zinc-300 overflow-hidden rounded-none">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-[#1F1F1F]">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {isEdit ? "Edit Data Properti" : "Tambah Properti Baru"}
            </h3>
            {isDirty && (
              <span className="px-2 py-0.5 text-[9px] bg-[#C9A961]/10 border border-[#C9A961]/30 text-[#C9A961] uppercase tracking-widest font-semibold animate-pulse">
                Ada Perubahan
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit((data) => handleFormSubmit(data, false))}
          className="flex-1 overflow-y-auto p-6 space-y-6 dashboard-scroll"
        >
          {submitError && (
            <div className="bg-red-950/45 border border-red-900 text-xs text-red-400 p-4 flex items-start space-x-3 shadow-md rounded-none">
              <AlertCircle className="h-4 w-4 text-[#B33A3A] flex-shrink-0 mt-0.5" />
              <p>{submitError}</p>
            </div>
          )}

          {/* Grid 2 Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nama Properti */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Nama Properti *</label>
              <input
                type="text"
                placeholder="Contoh: Villa Aston Signature"
                {...register("nama_property")}
                className={`w-full bg-[#111111] border p-2.5 text-xs text-white focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:bg-[#1a1a1a] rounded-none placeholder-zinc-500 transition-all duration-300 ${
                  errors.nama_property ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                }`}
              />
              {errors.nama_property && (
                <p className="text-[10px] text-[#B33A3A] flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.nama_property.message}
                </p>
              )}
            </div>

            {/* Group */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Group / Cluster</label>
              <input
                type="text"
                placeholder="Contoh: Royal Residence"
                {...register("group")}
                className="w-full bg-[#111111] border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:bg-[#1a1a1a] rounded-none placeholder-zinc-500 transition-all duration-300"
              />
            </div>

            {/* Lebar */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Lebar (meter) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="Contoh: 6.5"
                {...register("lebar", { valueAsNumber: true })}
                className={`w-full bg-[#111111] border p-2.5 text-xs text-white focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:bg-[#1a1a1a] rounded-none placeholder-zinc-500 transition-all duration-300 ${
                  errors.lebar ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                }`}
              />
              {errors.lebar && (
                <p className="text-[10px] text-[#B33A3A] flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.lebar.message}
                </p>
              )}
            </div>

            {/* Panjang */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Panjang (meter) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="Contoh: 18"
                {...register("panjang", { valueAsNumber: true })}
                className={`w-full bg-[#111111] border p-2.5 text-xs text-white focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:bg-[#1a1a1a] rounded-none placeholder-zinc-500 transition-all duration-300 ${
                  errors.panjang ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                }`}
              />
              {errors.panjang && (
                <p className="text-[10px] text-[#B33A3A] flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.panjang.message}
                </p>
              )}
            </div>

            {/* Tipe Properti */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Tipe Properti *</label>
              <div className="flex space-x-6 pt-1">
                {["Villa", "Ruko"].map((type) => (
                  <label key={type} className="flex items-center text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors duration-150">
                    <input
                      type="radio"
                      value={type}
                      {...register("tipe")}
                      className="mr-2 accent-[#C9A961]"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tingkat */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Jumlah Lantai *</label>
              <input
                type="number"
                step="0.5"
                placeholder="Contoh: 2.5"
                {...register("tingkat", { valueAsNumber: true })}
                className={`w-full bg-[#111111] border p-2.5 text-xs text-white focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:bg-[#1a1a1a] rounded-none placeholder-zinc-500 transition-all duration-300 ${
                  errors.tingkat ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                }`}
              />
              {errors.tingkat && (
                <p className="text-[10px] text-[#B33A3A] flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.tingkat.message}
                </p>
              )}
            </div>

            {/* Harga */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Nilai Investasi (Rupiah) *</label>
              <input
                type="number"
                placeholder="Masukkan nominal penuh, contoh: 1350000000"
                {...register("price", { valueAsNumber: true })}
                className={`w-full bg-[#111111] border p-2.5 text-xs text-white focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 focus:bg-[#1a1a1a] rounded-none placeholder-zinc-500 transition-all duration-300 ${
                  errors.price ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                }`}
              />
              {errors.price && (
                <p className="text-[10px] text-[#B33A3A] flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Carport */}
            <div className="flex items-center h-full pt-4">
              <label className="flex items-center text-xs text-zinc-400 cursor-pointer hover:text-white select-none">
                <input
                  type="checkbox"
                  {...register("carport")}
                  className="mr-2.5 accent-[#C9A961] h-4 w-4"
                />
                <span className="font-semibold uppercase tracking-wider">Memiliki Area Carport</span>
              </label>
            </div>

            {/* Status Stock */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Status Ketersediaan *</label>
              <div className="flex space-x-6 pt-1">
                {[
                  { label: "In Stock", value: "in_stock" },
                  { label: "Sold Out", value: "sold_out" },
                ].map((s) => (
                  <label key={s.value} className="flex items-center text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors duration-150">
                    <input
                      type="radio"
                      value={s.value}
                      {...register("status")}
                      className="mr-2 accent-[#C9A961]"
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Siap Ketersediaan */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Kondisi Kesiapan Unit *</label>
              <select
                {...register("siap")}
                className="w-full bg-[#111111] border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/40 rounded-none cursor-pointer"
              >
                <option value="siap_huni">Siap Huni</option>
                <option value="siap_kosong">Siap Kosong</option>
                <option value="siap_huni_renovasi">Siap Huni Renovasi</option>
              </select>
            </div>

            {/* Kawasan Multi-select checkboxes */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Kawasan Lokasi (Minimal Pilih 1) *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {availableKawasan.map((item) => {
                  const isChecked = watchedKawasan.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleKawasanCheckboxChange(item)}
                      className={`flex items-center px-3 py-2 text-left border text-xs transition-colors duration-150 rounded-none cursor-pointer ${
                        isChecked 
                          ? "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961] font-semibold" 
                          : "border-zinc-800 bg-[#111111] text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className={`h-3 w-3 border border-zinc-800 mr-2 flex items-center justify-center bg-[#161616] ${isChecked ? "border-[#C9A961]" : ""}`}>
                        {isChecked && <Check className="h-2 w-2 text-[#C9A961]" />}
                      </div>
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Add custom kawasan */}
              <div className="flex space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="Kawasan Lain..."
                  value={customKawasan}
                  onChange={(e) => setCustomKawasan(e.target.value)}
                  className="bg-[#111111] border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C9A961] rounded-none max-w-[200px]"
                />
                <button
                  type="button"
                  onClick={addCustomKawasan}
                  className="px-4 py-1.5 bg-[#1F1F1F] hover:bg-[#C9A961] hover:text-white border border-zinc-800 hover:border-[#C9A961] text-[#C9A961] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Tambah
                </button>
              </div>
              
              {errors.kawasan && (
                <p className="text-[10px] text-[#B33A3A] flex items-center mt-1.5 font-medium">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.kawasan.message}
                </p>
              )}
            </div>

            {/* Arah Hadap Multi-select checkboxes */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Arah Hadap (Minimal Pilih 1) *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {HADAP_OPTIONS.map((item) => {
                  const isChecked = watchedHadap.includes(item as any);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleHadapCheckboxChange(item)}
                      className={`flex items-center px-3 py-2 text-left border text-xs transition-colors duration-150 rounded-none cursor-pointer ${
                        isChecked 
                          ? "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961] font-semibold" 
                          : "border-zinc-800 bg-[#111111] text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className={`h-3 w-3 border border-zinc-800 mr-2 flex items-center justify-center bg-[#161616] ${isChecked ? "border-[#C9A961]" : ""}`}>
                        {isChecked && <Check className="h-2 w-2 text-[#C9A961]" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
              {errors.hadap && (
                <p className="text-[10px] text-[#B33A3A] flex items-center mt-1.5 font-medium">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.hadap.message}
                </p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Keterangan Unit</label>
              <input
                type="text"
                placeholder="Contoh: Ready Siap Huni, Ruko Sudut, dll."
                {...register("unit")}
                className="w-full bg-[#111111] border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:ring-[#C9A961]/40 rounded-none focus:bg-[#1a1a1a] placeholder-zinc-555 transition-colors"
              />
            </div>

            {/* Google Maps Link */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Link Google Maps</label>
              <input
                type="text"
                placeholder="Harus berupa URL valid google.com/maps"
                {...register("maps_link")}
                className={`w-full bg-[#111111] border p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C9A961] focus:bg-[#1a1a1a] rounded-none placeholder-zinc-500 transition-all duration-300 ${
                  errors.maps_link ? "border-[#B33A3A] focus:ring-[#B33A3A]/40" : "border-zinc-800"
                }`}
              />
              {errors.maps_link && (
                <p className="text-[10px] text-[#B33A3A] flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.maps_link.message}
                </p>
              )}
            </div>

            {/* Foto Properti */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                <span>Foto Properti (Maksimal 5 Foto)</span>
                {uploadingImage && (
                  <span className="flex items-center text-[10px] text-[#C9A961] uppercase tracking-wider font-medium animate-pulse">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Mengunggah...
                  </span>
                )}
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {/* Preview Gambar */}
                {watchedImages.map((url, index) => (
                  <div key={url} className="relative aspect-video sm:aspect-square bg-zinc-900 border border-zinc-800 group overflow-hidden">
                    <img
                      src={url}
                      alt={`Foto Properti ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-red-950 border border-zinc-850 text-white rounded-none cursor-pointer transition-colors duration-150"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] text-zinc-400 font-medium border-t border-zinc-900">
                      Foto {index + 1}
                    </div>
                  </div>
                ))}

                {/* Dropzone Upload Button */}
                {watchedImages.length < 5 && (
                  <label className="relative aspect-video sm:aspect-square bg-[#111111] hover:bg-[#1a1a1a] border border-dashed border-zinc-800 hover:border-[#C9A961]/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <PlusCircle className="h-5 w-5 text-zinc-500 group-hover:text-[#C9A961] mb-1.5 transition-colors duration-300" />
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 font-semibold transition-colors duration-300">
                      Unggah Foto
                    </span>
                  </label>
                )}
              </div>
            </div>

          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-end gap-3 bg-[#1F1F1F]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 border border-zinc-800 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Batal
          </button>
          
          {/* Simpan & Tambah Lagi (Only for Create Modal) */}
          {!isEdit && (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit((data) => handleFormSubmit(data, true))}
              className="w-full sm:w-auto px-5 py-2.5 border border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961] hover:text-[#161616] text-xs font-bold uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <PlusCircle className="h-3.5 w-3.5 mr-2" />
              )}
              <span>Simpan & Tambah Lagi</span>
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit((data) => handleFormSubmit(data, false))}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#C9A961] hover:bg-[#bca055] text-[#161616] hover:text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center cursor-pointer shadow-lg shadow-[#C9A961]/10"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-2" />
            )}
            <span>Simpan</span>
          </button>
        </div>

      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
