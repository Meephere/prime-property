"use client";

import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Compass, Award, Sparkles } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="h-7 w-7 text-[#C9A961]" />,
      title: "Trusted Agency",
      description:
        "Menjaga transparansi penuh dalam setiap negosiasi dan administrasi. Reputasi emas kami didukung oleh kepatuhan hukum 100% tervalidasi.",
    },
    {
      icon: <TrendingUp className="h-7 w-7 text-[#C9A961]" />,
      title: "Strategic Investment",
      description:
        "Setiap aset dianalisis secara mendalam berdasarkan potensi pertumbuhan modal (capital gain) dan yield sewa tahunan yang tinggi.",
    },
    {
      icon: <Compass className="h-7 w-7 text-[#C9A961]" />,
      title: "Prime Location",
      description:
        "Hanya memilih ruko komersial di poros bisnis utama dan villa mewah di kawasan prestisius dengan aksesibilitas terbaik.",
    },
    {
      icon: <Award className="h-7 w-7 text-[#C9A961]" />,
      title: "Professional Service",
      description:
        "Layanan konsultasi portofolio properti dipandu langsung oleh penasihat investasi senior bersertifikasi yang berdedikasi tinggi.",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } 
    },
  };

  return (
    <section className="py-28 bg-[#F5F5F5] px-4 sm:px-6 lg:px-8 border-t border-zinc-200 relative overflow-hidden">
      
      {/* Decorative luxury lines */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-zinc-200/50 pointer-events-none hidden lg:block"></div>
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-zinc-200/50 pointer-events-none hidden lg:block"></div>

      <div className="max-w-7xl mx-auto space-y-24 relative z-10">
        
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-zinc-200 pb-10">
          <div className="lg:col-span-8 space-y-4 text-left">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C9A961] font-bold flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-[#C9A961]" />
              VALUE PROPOSITION
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A] font-sans uppercase">
              MENGAPA PRIME PROPERTY?
            </h2>
          </div>
          <div className="lg:col-span-4 text-left lg:text-right">
            <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed max-w-sm ml-auto">
              Kami memposisikan diri sebagai mitra pertumbuhan finansial Anda melalui investasi properti premium terkemuka di kelasnya.
            </p>
          </div>
        </div>

        {/* Feature Grid (Asymmetrical Layout) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {features.map((feature, idx) => {
            // Apply slight vertical offset to odd index items on desktop for asymmetry
            const isOffset = idx % 2 === 1;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`bg-white border border-zinc-200 p-8 sm:p-10 flex flex-col justify-between hover:border-[#C9A961]/40 transition-all duration-500 rounded-none group h-full glow-gold-hover ${
                  isOffset ? "lg:translate-y-6" : ""
                }`}
              >
                <div className="space-y-6">
                  {/* Icon Block with Thin Accent Border */}
                  <div className="inline-flex items-center justify-center p-4 bg-[#F5F5F5] border border-zinc-200/50 group-hover:border-[#C9A961]/25 group-hover:bg-[#C9A961]/5 transition-all duration-500 rounded-none">
                    {feature.icon}
                  </div>
                  
                  {/* Title & Description */}
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] tracking-wider uppercase">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed text-left">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Subtle bottom design stroke */}
                <div className="h-[1px] w-8 bg-zinc-200 group-hover:bg-[#C9A961] transition-colors duration-500 mt-8"></div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
