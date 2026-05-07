"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from "lucide-react";
import { springs, staggerContainer, staggerItem, sectionHeader, easings } from "@/lib/motion";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
type ImageEntry = { url: string; focal_x: number; focal_y: number };

type PortfolioItem = {
  id: string;
  title: string;
  stone_type: string;
  image_url: string;
  description: string | null;
  images?: ImageEntry[];
  category: { id: string; name: string; slug: string } | null;
};

type UiItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  images: ImageEntry[];   // always at least 1
  stone: string;
};

type Category = { id: string; name: string; slug: string };

// ── Helpers ────────────────────────────────────────────────────────────────────
function toImages(item: PortfolioItem): ImageEntry[] {
  if (Array.isArray(item.images) && item.images.length > 0) return item.images;
  if (item.image_url) return [{ url: item.image_url, focal_x: 50, focal_y: 50 }];
  return [];
}

function toUiItem(item: PortfolioItem): UiItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category?.name || "Other",
    description: item.description || "",
    images: toImages(item),
    stone: item.stone_type,
  };
}

// ── Hover-cycling card ─────────────────────────────────────────────────────────
function MaterialCard({
  item,
  onClick,
}: {
  item: UiItem;
  onClick: (startIdx: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMultiple = item.images.length > 1;
  const current = item.images[idx] ?? item.images[0];

  const advance = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIdx((p) => (p + 1) % item.images.length);
      setFading(false);
    }, 200);
  }, [item.images.length]);

  const startCycle = () => {
    if (!hasMultiple) return;
    intervalRef.current = setInterval(advance, 1400);
  };

  const stopCycle = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIdx(0);
    setFading(false);
  };

  return (
    <motion.div
      variants={staggerItem}
      className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-100 hover:shadow-xl transition-all duration-500 cursor-pointer"
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
      onClick={() => onClick(idx)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
        <img
          src={current.url}
          alt={item.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
            fading ? "opacity-0" : "opacity-100"
          )}
          style={{ objectPosition: `${current.focal_x}% ${current.focal_y}%` }}
        />

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

        {/* zoom icon */}
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <ZoomIn className="h-4 w-4 text-white" />
        </div>

        {/* multi-photo badge */}
        {hasMultiple && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Images className="h-3 w-3 text-white" />
            <span className="text-[11px] font-medium text-white">{item.images.length}</span>
          </div>
        )}

        {/* dot indicators */}
        {hasMultiple && (
          <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "block h-1 rounded-full transition-all duration-300",
                  i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        )}

        {/* name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white font-bold text-sm leading-tight truncate" style={{ fontFamily: "var(--font-playfair)" }}>
            {item.title}
          </p>
          <p className="text-white/70 text-xs mt-0.5">{item.stone}</p>
        </div>
      </div>

      {/* Category tag */}
      {item.category && item.category !== "Other" && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-stone-700 shadow-sm group-hover:opacity-0 transition-opacity duration-200">
          {item.category}
        </div>
      )}
    </motion.div>
  );
}

// ── Lightbox ───────────────────────────────────────────────────────────────────
function Lightbox({
  item,
  startIdx,
  onClose,
}: {
  item: UiItem;
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const current = item.images[idx];

  const prev = () => setIdx((p) => (p - 1 + item.images.length) % item.images.length);
  const next = () => setIdx((p) => (p + 1) % item.images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={springs.gentle}
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Image */}
        <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-stone-950">
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={current.url}
              alt={item.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-h-[70vh] object-contain"
              style={{ objectPosition: `${current.focal_x}% ${current.focal_y}%` }}
            />
          </AnimatePresence>

          {/* Prev / Next */}
          {item.images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Info + thumbnails */}
        <div className="mt-4 flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
              {item.title}
            </h3>
            <p className="text-white/60 text-sm mt-1">{item.stone} {item.category !== "Other" ? `· ${item.category}` : ""}</p>
            {item.description && (
              <p className="text-white/50 text-sm mt-2 line-clamp-2">{item.description}</p>
            )}
          </div>

          {/* Thumbnail strip */}
          {item.images.length > 1 && (
            <div className="flex gap-2 shrink-0 overflow-x-auto max-w-xs pb-1">
              {item.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "relative w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-all",
                    i === idx ? "ring-2 ring-white scale-105" : "opacity-50 hover:opacity-80"
                  )}
                >
                  <img
                    src={img.url} alt={`thumb ${i + 1}`}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `${img.focal_x}% ${img.focal_y}%` }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Counter */}
        {item.images.length > 1 && (
          <p className="text-white/40 text-xs text-center mt-3">
            {idx + 1} / {item.images.length} · ← → ile geçiş yapın
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState<UiItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lightbox, setLightbox] = useState<{ item: UiItem; startIdx: number } | null>(null);
  const { sections } = useSettings();
  const sec = sections.portfolio;
  const titleBase = sec.title.replace(sec.title_accent, "").trim();
  const titleAccentFirst = sec.title.startsWith(sec.title_accent);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([fetch("/api/portfolio"), fetch("/api/categories")]);
        const pData = await pRes.json();
        const cData = await cRes.json();
        if (!active) return;
        if (Array.isArray(pData) && pData.length > 0) {
          setItems(pData.map(toUiItem));
          setCategories(["All", ...cData.map((c: Category) => c.name)]);
        }
      } catch {}
      if (active) setLoaded(true);
    };
    fetchData();
    return () => { active = false; };
  }, []);

  if (!loaded || items.length === 0) return null;

  const filtered = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <section id="portfolio" className="section-padding bg-stone-50">
      <div className="container-luxury">
        {/* Header */}
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-bronze-600 text-sm font-semibold tracking-[0.2em] uppercase">
            {sec.subtitle}
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mt-4 mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {titleAccentFirst ? (
              <><span className="text-gradient">{sec.title_accent}</span>{" "}{titleBase}</>
            ) : (
              <>{titleBase}{" "}<span className="text-gradient">{sec.title_accent}</span></>
            )}
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">{sec.description}</p>
        </motion.div>

        {/* Category filter */}
        {categories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === cat
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((item) => (
            <MaterialCard
              key={item.id}
              item={item}
              onClick={(startIdx) => setLightbox({ item, startIdx })}
            />
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            item={lightbox.item}
            startIdx={lightbox.startIdx}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
