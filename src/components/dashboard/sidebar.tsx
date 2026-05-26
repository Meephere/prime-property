"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, ListCollapse, History, LogOut, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  role: "ADMIN" | "SUPERADMIN" | string;
}

export default function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      name: "Daftar Properti",
      href: "/agent/dashboard",
      icon: <ListCollapse className="h-4 w-4" />,
      exact: true,
    },
  ];

  if (role === "SUPERADMIN") {
    menuItems.push({
      name: "Kelola Akun Admin",
      href: "/agent/dashboard/admins",
      icon: <Users className="h-4 w-4" />,
      exact: false,
    });
    menuItems.push({
      name: "Audit Log Aktivitas",
      href: "/agent/dashboard/audit-log",
      icon: <History className="h-4 w-4" />,
      exact: false,
    });
  }

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
    <aside className="w-64 bg-[#161616] border-r border-zinc-900 flex flex-col justify-between h-screen sticky top-0 text-zinc-300 hidden md:flex">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-900">
        <Link href="/" className="flex items-center space-x-2">
          <Landmark className="h-6 w-6 text-[#C9A961]" />
          <span className="font-sans font-bold text-lg tracking-wider text-white">
            PRIME <span className="text-[#C9A961]">PROPERTY</span>
          </span>
        </Link>
      </div>

      {/* Menu Links */}
      <div className="flex-grow py-6 px-4 space-y-1">
        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-3 mb-2">
          Menu Agen
        </p>
        {menuItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 text-xs tracking-wider uppercase font-semibold transition-all duration-300 rounded-none relative group ${
                isActive
                  ? "bg-zinc-900/60 border-l-2 border-[#C9A961] text-[#C9A961]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
              }`}
            >
              <span className={`transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-3 text-xs tracking-wider uppercase font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span>Keluar Portal</span>
        </button>
      </div>
    </aside>
  );
}
