"use client";

import { motion } from "framer-motion";
import { Landmark, Compass, Target, ShieldCheck, Sparkles, Calendar } from "lucide-react";
import ElegantBackground from "@/components/elegant-bg";

export default function AboutUsPage() {
  const values = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-[#C9A961]" />,
      title: "Integritas & Kepercayaan",
      desc: "Menjaga transparansi penuh dalam setiap negosiasi, administrasi legalitas, dan komitmen investasi klien.",
    },
    {
      icon: <Target className="h-6 w-6 text-[#C9A961]" />,
      title: "Kualitas Kurasi Premium",
      desc: "Setiap portofolio ruko dan villa melalui proses uji kelayakan struktur dan nilai komersial yang ketat.",
    },
    {
      icon: <Compass className="h-6 w-6 text-[#C9A961]" />,
      title: "Orientasi Imbal Hasil",
      desc: "Menganalisis perkembangan tata kota dan tren regional secara mendalam guna memaksimalkan ROI jangka panjang.",
    },
  ];

  const timeline = [
    {
      year: "2018",
      title: "Founding & Strategic Vision",
      desc: "Didirikan di Jakarta dengan visi tunggal mengurasi properti komersial berdaya tinggi."
    },
    {
      year: "2021",
      title: "Luxury Residential Curations",
      desc: "Ekspansi portofolio ke sektor villa mewah eksklusif di Uluwatu, Canggu, dan Sentul."
    },
    {
      year: "2024",
      title: "Rp 4.2 Triliun Milestone",
      desc: "Tercapainya pengelolaan transaksi aset kumulatif terverifikasi dengan tingkat kepuasan klien 100%."
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <div className="bg-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-[#1A1A1A] relative overflow-hidden">
      
      {/* Background Ornaments */}
      <ElegantBackground />
      <div className="absolute top-1/4 left-10 inset-y-0 w-[1px] bg-zinc-200/50 pointer-events-none hidden xl:block"></div>
      <div className="absolute top-1/4 right-10 inset-y-0 w-[1px] bg-zinc-200/50 pointer-events-none hidden xl:block"></div>

      <div className="max-w-7xl mx-auto space-y-28 relative z-10">
        
        {/* Editorial Title Block */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A961] font-bold flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 mr-2 text-[#C9A961]" />
            COMPANY PROFILE
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1A1A] uppercase">
            TENTANG PRIME PROPERTY
          </h1>
          {/* Subtle animated divider */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="h-[2px] bg-[#C9A961] mx-auto"
          />
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Column 1: Typography Editorial Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1A1A1A] tracking-wide leading-tight uppercase">
              KAMI MENJEMBATANI <br />
              INVESTASI PROPERTI KELAS ATAS
            </h2>
            <p className="text-sm sm:text-base text-zinc-650 font-light leading-relaxed">
              Prime Property memfokuskan eksistensinya sebagai agensi kurator properti mewah independen. Kami percaya bahwa kepemilikan real estat eksklusif bukan sekadar pencarian bangunan fisik, melainkan penempatan modal strategis di kawasan dengan pertumbuhan ekonomi tinggi.
            </p>
            <p className="text-sm sm:text-base text-zinc-650 font-light leading-relaxed">
              Tim penasihat investasi kami menyaring portofolio secara selektif, memastikan ruko komersial yang kami hadirkan berada di area lalu lintas tinggi, dan villa mewah kami memiliki kelengkapan hukum bersih serta estetika desain bernilai seni tinggi.
            </p>
          </motion.div>

          {/* Column 2: Cinematic Quote Box */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-5 bg-[#F5F5F5] border border-zinc-200 p-8 sm:p-12 relative flex flex-col justify-center overflow-hidden rounded-none shadow-xl text-left"
          >
            {/* Ambient gold glow in card */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C9A961]/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-8">
              <Landmark className="h-10 w-10 text-[#C9A961]" />
              <blockquote className="text-base sm:text-lg italic font-medium text-zinc-800 leading-relaxed">
                &ldquo;Kemewahan sejati bukanlah tentang harga yang tinggi, melainkan tentang nilai yang abadi, legalitas yang tak tergoyahkan, dan lokasi yang tepercaya.&rdquo;
              </blockquote>
              <div className="h-[1px] w-12 bg-[#C9A961]"></div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">Prasetyo Wibowo</p>
                <p className="text-xs text-[#C9A961] uppercase tracking-[0.2em] font-semibold mt-1">Founder & Managing Director</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Corporate History Timeline */}
        <div className="border-t border-zinc-200 pt-20 space-y-16">
          <div className="text-left max-w-md">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A961] font-bold">HISTORICAL MILESTONES</span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-wide text-[#1A1A1A] uppercase mt-2">Perjalanan Kami</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {timeline.map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-[#F5F5F5] border border-zinc-200 p-8 flex flex-col space-y-4 rounded-none group hover:border-[#C9A961]/30 transition-all duration-300 relative text-left"
              >
                {/* Gold glowing timeline dot */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#C9A961]/10 border border-[#C9A961]/25 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-[#C9A961]" />
                  </div>
                  <span className="font-mono text-xl font-bold text-[#C9A961]">{step.year}</span>
                </div>
                <h4 className="font-bold text-[#1A1A1A] text-base uppercase tracking-wider">{step.title}</h4>
                <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Nilai Perusahaan */}
        <div className="border-t border-zinc-200 pt-20 space-y-16">
          <div className="text-center max-w-sm mx-auto space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A961] font-bold">GUIDING PRINCIPLES</span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-wide text-[#1A1A1A] uppercase">Nilai Perusahaan</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="bg-white border border-zinc-200 p-8 flex flex-col space-y-4 rounded-none shadow-md hover:border-[#C9A961]/40 transition-all duration-500 text-left relative group">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A961] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <div className="inline-flex items-center justify-center p-3 bg-[#F5F5F5] border border-zinc-200/50 w-12 h-12">
                  {val.icon}
                </div>
                <h4 className="font-bold text-[#1A1A1A] text-base uppercase tracking-wider">{val.title}</h4>
                <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
