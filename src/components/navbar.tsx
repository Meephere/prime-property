"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Landmark } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tentang Kami", href: "/tentang-kami" },
    { name: "Kontak", href: "/kontak" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1A1A1A]/95 backdrop-blur-md border-b border-zinc-800 shadow-lg"
          : "bg-[#1A1A1A] border-b border-zinc-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Landmark className="h-6 w-6 sm:h-8 sm:w-8 text-[#C9A961] transition-transform duration-300 group-hover:scale-105" />
            <span className="font-sans font-bold text-lg sm:text-2xl tracking-wider text-white">
              PRIME <span className="text-[#C9A961]">PROPERTY</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-2 text-sm tracking-wide uppercase transition-colors duration-200 ${
                      isActive ? "text-[#C9A961]" : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A961]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Show when="signed-in">
                <div className="border-l border-zinc-700 pl-4">
                  <UserButton appearance={{
                    elements: {
                      userButtonAvatarBox: "border border-[#C9A961]/40"
                    }
                  }} />
                </div>
              </Show>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-none text-zinc-300 hover:text-white hover:bg-zinc-800 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1A1A1A] border-b border-zinc-800"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-base font-medium tracking-wide uppercase ${
                      isActive ? "text-[#C9A961] bg-zinc-900" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-4 pb-2 px-3 flex flex-col space-y-3">
                <Show when="signed-in">
                  <div className="flex justify-center py-2 border-t border-zinc-800 pt-4">
                    <UserButton />
                  </div>
                </Show>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
