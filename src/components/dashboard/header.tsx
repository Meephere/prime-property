"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  
  // Notification States
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const body = await res.json();
        setNotifications(body.data || []);
        setUnreadCount(body.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Gagal mengambil data notifikasi:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.warn("Gagal menandai semua dibaca:", err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn("Gagal menandai dibaca:", err);
    }
  };

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
        <img src="/logo.png" alt="Prime Property Logo" className="h-6 w-auto" />
        <span className="font-sans font-bold text-sm tracking-wider text-white">
          PRIME <span className="text-[#C9A961]">PROPERTY</span>
        </span>
      </div>

      <div className="hidden md:block">
        <h1 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">
          Sistem Informasi Manajemen Properti
        </h1>
      </div>

      {/* Profile & Notification Wrapper */}
      <div className="flex items-center space-x-4">
        
        {/* Notification Bell Dropdown */}
        <div className="relative flex items-center">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="p-2 bg-[#161616] border border-zinc-800 text-zinc-400 hover:text-white relative hover:bg-zinc-900 transition-all duration-300 focus:outline-none cursor-pointer"
            title="Notifikasi"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#B33A3A] text-white text-[9px] font-bold flex items-center justify-center rounded-none border border-[#111111] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              {/* Overlay click catcher */}
              <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-[#161616] border border-zinc-800 shadow-2xl z-20 rounded-none text-zinc-300 top-8">
                {/* Popover Header */}
                <div className="p-3 border-b border-zinc-850 flex justify-between items-center bg-[#1F1F1F]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Notifikasi</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[9px] text-[#C9A961] hover:text-[#bca055] font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none"
                    >
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>

                {/* Popover List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-900 dashboard-scroll">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500 italic">
                      Tidak ada notifikasi baru.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.isRead) handleMarkSingleRead(notif.id);
                        }}
                        className={`p-3.5 space-y-1 hover:bg-zinc-900/50 transition-colors cursor-pointer relative ${
                          !notif.isRead ? "bg-[#C9A961]/2 border-l-2 border-l-[#C9A961]" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className={`text-xs font-bold ${!notif.isRead ? "text-white" : "text-zinc-400"}`}>
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="h-1.5 w-1.5 bg-[#C9A961] shrink-0 rounded-none ml-2 mt-1"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-zinc-500 block font-light">
                          {formatDate(notif.created_at)} pukul {new Date(notif.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
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
                    className="w-full flex items-center px-4 py-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors text-left border-none cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
