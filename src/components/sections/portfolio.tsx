"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import {
  PORTFOLIO_ITEMS,
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>(
    "All"
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = useCallback(
    (direction: number) => {
      if (lightboxIndex === null) return;
      const newIndex =
        (lightboxIndex + direction + filteredItems.length) %
        filteredItems.length;
      setLightboxIndex(newIndex);
    },
    [lightboxIndex, filteredItems.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIndex, navigateLightbox]);

  return (
    <section id="portfolio" className="section-padding bg-stone-50">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-bronze-600 text-sm font-semibold tracking-[0.2em] uppercase">
            Portfolio
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mt-4 mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Every project is a work of art that brings the unique beauty of
            natural stone to life in your spaces.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {PORTFOLIO_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeCategory === category
                  ? "bg-bronze-600 text-white shadow-lg shadow-bronze-600/25"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-bronze-300 hover:text-bronze-600"
              )}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-200">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${item.image})`,
                      backgroundColor: "#c9c4bd",
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-bronze-300 text-xs font-semibold tracking-wider uppercase">
                      {item.stone}
                    </span>
                    <h3
                      className="text-white text-lg font-bold mt-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox(-1);
              }}
              className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox(1);
              }}
              className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-full aspect-[16/10] rounded-2xl bg-cover bg-center"
                style={{
                  backgroundImage: `url(${filteredItems[lightboxIndex].image})`,
                  backgroundColor: "#3d3a36",
                }}
              />
              <div className="mt-6 text-center">
                <span className="text-bronze-400 text-sm font-semibold tracking-wider uppercase">
                  {filteredItems[lightboxIndex].stone}
                </span>
                <h3
                  className="text-white text-2xl md:text-3xl font-bold mt-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {filteredItems[lightboxIndex].title}
                </h3>
                <p className="text-white/60 mt-2">
                  {filteredItems[lightboxIndex].description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
