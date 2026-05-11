"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

type HeroButton = { label: string; href: string; style: "primary" | "outline" };
type HeroSlide  = {
  id: string; title: string; accent: string;
  description: string; image_url: string;
  sort_order?: number; buttons?: HeroButton[];
};

const DEFAULT_BUTTONS: HeroButton[] = [
  { label: "View Our Projects", href: "#portfolio", style: "primary" },
  { label: "Get a Quote",       href: "#contact",   style: "outline"  },
];

export function HeroSection() {
  const [slides,       setSlides]       = useState<HeroSlide[]>([]);
  const [current,     setCurrent]      = useState(0);
  const [direction,   setDirection]    = useState(1);
  const [videoReady,  setVideoReady]   = useState(false);
  const [videoUrl,    setVideoUrl]     = useState("/video.mp4");
  const [paused,      setPaused]       = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch data ───────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/hero").then(r => r.json()).catch(() => []),
      fetch("/api/settings").then(r => r.json()).catch(() => ({})),
    ]).then(([heroData, settings]) => {
      if (Array.isArray(heroData) && heroData.length > 0) setSlides(heroData);
      if (settings?.hero_video_url) setVideoUrl(settings.hero_video_url);
    });
  }, []);

  // ── Video autoplay ───────────────────────────────────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const play = () => { setVideoReady(true); vid.play().catch(() => {}); };
    if (vid.readyState >= 2) { play(); return; }
    vid.addEventListener("canplay", play, { once: true });
    vid.load();
  }, [videoUrl]);

  // ── Auto-advance ─────────────────────────────────────────────────────────
  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const next = useCallback(() => {
    if (slides.length < 2) return;
    goTo((current + 1) % slides.length, 1);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    if (slides.length < 2) return;
    goTo((current - 1 + slides.length) % slides.length, -1);
  }, [current, slides.length, goTo]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    timerRef.current = setInterval(next, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next, slides.length]);

  const slide = slides[current];
  const buttons = slide?.buttons?.length ? slide.buttons : DEFAULT_BUTTONS;

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: 600 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Video background (always present) ───────────────────────────── */}
      <div className="absolute inset-0 z-0 bg-stone-900">
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          autoPlay muted loop playsInline preload="auto"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            videoReady ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* ── Slide image overlay (cross-fades per slide) ──────────────────── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: slide?.image_url ? `url(${slide.image_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </AnimatePresence>

      {/* ── Dark overlay ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/50 via-black/20 to-black/65 pointer-events-none" />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[3] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-3xl"
            >
              {/* Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-16 h-[2px] bg-gradient-to-r from-amber-500 to-transparent mb-6 origin-left"
              />

              {/* Brand */}
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 text-xs md:text-sm font-medium tracking-[0.25em] uppercase">
                  AIBA STONE
                </span>
              </div>

              {/* Heading */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-5 md:mb-7"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {slide?.title || "Natural Stone"}
                <br />
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  {slide?.accent || "Excellence"}
                </span>
              </h1>

              {/* Description */}
              <p className="text-white/70 text-sm md:text-lg max-w-xl leading-relaxed mb-8 md:mb-10">
                {slide?.description || "Premium natural stone and marble solutions for luxury spaces."}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                {buttons.map((btn, i) =>
                  btn.style === "primary" ? (
                    <Magnetic key={i} strength={0.1}>
                      <a
                        href={btn.href}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white px-7 py-3.5 md:px-9 md:py-4 rounded-full font-medium text-sm md:text-base transition-all shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 hover:scale-105 active:scale-95"
                      >
                        {btn.label}
                        <span className="ml-1">→</span>
                      </a>
                    </Magnetic>
                  ) : (
                    <Magnetic key={i} strength={0.1}>
                      <a
                        href={btn.href}
                        className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-7 py-3.5 md:px-9 md:py-4 rounded-full font-medium text-sm md:text-base transition-all hover:bg-white/10 backdrop-blur-sm hover:scale-105 active:scale-95"
                      >
                        {btn.label}
                      </a>
                    </Magnetic>
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Dots ────────────────────────────────────────────────────────── */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[4] flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className="relative overflow-hidden rounded-full cursor-pointer transition-all"
              style={{ width: i === current ? 40 : 10, height: 6 }}
              aria-label={`Slide ${i + 1}`}
            >
              <span className={cn(
                "absolute inset-0 rounded-full",
                i === current ? "bg-amber-400" : "bg-white/40"
              )} />
              {i === current && (
                <motion.span
                  key={`prog-${current}-${paused}`}
                  className="absolute inset-0 bg-white/30 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: paused ? 0 : 1 }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Prev / Next ──────────────────────────────────────────────────── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[4] w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-white items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[4] w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-white items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Scroll hint ─────────────────────────────────────────────────── */}
      <div className="hidden sm:flex absolute bottom-20 left-1/2 -translate-x-1/2 z-[4] flex-col items-center gap-2">
        <span className="text-white/35 text-[10px] tracking-[0.3em] uppercase font-medium">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/25 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1.5 bg-amber-400 rounded-full"
          />
        </div>
      </div>
    </section>
  );
}
