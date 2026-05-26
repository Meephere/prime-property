"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Landmark, Shield } from "lucide-react";

interface HeaderProps {
  user: {
    nama: string;
    email: string;
    role: "ADMIN" | "SUPERADMIN" | string;
  };
}

export default function DashboardHeader({ user }: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/agent/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  return (
    <header className="bg-[#111111]/80 backdrop-blur-md border-b border-zinc-900 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Brand logo for small screens (hidden on desktop sidebar) */}
      <div className="flex items-center space-x-2 md:hidden">
        <Landmark className="h-6 w-6 text-[#C9A961]" />
        <span className="font-sans font-bold text-sm tracking-wider text-white">
          PRIME <span className="text-[#C9A961]">PROPERTY</span>
        </span>
      </div>

      <div className="hidden md:block">
        <h1 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">
          Sistem Informasi Manajemen Properti
        </h1>
      </div>

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-3 text-left focus:outline-none hover:bg-zinc-900 transition-all duration-300 group py-1.5 px-3 bg-[#161616] border border-zinc-800"
        >
          <div className="h-8 w-8 rounded-none bg-[#C9A961]/10 border border-[#C9A961]/30 flex items-center justify-center text-[#C9A961] font-bold text-sm">
            {user.nama.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
              {user.nama}
            </p>
            <p className="text-[10px] text-[#C9A961] font-semibold leading-none mt-1 uppercase flex items-center">
              {user.role === "SUPERADMIN" && <Shield className="h-2.5 w-2.5 mr-1" />}
              {user.role}
            </p>
          </div>
        </button>

        {dropdownOpen && (
          <>
            {/* Overlay click catcher */}
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
            <div className="absolute right-0 mt-2 w-56 bg-[#161616] border border-zinc-800 shadow-2xl z-20 rounded-none">
              <div className="p-4 border-b border-zinc-800">
                <p className="text-xs font-bold text-white truncate">{user.nama}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{user.email}</p>
              </div>
              
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
