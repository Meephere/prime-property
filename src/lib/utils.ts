import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number | bigint | string | any): string {
  if (value === undefined || value === null) return "Rp 0";
  
  const numValue = typeof value === "bigint" 
    ? Number(value) 
    : typeof value === "string" 
      ? Number(value) 
      : value;

  if (isNaN(numValue)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

export function formatDimensions(lebar: number | string | any, panjang: number | string | any): string {
  const w = parseFloat(lebar?.toString() || "0");
  const l = parseFloat(panjang?.toString() || "0");
  
  // Format to 2 decimal places maximum, removing trailing zeros
  const formatNum = (num: number) => {
    return parseFloat(num.toFixed(2)).toString();
  };

  return `${formatNum(w)} × ${formatNum(l)} m`;
}

export function formatDate(dateInput: Date | string | number | any): string {
  if (!dateInput) return "-";
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
