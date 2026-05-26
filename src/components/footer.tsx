import Link from "next/link";
import { Landmark, Mail, Phone, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F5F5F5] border-t border-zinc-200 text-[#1A1A1A] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Landmark className="h-6 w-6 text-[#C9A961]" />
              <span className="font-sans font-bold text-xl tracking-wider text-[#1A1A1A]">
                PRIME <span className="text-[#C9A961]">PROPERTY</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-600 max-w-sm leading-relaxed">
              Agensi properti premium tepercaya yang menyediakan ruko dan villa eksklusif dengan lokasi strategis dan nilai investasi tinggi.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#C9A961] uppercase tracking-widest">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/" className="hover:text-black transition-colors duration-200 flex items-center group">
                  <span>Beranda</span>
                </Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="hover:text-black transition-colors duration-200 flex items-center group">
                  <span>Tentang Kami</span>
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-black transition-colors duration-200 flex items-center group">
                  <span>Hubungi Kami</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#C9A961] uppercase tracking-widest">Kontak Resmi</h3>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-[#C9A961] flex-shrink-0" />
                <a 
                  href="https://wa.me/6281234567890" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-black transition-colors duration-200 flex items-center"
                >
                  <span>+62 812-3456-7890</span>
                  <ArrowUpRight className="h-3 w-3 ml-1 text-[#C9A961]" />
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-[#C9A961] flex-shrink-0" />
                <a href="mailto:info@primeproperty.com" className="hover:text-black transition-colors duration-200">
                  info@primeproperty.com
                </a>
              </li>
              <li className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-200">
                Jl. Sudirman No. 88, Kav. 12-14, Jakarta Selatan, Indonesia
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-zinc-200 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500">
          <p>© {currentYear} Prime Property. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
