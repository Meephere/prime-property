"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ElegantBackground from "@/components/elegant-bg";
import PageAnimate from "@/components/page-animate";
import Preloader from "@/components/preloader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("prime_property_preloader_seen");
    if (hasSeen === "true") {
      setShowPreloader(false);
    }
  }, []);

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("prime_property_preloader_seen", "true");
    setShowPreloader(false);
  };

  return (
    <div className="flex flex-col min-h-screen relative bg-white">
      <AnimatePresence mode="wait">
        {showPreloader && (
          <Preloader onComplete={handlePreloaderComplete} />
        )}
      </AnimatePresence>

      {/* Aesthetic background elements */}
      <ElegantBackground />

      <Navbar />
      <main className="flex-grow flex flex-col relative z-10">
        <PageAnimate>
          {children}
        </PageAnimate>
      </main>
      <Footer />
    </div>
  );
}
