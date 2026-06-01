"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";


interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [skipVisible, setSkipVisible] = useState(false);

  useEffect(() => {
    // Show skip button after 1.5s
    const skipTimer = setTimeout(() => {
      setSkipVisible(true);
    }, 1500);

    // Auto complete after 3.2s (including animations)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Split text for word-by-word animation
  const brandName = "PRIME PROPERTY";
  const words = brandName.split(" ");

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ 
        y: "-100%",
        transition: { 
          duration: 0.85, 
          ease: [0.76, 0, 0.24, 1] as const // Custom luxury cubic-bezier ease-in-out
        }
      }}
      className="fixed inset-0 z-[100] bg-[#1A1A1A] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Background design dots & grid */}
      <div className="absolute inset-0 bg-lux-grid opacity-20 pointer-events-none"></div>
      
      {/* Golden glowing radial light in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#C9A961]/5 blur-[120px] pointer-events-none"></div>

      <div className="relative flex flex-col items-center justify-center space-y-8 z-10">
        
        {/* Animated Landmark Emblem Icon */}
        <div className="relative flex items-center justify-center">
          {/* Decorative outer golden circle drawing */}
          <motion.svg
            width="120"
            height="120"
            className="absolute"
            viewBox="0 0 120 120"
          >
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#C9A961"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              initial={{ pathLength: 0, rotate: -90 }}
              animate={{ 
                pathLength: 1, 
                rotate: 270,
                transition: { duration: 1.8, ease: "easeInOut" }
              }}
            />
            <motion.circle
              cx="60"
              cy="60"
              r="56"
              fill="none"
              stroke="#C9A961"
              strokeWidth="0.5"
              strokeOpacity="0.2"
              strokeDasharray="4 4"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </motion.svg>

          {/* Core Landmark Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1],
              scale: [0.5, 1, 1.05],
              transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] as const } 
            }}
            className="p-4 rounded-full bg-[#1A1A1A] border border-[#C9A961]/10 shadow-xl relative z-10 flex items-center justify-center"
          >
            <img src="/logo.png" alt="Prime Property Logo" className="h-12 w-auto sm:h-14" />
          </motion.div>
        </div>

        {/* Animated Brand Text */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex space-x-2.5 overflow-hidden">
            {words.map((word, wIdx) => (
              <motion.span
                key={wIdx}
                initial={{ y: 35, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { 
                    duration: 0.8, 
                    delay: 0.6 + wIdx * 0.2, 
                    ease: [0.16, 1, 0.3, 1] as const 
                  }
                }}
                className={`font-sans font-bold text-xl sm:text-2xl tracking-[0.25em] uppercase ${
                  word === "PROPERTY" ? "text-[#C9A961]" : "text-white"
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.45,
              transition: { duration: 1, delay: 1.3 } 
            }}
            className="text-[9px] sm:text-[10px] text-white tracking-[0.4em] uppercase font-light"
          >
            Premium Real Estate Agency
          </motion.p>

          {/* Subtle Golden Underline */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ 
              width: "120px",
              transition: { duration: 1.2, delay: 1.0, ease: "easeInOut" } 
            }}
            className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A961]/60 to-transparent mt-3"
          />
        </div>
      </div>

      {/* Skip Button (Lewati Intro) */}
      {skipVisible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onComplete}
          className="absolute bottom-10 px-5 py-2 border border-zinc-700/60 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-[#C9A961] hover:border-[#C9A961]/40 bg-zinc-900/30 transition-all duration-300 rounded-none cursor-pointer"
        >
          Lewati Intro
        </motion.button>
      )}
    </motion.div>
  );
}
