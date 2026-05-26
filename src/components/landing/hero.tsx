"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Landmark, ArrowRight, Compass, TrendingUp, ShieldCheck, DollarSign } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-[#1A1A1A] overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
      
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Subtle grid pattern in dark mode */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-60"></div>
        
        {/* Ambient golden lights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#C9A961]/6 blur-[130px] animate-float-slow"></div>
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-[#C9A961]/4 blur-[140px] animate-float-slow-reverse"></div>
        
        {/* Architectural diagonal accent line decorations */}
        <div className="absolute left-0 right-0 top-1/4 h-[0.5px] bg-gradient-to-r from-transparent via-[#C9A961]/10 to-transparent"></div>
        <div className="absolute left-1/3 inset-y-0 w-[0.5px] bg-gradient-to-b from-transparent via-[#C9A961]/5 to-transparent hidden lg:block"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Heading & Content */}
        <div className="lg:col-span-7 space-y-8 text-left">
          
          {/* Subtle Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-[#F5F5F5]/5 border border-[#C9A961]/20 backdrop-blur-sm"
          >
            <Landmark className="h-3.5 w-3.5 text-[#C9A961]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A961] font-bold">
              Luxury Investment Grade Properties
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="space-y-4"
          >
            <h1 className="font-sans font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05] uppercase">
              REDEFINE YOUR <br />
              <span className="text-[#C9A961] bg-gradient-to-r from-[#C9A961] via-[#E2C98A] to-[#C9A961] bg-clip-text text-transparent">
                LUXURY PORTFOLIO
              </span>
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              Kurasi ruko strategis dan villa eksklusif di kawasan finansial primer Indonesia. Memadukan estetika arsitektur kontemporer dengan pertumbuhan investasi jangka panjang yang matang.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Link
              href="#featured-properties"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-xs font-bold tracking-wider uppercase text-white bg-[#C9A961] hover:bg-[#E2C98A] transition-all duration-300 shadow-md shadow-[#C9A961]/10 hover:shadow-[#C9A961]/25 group border border-transparent rounded-none"
            >
              <span>Explore Collection</span>
              <Compass className="h-3.5 w-3.5 ml-2.5 transition-transform duration-300 group-hover:rotate-45" />
            </Link>
            
            <Link
              href="/kontak"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-xs font-bold tracking-wider uppercase text-[#C9A961] border border-[#C9A961]/50 hover:border-[#C9A961] bg-transparent hover:bg-white/5 transition-all duration-300 group rounded-none"
            >
              <span>Consultation Call</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Layered Asymmetrical Composition (Glass Panels) */}
        <div className="lg:col-span-5 relative h-[380px] sm:h-[450px] flex items-center justify-center lg:justify-end">
          
          {/* Main Floating Glass Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="w-full max-w-[360px] p-6 bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative z-10 space-y-6 rounded-none glow-gold"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">Live Market Feed</span>
              </div>
              <span className="text-[10px] font-bold text-[#C9A961] uppercase tracking-wider">Jakarta Prime</span>
            </div>

            {/* Metric 1 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-light flex items-center">
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-[#C9A961]" />
                  Average Annual Yield
                </span>
                <span className="text-xs font-bold text-white font-mono">+12.4%</span>
              </div>
              <div className="h-1 bg-zinc-800 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "82%" }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  className="h-full bg-[#C9A961]"
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-light flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1.5 text-[#C9A961]" />
                  Total Assets Under Mgmt
                </span>
                <span className="text-xs font-bold text-white font-mono">Rp 4.2T+</span>
              </div>
              <div className="h-1 bg-zinc-800 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 1.5, delay: 1.0 }}
                  className="h-full bg-[#C9A961]"
                />
              </div>
            </div>

            {/* List of Regions */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <p className="text-[9px] uppercase font-bold text-[#C9A961] tracking-widest">Active Investment Nodes</p>
              <div className="flex flex-wrap gap-1.5">
                {["SCBD", "Menteng", "PIK Golf", "Uluwatu Villa"].map((node, i) => (
                  <span key={i} className="text-[9px] font-medium tracking-wider px-2 py-1 bg-white/5 border border-white/5 text-zinc-300">
                    {node}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Secondary Layered Card - Offset Left/Behind */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: -30 }}
            animate={{ opacity: 0.75, x: -40, y: -40 }}
            transition={{ duration: 1.2, delay: 0.45 }}
            className="absolute left-0 top-12 w-[240px] p-4 bg-[#1A1A1A] border border-white/5 backdrop-blur-md shadow-lg pointer-events-none hidden sm:block rounded-none text-left"
          >
            <div className="flex items-center space-x-2 text-[#C9A961] mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[9px] uppercase font-bold tracking-widest">A-Grade Legal Protection</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-light leading-relaxed">
              Setiap transaksi didukung pengawasan legalitas 100% tervalidasi dan transparansi sertifikat penuh.
            </p>
          </motion.div>

          {/* Decorative architectural circle lines background */}
          <div className="absolute right-0 bottom-0 w-[300px] h-[300px] border border-[#C9A961]/10 rounded-full pointer-events-none select-none -mr-12 -mb-12"></div>
        </div>
      </div>

      {/* Elegant scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1.5 pointer-events-none select-none">
        <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#C9A961] to-transparent animate-[pulse_2s_infinite]"></div>
      </div>

    </section>
  );
}
